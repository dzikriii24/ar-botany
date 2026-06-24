// WebXR Markerless Hit-Test Logic
AFRAME.registerComponent('botani-hit-test', {
    schema: { target: { type: 'selector' } },
    init: function () {
        this.xrHitTestSource = null;
        this.viewerSpace = null;
        this.refSpace = null;
        
        const startAr = () => {
            if (this.xrHitTestSource) {
                console.log("[Botani Hit Test] Hit-test source sudah aktif. Mengabaikan inisialisasi ulang.");
                return;
            }
            
            console.log("[Botani Hit Test] Menginisialisasi WebXR hit-test...");
            let session = this.el.sceneEl.renderer.xr.getSession();
            if (!session) {
                console.error("[Botani Hit Test] ERROR: WebXR session tidak ditemukan pada renderer.");
                return;
            }
            
            // 1. Request viewer space untuk melakukan hit testing dari sudut pandang kamera
            session.requestReferenceSpace('viewer').then((space) => {
                this.viewerSpace = space;
                session.requestHitTestSource({ space: this.viewerSpace }).then((hitTestSource) => {
                    this.xrHitTestSource = hitTestSource;
                    console.log("[Botani Hit Test] SUCCESS: Hit-test source berhasil dibuat.");
                }).catch(err => {
                    console.error("[Botani Hit Test] ERROR: Gagal membuat hit-test source:", err);
                });
            }).catch(err => {
                console.error("[Botani Hit Test] ERROR: Gagal mengambil reference space 'viewer':", err);
            });
            
            // 2. Request reference space untuk koordinat dunia (world coordinates)
            this.refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
            
            if (!this.refSpace) {
                console.log("[Botani Hit Test] getReferenceSpace() null. Mencoba request 'local-floor'...");
                session.requestReferenceSpace('local-floor').then((space) => {
                    this.refSpace = space;
                    console.log("[Botani Hit Test] SUCCESS: 'local-floor' reference space didapatkan.");
                }).catch(err => {
                    console.warn("[Botani Hit Test] WARNING: Gagal mengambil 'local-floor', mencoba 'local'...", err);
                    session.requestReferenceSpace('local').then((space) => {
                        this.refSpace = space;
                        console.log("[Botani Hit Test] SUCCESS: 'local' reference space didapatkan.");
                    }).catch(err2 => {
                        console.error("[Botani Hit Test] ERROR: Gagal mengambil 'local' reference space:", err2);
                    });
                });
            } else {
                console.log("[Botani Hit Test] Reference Space berhasil didapatkan dari A-Frame.");
            }
        };

        if (this.el.sceneEl.renderer.xr) {
            this.el.sceneEl.renderer.xr.addEventListener('sessionstart', startAr);
        }
        
        this.el.sceneEl.addEventListener('enter-vr', () => {
            if (this.el.sceneEl.is('ar-mode')) {
                console.log("[Botani Hit Test] Event 'enter-vr' terdeteksi (AR-mode).");
                startAr();
            }
        });
        
        if (this.el.sceneEl.renderer.xr) {
            this.el.sceneEl.renderer.xr.addEventListener('sessionend', (ev) => {
                console.log("[Botani Hit Test] Sesi WebXR berakhir. Membersihkan hit-test components.");
                this.xrHitTestSource = null;
                this.viewerSpace = null;
                this.refSpace = null;
            });
        }
    },
    tick: function () {
        if (!this.el.sceneEl.is('ar-mode')) return;
        
        if (!this.refSpace && this.el.sceneEl.renderer.xr) {
            this.refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
        }
        
        if (this.xrHitTestSource && this.refSpace) {
            let frame = this.el.sceneEl.frame;
            if (!frame) return;
            
            let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
            if (hitTestResults.length > 0) {
                let pose = hitTestResults[0].getPose(this.refSpace);
                if (pose) {
                    this.data.target.setAttribute('visible', 'true');
                    this.data.target.object3D.position.copy(pose.transform.position);
                    
                    // Rekam Y lantai terakhir ke drop-handler untuk menghindari melayang saat tracking hilang
                    const dropHandler = this.el.sceneEl.components['drop-handler'];
                    if (dropHandler) {
                        dropHandler.lastGroundY = pose.transform.position.y;
                    }
                } else {
                    this.data.target.setAttribute('visible', 'false');
                }
            } else {
                this.data.target.setAttribute('visible', 'false');
            }
        }
    }
});

