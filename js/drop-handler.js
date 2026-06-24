// WebXR Markerless Hit-Test Logic
AFRAME.registerComponent('custom-ar-hit-test', {
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

// Komponen A-Frame untuk menampilkan Model 3D Prosedural Three.js
AFRAME.registerComponent('plant-3d', {
    schema: {
        type: { type: 'string', default: 'ulin' }
    },
    init: function () {
        if (window.PlantModels && typeof window.PlantModels.createModel === 'function') {
            try {
                // Buat model Three.js prosedural
                const model = window.PlantModels.createModel(this.data.type);
                
                // Tambahkan model ke A-Frame Object3D hierarchy
                this.el.setObject3D('mesh', model);
                
                // Set skala default agar pas di dunia nyata (sekitar 0.6 meter tinggi)
                this.el.setAttribute('scale', '0.6 0.6 0.6');
            } catch (e) {
                console.error("Gagal merender model 3D di A-Frame:", e);
            }
        } else {
            console.warn("Library PlantModels tidak ditemukan.");
        }
    }
});

// Komponen A-Frame untuk mendeteksi klik pada tanaman dan memicu pop-up deskripsi
AFRAME.registerComponent('clickable-plant', {
    schema: {
        name: { type: 'string', default: 'Tanaman' },
        region: { type: 'string', default: 'Indonesia' },
        desc: { type: 'string', default: 'Deskripsi tidak tersedia.' }
    },
    init: function () {
        // Event listener klik / sentuh
        this.el.addEventListener('click', (evt) => {
            evt.stopPropagation();
            
            const popup = document.getElementById('plant-desc-popup');
            if (popup) {
                document.getElementById('popup-plant-title').innerText = this.data.name;
                document.getElementById('popup-plant-region').innerText = `Asal: ${this.data.region}`;
                document.getElementById('popup-plant-desc').innerText = this.data.desc;
                popup.classList.remove('hidden');
            }
        });
    }
});

AFRAME.registerComponent('drop-handler', {
    init: function () {
        this.reticle = document.getElementById('reticle');
        
        // Gunakan fungsi terpusat untuk melempar objek
        const performDrop = (e) => {
            // Jika yang diklik adalah UI (laci, tombol, navbar, popup), abaikan!
            if (e && e.target) {
                if (e.target.closest('.pointer-events-auto') || e.target.closest('nav') || e.target.closest('button')) {
                    return;
                }
            }
            
            // Periksa apakah user sudah memilih tanaman di laci
            if (!window.activeDropImage) {
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
                pos.y -= 0.5; // Turunkan sedikit agar terlihat seperti di lantai
                position = pos;
            }
            
            // Buat entitas kontainer jangkar (anchor)
            const standee = document.createElement('a-entity');
            if (position.x !== undefined) {
                standee.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            } else {
                standee.setAttribute('position', position);
            }
            
            // JIKA ini tanaman endemik (memiliki 3D Model prosedural)
            if (window.activeDropPlantId) {
                const details = window.PlantModels.getDetails(window.activeDropPlantId);
                standee.setAttribute('clickable-plant', `name: ${details.name}; region: ${details.region}; desc: ${details.desc}`);

                // 1. Buat alas rumput bulat hijau di lantai
                const baseBox = document.createElement('a-cylinder');
                baseBox.setAttribute('color', '#4CAF50');
                baseBox.setAttribute('radius', '0.25');
                baseBox.setAttribute('height', '0.02');
                baseBox.setAttribute('position', '0 0.01 0');
                baseBox.classList.add('collidable');
                standee.appendChild(baseBox);

                // 2. Buat objek 3D tanaman
                const plant = document.createElement('a-entity');
                plant.setAttribute('plant-3d', `type: ${window.activeDropPlantId}`);
                plant.setAttribute('position', '0 0.02 0');
                plant.classList.add('collidable');
                standee.appendChild(plant);

            } else {
                // FALLBACK: JIKA ini karya pengguna (gambar hasil menggambar di Canvas)
                const plantName = window.activeDropPlantName || 'Karya Tanaman';
                const plantDesc = window.activeDropPlantDesc || 'Hasil lukisan kreatif dari kanvas digital.';
                const plantRegion = window.activeDropPlantRegion || 'Galeri Pengguna';
                standee.setAttribute('clickable-plant', `name: ${plantName}; region: ${plantRegion}; desc: ${plantDesc}`);

                // Buat 2D billboard (Pop-up Book effect)
                const img = document.createElement('a-image');
                img.setAttribute('src', window.activeDropImage);
                img.setAttribute('width', '0.5'); 
                img.setAttribute('height', '0.5');
                img.setAttribute('position', '0 0.25 0'); // Berdiri di atas lantai
                img.setAttribute('look-at', '[camera]');
                img.classList.add('collidable');

                // Alas kotak hijau
                const baseBox = document.createElement('a-box');
                baseBox.setAttribute('color', '#4CAF50');
                baseBox.setAttribute('depth', '0.2');
                baseBox.setAttribute('height', '0.05');
                baseBox.setAttribute('width', '0.5');
                baseBox.setAttribute('position', '0 0.025 0');
                baseBox.classList.add('collidable');
                
                standee.appendChild(baseBox);
                standee.appendChild(img);
            }
            
            // Tempelkan entitas ke scene A-Frame
            this.el.sceneEl.appendChild(standee);
            
            // Flash feedback "DROPPED!"
            const flash = document.createElement('div');
            flash.innerText = "DROPPED!";
            flash.className = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-retro-green text-white font-bold px-4 py-2 rounded-lg z-50 pointer-events-none transition-opacity duration-1000";
            document.body.appendChild(flash);
            setTimeout(() => flash.style.opacity = '0', 500);
            setTimeout(() => flash.remove(), 1500);
        };

        // Daftarkan semua jenis event tap/click
        this.el.sceneEl.addEventListener('select', performDrop);
        window.addEventListener('touchstart', performDrop, { passive: false });
        window.addEventListener('click', performDrop);
    }
});
