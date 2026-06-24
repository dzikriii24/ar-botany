// WebXR Markerless Hit-Test Logic
AFRAME.registerComponent('ar-hit-test', {
    schema: { target: { type: 'selector' } },
    init: function () {
        this.xrHitTestSource = null;
        this.viewerSpace = null;
        this.refSpace = null;
        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', (ev) => {
            let session = this.el.sceneEl.renderer.xr.getSession();
            session.requestReferenceSpace('viewer').then((space) => {
                this.viewerSpace = space;
                session.requestHitTestSource({ space: this.viewerSpace }).then((hitTestSource) => {
                    this.xrHitTestSource = hitTestSource;
                });
            });
            session.requestReferenceSpace('local').then((space) => {
                this.refSpace = space;
            });
        });
        this.el.sceneEl.renderer.xr.addEventListener('sessionend', (ev) => {
            this.xrHitTestSource = null;
            this.viewerSpace = null;
            this.refSpace = null;
        });
    },
    tick: function () {
        if (this.el.sceneEl.is('ar-mode') && this.xrHitTestSource && this.refSpace) {
            let frame = this.el.sceneEl.frame;
            if (!frame) return;
            let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
            if (hitTestResults.length > 0) {
                let pose = hitTestResults[0].getPose(this.refSpace);
                this.data.target.setAttribute('visible', 'true');
                this.data.target.object3D.position.copy(pose.transform.position);
            } else {
                this.data.target.setAttribute('visible', 'false');
            }
        }
    }
});

AFRAME.registerComponent('drop-handler', {
    init: function () {
        this.reticle = document.getElementById('reticle');
        
        // Gunakan fungsi terpusat untuk melempar objek
        const performDrop = (e) => {
            // (Optional) if (!this.el.is('ar-mode')) return; 
            // Dihapus agar bisa di-test di laptop/layar hitam biasa.

            // Jika yang diklik adalah UI (laci, tombol, navbar), abaikan!
            if (e && e.target) {
                if (e.target.closest('.pointer-events-auto') || e.target.closest('nav') || e.target.closest('button')) {
                    return;
                }
            }
            
            // Check if user has selected an image from the drawer
            if (!window.activeDropImage) {
                // Hanya alert jika ini bukan event otomatis
                if (e) alert("Pilih gambar dari laci koleksi di bawah terlebih dahulu!");
                return;
            }

            let position;
            // Jika cincin pink terlihat (lantai berhasil dideteksi)
            if (this.reticle.getAttribute('visible')) {
                position = this.reticle.getAttribute('position');
            } else {
                // FALLBACK INSTAN: Jika lantai gagal dideteksi, letakkan objek 1.5 meter di depan kamera!
                const cameraObj = document.querySelector('[camera]').object3D;
                const pos = new THREE.Vector3(0, 0, -1.5);
                pos.applyMatrix4(cameraObj.matrixWorld);
                // Turunkan sedikit dari ketinggian mata agar terlihat seperti di tanah/meja
                pos.y -= 0.5; 
                position = pos;
            }
            
            // Create an anchor entity
            const standee = document.createElement('a-entity');
            if (position.x !== undefined) {
                standee.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            } else {
                standee.setAttribute('position', position);
            }
            
            // Create the 2D billboard (Pop-up Book effect)
            const img = document.createElement('a-image');
            img.setAttribute('src', window.activeDropImage);
            
            // Keep the aspect ratio square for now, or you could read the natural dimensions.
            img.setAttribute('width', '0.5'); 
            img.setAttribute('height', '0.5');
            
            // Lift the image up by half its height so it stands ON the floor, not halfway through it
            img.setAttribute('position', '0 0.25 0');
            
            // Make it look at the camera so it's always readable like a standee
            img.setAttribute('look-at', '[camera]');

            // Tambahkan sebuah kotak alas (base) hijau agar selalu terlihat 
            // meskipun gambar aslinya gagal dimuat (CORS / error jaringan)
            const baseBox = document.createElement('a-box');
            baseBox.setAttribute('color', '#4CAF50');
            baseBox.setAttribute('depth', '0.2');
            baseBox.setAttribute('height', '0.05');
            baseBox.setAttribute('width', '0.5');
            baseBox.setAttribute('position', '0 0.025 0'); // Tepat di lantai
            
            // Attach to scene
            standee.appendChild(baseBox);
            standee.appendChild(img);
            this.el.sceneEl.appendChild(standee);
            
            // Optional: Provide feedback or sound
            // Alert sederhana untuk konfirmasi bahwa sistem drop mendeteksi ketukan
            // (akan hilang perlahan tapi berguna untuk debugging)
            const flash = document.createElement('div');
            flash.innerText = "DROPPED!";
            flash.className = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-retro-green text-white font-bold px-4 py-2 rounded-lg z-50 pointer-events-none transition-opacity duration-1000";
            document.body.appendChild(flash);
            setTimeout(() => flash.style.opacity = '0', 500);
            setTimeout(() => flash.remove(), 1500);
        };

        // Daftarkan semua jenis event tap/click yang mungkin terjadi di HP/Tablet/Desktop
        this.el.sceneEl.addEventListener('select', performDrop);
        window.addEventListener('touchstart', performDrop, { passive: false });
        window.addEventListener('click', performDrop);
    }
});