AFRAME.registerComponent('drop-handler', {
    init: function () {
        console.log("[Drop Handler] Komponen drop-handler berhasil diinisialisasi pada scene.");
        this.reticle = document.getElementById('reticle');
        
        // Dapatkan semua elemen overlay UI konfirmasi
        const dropConfirmPanel = document.getElementById('drop-confirm-panel');
        const btnConfirmYes = document.getElementById('btn-confirm-yes');
        const btnConfirmNo = document.getElementById('btn-confirm-no');
        
        const deleteConfirmPanel = document.getElementById('delete-confirm-panel');
        const btnDeleteYes = document.getElementById('btn-delete-yes');
        const btnDeleteNo = document.getElementById('btn-delete-no');
        
        const btnClearAll = document.getElementById('btn-clear-all');
        const dropDrawer = document.getElementById('drop-drawer');
        const dropInstructions = document.getElementById('drop-instructions');
        
        // Panel & tombol kembali ke Scan QR
        const backToScanPanel = document.getElementById('back-to-scan-panel');
        const btnBackToScan = document.getElementById('btn-back-to-scan');
        
        // State tracking
        this.tempStandee = null;      // Objek standee preview yang sedang dalam tahap konfirmasi drop
        this.selectedStandee = null;  // Objek standee permanent yang sedang dipilih untuk dihapus
        this.lastGroundY = null;      // Posisi ketinggian Y lantai terakhir yang berhasil dideteksi
        this.isAutoPreview = false;   // Menandakan apakah preview sedang terkunci mengikuti retikel/kamera (Auto Mode)
        let selectRegistered = false;
        
        // Sembunyikan panel konfirmasi & kembali di awal
        if (dropConfirmPanel) dropConfirmPanel.classList.add('hidden');
        if (deleteConfirmPanel) deleteConfirmPanel.classList.add('hidden');
        if (backToScanPanel) backToScanPanel.classList.add('hidden');

        // BLOCKER GLOBAL: Cegah event WebXR 'select' mendeteksi ketukan di atas elemen HTML UI
        window.blockArDropThisFrame = false;
        const blockInput = (ev) => {
            if (ev.target && typeof ev.target.closest === 'function') {
                const interactive = ev.target.closest('.pointer-events-auto') || 
                                    ev.target.closest('button') || 
                                    ev.target.closest('nav') || 
                                    ev.target.closest('.retro-btn') || 
                                    ev.target.closest('.drop-drawer-item') ||
                                    ev.target.closest('.retro-card');
                if (interactive) {
                    window.blockArDropThisFrame = true;
                    console.log("[Drop Blocker] Menangkap interaksi UI. Memblokir drop AR.");
                    setTimeout(() => {
                        window.blockArDropThisFrame = false;
                    }, 150); // Blokir input selama 150ms
                }
            }
        };
        window.addEventListener('touchstart', blockInput, { capture: true, passive: true });
        window.addEventListener('mousedown', blockInput, { capture: true });

        // Gunakan fungsi terpusat untuk melempar objek
        const performDrop = (e) => {
            console.log("[Drop Handler] Event terpicu:", e ? e.type : "manual");

            // CEK BLOCKER GLOBAL
            if (window.blockArDropThisFrame) {
                console.log("[Drop Handler] Drop dibatalkan karena terblokir oleh interaksi UI.");
                return;
            }

            const isArMode = this.el.sceneEl.is('ar-mode');
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // HP FIX: Pada perangkat mobile, hanya izinkan drop jika sudah masuk ke mode AR.
            if (isMobile && !isArMode) {
                console.log("[Drop Handler] Mengabaikan ketukan di HP karena belum masuk ke mode AR.");
                return;
            }

            // MENCEGAH DOUBLE SPAM: Jika sedang di AR-mode, abaikan click/touchstart biasa dari window.
            if (isArMode && e && (e.type === 'click' || e.type === 'touchstart')) {
                console.log("[Drop Handler] Mengabaikan event " + e.type + " di AR-mode karena 'select' yang akan memproses.");
                return;
            }

            // Jika sedang dalam tahap konfirmasi drop objek sebelumnya, abaikan ketukan baru!
            if (this.tempStandee) {
                console.log("[Drop Handler] Sedang menunggu konfirmasi penempatan objek. Mengabaikan ketukan baru.");
                return;
            }

            // Jika sedang dalam tahap konfirmasi hapus objek, batalkan pilihan (deselect) dan abaikan drop baru
            if (this.selectedStandee) {
                console.log("[Drop Handler] Sedang dalam konfirmasi penghapusan objek. Membatalkan pilihan.");
                deselectForDeletion();
                return;
            }

            // Jika yang diklik adalah UI (laci, tombol, navbar, panel konfirmasi), abaikan!
            if (e && e.target && typeof e.target.closest === 'function') {
                if (e.target.closest('.pointer-events-auto') || e.target.closest('nav') || e.target.closest('button') || e.target.closest('.a-enter-vr-button')) {
                    console.log("[Drop Handler] Tap terdeteksi pada elemen UI / Tombol AR. Drop dibatalkan.");
                    return;
                }
            }
            
            // JIKA kursor/raycaster mengarah ke objek .collidable yang sudah ada, jangan drop objek baru!
            const cameraRig = document.querySelector('[camera]');
            const raycaster = cameraRig ? cameraRig.components.raycaster : null;
            if (raycaster && raycaster.intersectedEls.length > 0) {
                console.log("[Drop Handler] Tap menabrak objek yang sudah ada. Mengabaikan pembuatan objek baru.");
                return;
            }
            
            // Check if user has selected an image from the drawer
            if (!window.activeDropImage) {
                console.warn("[Drop Handler] Drop dibatalkan karena belum ada gambar tanaman yang dipilih dari laci.");
                if (e) alert("Pilih gambar dari laci koleksi di bawah terlebih dahulu!");
                return;
            }

            let position;
            // Gunakan visual object3D.visible & position secara langsung, jangan getAttribute() agar nilainya real-time
            if (this.reticle && this.reticle.object3D.visible) {
                position = this.reticle.object3D.position.clone();
                this.lastGroundY = position.y;
                console.log("[Drop Handler] Lantai terdeteksi! Menggunakan posisi retikel:", position);
            } else {
                // FALLBACK INSTAN: Jika lantai gagal dideteksi, letakkan objek 1.5 meter di depan kamera!
                console.log("[Drop Handler] Lantai belum terdeteksi. Menjalankan fallback di depan kamera (1.5m).");
                const cameraObj = cameraRig.object3D;
                const pos = new THREE.Vector3(0, 0, -1.5);
                pos.applyMatrix4(cameraObj.matrixWorld);
                
                if (this.lastGroundY !== undefined && this.lastGroundY !== null) {
                    pos.y = this.lastGroundY;
                } else {
                    pos.y = cameraObj.position.y - 1.5;
                }
                position = pos;
            }
            
            // Sembunyikan panel kembali ke scan QR jika terbuka
            if (backToScanPanel) backToScanPanel.classList.add('hidden');
            
            // 1. Buat kontainer standee sebagai PREVIEW
            const standee = document.createElement('a-entity');
            standee.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            
            // 2. Buat gambar standee (2D billboard) dengan opacity 0.5 (semi-transparan)
            const img = document.createElement('a-image');
            img.setAttribute('src', window.activeDropImage);
            img.setAttribute('crossorigin', 'anonymous');
            img.setAttribute('width', '0.5'); 
            img.setAttribute('height', '0.5');
            img.setAttribute('position', '0 0.25 0');
            img.setAttribute('opacity', '0.6'); // Semi-transparan untuk preview
            img.setAttribute('transparent', 'true');
            img.setAttribute('look-at', '[camera]');

            // 3. Buat base box berwarna KUNING untuk menandakan preview/konfirmasi
            const baseBox = document.createElement('a-box');
            baseBox.setAttribute('color', '#F5D76E'); // Kuning untuk konfirmasi
            baseBox.setAttribute('depth', '0.2');
            baseBox.setAttribute('height', '0.05');
            baseBox.setAttribute('width', '0.5');
            baseBox.setAttribute('position', '0 0.025 0');
            
            // Hubungkan elemen
            standee.appendChild(baseBox);
            standee.appendChild(img);
            
            // Tambahkan ke scene
            this.el.sceneEl.appendChild(standee);
            this.tempStandee = standee;
            
            // Jika e adalah null, berarti dipicu otomatis (auto preview dari hasil scan)
            if (e === null) {
                this.isAutoPreview = true;
                console.log("[Drop Handler] Auto-preview diaktifkan. Standee preview mengunci ke retikel/kamera...");
            } else {
                this.isAutoPreview = false;
            }
            
            // Tampilkan panel konfirmasi drop, sembunyikan laci & instruksi
            if (dropConfirmPanel) dropConfirmPanel.classList.remove('hidden');
            if (dropDrawer) dropDrawer.classList.add('hidden');
            if (dropInstructions) dropInstructions.classList.add('hidden');
            if (btnClearAll) btnClearAll.classList.add('hidden');
        };

        // Aksi Konfirmasi Drop - YA, PLACE
        const confirmPlace = () => {
            if (!this.tempStandee) return;
            console.log("[Drop Handler] Pengguna mengonfirmasi penempatan objek.");
            
            this.isAutoPreview = false; // Matikan mode auto follow
            const standee = this.tempStandee;
            const img = standee.querySelector('a-image');
            const baseBox = standee.querySelector('a-box');
            
            // Ubah opacity gambar jadi penuh (solid)
            if (img) {
                img.setAttribute('opacity', '1.0');
                img.setAttribute('transparent', 'false');
            }
            
            // Ubah warna alas menjadi hijau kembali
            if (baseBox) {
                baseBox.setAttribute('color', '#4CAF50');
            }
            
            // Jadikan objek interaktif (bisa diklik untuk dihapus)
            standee.classList.add('collidable');
            standee.addEventListener('click', (ev) => {
                // Hentikan propagasi agar tidak memicu drop baru
                ev.stopPropagation();
                selectForDeletion(standee);
            });
            
            // Selesai, bersihkan state preview
            this.tempStandee = null;
            
            // Sembunyikan panel konfirmasi
            if (dropConfirmPanel) dropConfirmPanel.classList.add('hidden');
            
            // ALUR REDIRECT / TOMBOL BACK SETELAH QR SCAN
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id') || urlParams.get('url')) {
                // Tampilkan panel Kembali ke Scan QR, laci & instruksi tetap disembunyikan
                if (backToScanPanel) backToScanPanel.classList.remove('hidden');
                if (dropDrawer) dropDrawer.classList.add('hidden');
                if (dropInstructions) dropInstructions.classList.add('hidden');
                if (btnClearAll) btnClearAll.classList.add('hidden');
            } else {
                // Mode normal
                if (dropDrawer) dropDrawer.classList.remove('hidden');
                if (dropInstructions) dropInstructions.classList.remove('hidden');
                updateClearAllButtonVisibility();
            }
            
            // Tampilkan visual feedback
            showFlashMessage("DROPPED!", "bg-retro-green");
        };

        // Aksi Konfirmasi Drop - BATAL
        const cancelPlace = () => {
            if (!this.tempStandee) return;
            console.log("[Drop Handler] Pengguna membatalkan penempatan objek. Menghapus preview.");
            
            this.isAutoPreview = false;
            this.tempStandee.remove();
            this.tempStandee = null;
            
            if (dropConfirmPanel) dropConfirmPanel.classList.add('hidden');
            
            // AUTO BACK KE HALAMAN SCAN QR jika dipanggil via parameter URL
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id') || urlParams.get('url')) {
                console.log("[Drop Handler] Pengguna klik Batal, kembali otomatis ke halaman Scan QR...");
                window.location.href = 'index.html';
                return;
            }
            
            // Mode normal
            if (dropDrawer) dropDrawer.classList.remove('hidden');
            if (dropInstructions) dropInstructions.classList.remove('hidden');
            
            updateClearAllButtonVisibility();
        };

        // Fungsi memproses pemilihan objek untuk dihapus
        const selectForDeletion = (standee) => {
            if (this.tempStandee) return; // Abaikan jika sedang melakukan konfirmasi drop
            
            // Jika ada objek lain yang sedang terpilih, deselect dulu
            if (this.selectedStandee && this.selectedStandee !== standee) {
                deselectForDeletion();
            }
            
            console.log("[Drop Handler] Objek standee dipilih untuk dihapus.");
            this.selectedStandee = standee;
            
            // Berikan highlight merah pada alas standee yang terpilih
            const baseBox = standee.querySelector('a-box');
            if (baseBox) {
                baseBox.setAttribute('color', '#F0523C'); // Merah
            }
            
            // Tampilkan panel konfirmasi hapus, sembunyikan laci, instruksi, & panel back
            if (deleteConfirmPanel) deleteConfirmPanel.classList.remove('hidden');
            if (backToScanPanel) backToScanPanel.classList.add('hidden');
            if (dropDrawer) dropDrawer.classList.add('hidden');
            if (dropInstructions) dropInstructions.classList.add('hidden');
            if (btnClearAll) btnClearAll.classList.add('hidden');
        };

        // Fungsi membatalkan pilihan hapus
        const deselectForDeletion = () => {
            if (!this.selectedStandee) return;
            console.log("[Drop Handler] Membatalkan pilihan hapus objek.");
            
            const baseBox = this.selectedStandee.querySelector('a-box');
            if (baseBox) {
                baseBox.setAttribute('color', '#4CAF50'); // Kembalikan ke hijau
            }
            
            this.selectedStandee = null;
            
            if (deleteConfirmPanel) deleteConfirmPanel.classList.add('hidden');
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id') || urlParams.get('url')) {
                if (backToScanPanel) backToScanPanel.classList.remove('hidden');
            } else {
                if (dropDrawer) dropDrawer.classList.remove('hidden');
                if (dropInstructions) dropInstructions.classList.remove('hidden');
                updateClearAllButtonVisibility();
            }
        };

        // Aksi Hapus Objek - YA, HAPUS
        const confirmDelete = () => {
            if (!this.selectedStandee) return;
            console.log("[Drop Handler] Pengguna menghapus objek terpilih.");
            
            this.selectedStandee.remove();
            this.selectedStandee = null;
            
            if (deleteConfirmPanel) deleteConfirmPanel.classList.add('hidden');
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id') || urlParams.get('url')) {
                if (backToScanPanel) backToScanPanel.classList.remove('hidden');
            } else {
                if (dropDrawer) dropDrawer.classList.remove('hidden');
                if (dropInstructions) dropInstructions.classList.remove('hidden');
                updateClearAllButtonVisibility();
            }
            
            showFlashMessage("DELETED!", "bg-retro-red");
        };

        // Fungsi Hapus Semua Objek yang telah diletakkan (Delete Garden)
        const clearAllObjects = () => {
            console.log("[Drop Handler] Pengguna menekan DELETE GARDEN.");
            const allPlaced = document.querySelectorAll('.collidable');
            allPlaced.forEach(el => el.remove());
            
            // Bersihkan jika ada state preview/terpilih
            if (this.tempStandee) {
                this.tempStandee.remove();
                this.tempStandee = null;
            }
            if (this.selectedStandee) {
                this.selectedStandee = null;
            }
            this.isAutoPreview = false;
            
            if (dropConfirmPanel) dropConfirmPanel.classList.add('hidden');
            if (deleteConfirmPanel) deleteConfirmPanel.classList.add('hidden');
            if (backToScanPanel) backToScanPanel.classList.add('hidden');
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id') || urlParams.get('url')) {
                console.log("[Drop Handler] Garden dibersihkan, dialihkan kembali ke QR Scan.");
                window.location.href = 'index.html';
                return;
            }
            
            if (dropDrawer) dropDrawer.classList.remove('hidden');
            if (dropInstructions) dropInstructions.classList.remove('hidden');
            
            updateClearAllButtonVisibility();
            showFlashMessage("GARDEN CLEARED!", "bg-retro-red");
        };

        // Fungsi memperbarui visibilitas tombol Hapus Semua
        const updateClearAllButtonVisibility = () => {
            const hasPlaced = document.querySelectorAll('.collidable').length > 0;
            if (btnClearAll) {
                if (hasPlaced && !this.tempStandee && !this.selectedStandee) {
                    btnClearAll.classList.remove('hidden');
                } else {
                    btnClearAll.classList.add('hidden');
                }
            }
        };

        // Fungsi menampilkan notifikasi flash kustom
        const showFlashMessage = (text, bgColorClass) => {
            const flash = document.createElement('div');
            flash.innerText = text;
            flash.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${bgColorClass} text-white font-bold px-6 py-3 rounded-lg border-4 border-black shadow-retro z-[999999] pointer-events-none transition-opacity duration-1000`;
            document.body.appendChild(flash);
            setTimeout(() => flash.style.opacity = '0', 500);
            setTimeout(() => flash.remove(), 1500);
        };

        // Pasang event klik pada tombol konfirmasi UI
        if (btnConfirmYes) btnConfirmYes.onclick = confirmPlace;
        if (btnConfirmNo) btnConfirmNo.onclick = cancelPlace;
        
        if (btnDeleteYes) btnDeleteYes.onclick = confirmDelete;
        if (btnDeleteNo) btnDeleteNo.onclick = deselectForDeletion;
        
        if (btnClearAll) btnClearAll.onclick = clearAllObjects;
        
        if (btnBackToScan) {
            btnBackToScan.onclick = () => {
                console.log("[Drop Handler] Mengalihkan kembali ke QR Scanner page.");
                window.location.href = 'index.html';
            };
        }

        // Daftarkan event listener standar pada window untuk pengujian non-AR (desktop/laptop/tablet simulator)
        window.addEventListener('touchstart', performDrop, { passive: false });
        window.addEventListener('click', performDrop);

        // Fungsi pendaftaran listener select pada WebXR session yang aktif
        const startArSession = () => {
            if (selectRegistered) {
                console.log("[Drop Handler] Listener 'select' sudah aktif di WebXR Session.");
                return;
            }
            
            console.log("[Drop Handler] Memasuki AR. Mendapatkan WebXR Session...");
            const session = this.el.sceneEl.renderer.xr.getSession();
            if (session) {
                session.addEventListener('select', performDrop);
                selectRegistered = true;
                console.log("[Drop Handler] SUCCESS: Listener 'select' berhasil didaftarkan pada XRSession.");
                
                // AUTO-DROP PREVIEW: Jika datang dari hasil QR Scan (URL parameter aktif)
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('id') || urlParams.get('url')) {
                    console.log("[Drop Handler] Terdeteksi akses dari QR Scan/Link. Menjadwalkan auto-drop preview...");
                    setTimeout(() => {
                        // Letakkan preview standee secara otomatis setelah kamera AR stabil
                        performDrop(null);
                    }, 1200);
                }
            } else {
                console.error("[Drop Handler] ERROR: Gagal mendapatkan XRSession saat inisialisasi drop.");
            }
        };

        const endArSession = () => {
            console.log("[Drop Handler] Sesi AR berakhir.");
            selectRegistered = false;
            this.isAutoPreview = false;
        };

        // Daftarkan event listener pada renderer.xr
        if (this.el.sceneEl.renderer.xr) {
            this.el.sceneEl.renderer.xr.addEventListener('sessionstart', startArSession);
            this.el.sceneEl.renderer.xr.addEventListener('sessionend', endArSession);
        }

        // Sebagai cadangan, dengarkan juga event enter-vr/exit-vr A-Frame
        this.el.sceneEl.addEventListener('enter-vr', () => {
            if (this.el.sceneEl.is('ar-mode')) {
                console.log("[Drop Handler] A-Frame 'enter-vr' (AR-mode) terdeteksi.");
                startArSession();
            }
        });
        
        this.el.sceneEl.addEventListener('exit-vr', () => {
            endArSession();
        });
    },
    tick: function () {
        // PERBARUI POSISI PREVIEW SECARA REAL-TIME (AUTO PREVIEW MODE)
        // Preview standee akan terus menempel pada retikel lantai (jika terdeteksi) atau mengambang di depan kamera
        if (this.tempStandee && this.isAutoPreview) {
            const cameraRig = document.querySelector('[camera]');
            if (this.reticle && this.reticle.object3D.visible) {
                // Snap dan ikuti retikel cincin pink di lantai secara real-time
                this.tempStandee.object3D.position.copy(this.reticle.object3D.position);
                this.tempStandee.object3D.visible = true;
                this.lastGroundY = this.reticle.object3D.position.y;
            } else if (cameraRig) {
                // Gaze Fallback: Ikuti arah kamera 1.5 meter di depan mata (tapi sejajar tinggi lantai terakhir)
                const cameraObj = cameraRig.object3D;
                const pos = new THREE.Vector3(0, 0, -1.5);
                pos.applyMatrix4(cameraObj.matrixWorld);
                
                if (this.lastGroundY !== undefined && this.lastGroundY !== null) {
                    pos.y = this.lastGroundY;
                } else {
                    pos.y = cameraObj.position.y - 1.5;
                }
                this.tempStandee.object3D.position.copy(pos);
                this.tempStandee.object3D.visible = true;
            }
        }
    }
});
