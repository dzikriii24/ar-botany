const endemicPlants = [
    { id: 'ulin', name: 'Ulin', region: 'Kalimantan', stars: 5, color: 'bg-retro-blue', img: '<img src="assets/images/pohonulin.jpg" class="w-full h-full object-cover">' },
    { id: 'kantong_semar', name: 'Kantong Semar', region: 'Jawa', stars: 4, color: 'bg-retro-yellow', img: '<img src="assets/images/kantongsemar.jpg" class="w-full h-full object-cover">' },
    { id: 'bunga_bangkai', name: 'Bunga Bangkai', region: 'Jawa', stars: 5, color: 'bg-retro-purple', img: '<img src="assets/images/raflesia.jpg" class="w-full h-full object-cover">' },
    { id: 'aren', name: 'Aren', region: 'Sumatera', stars: 3, color: 'bg-retro-green', img: '<img src="assets/images/aren.jpg" class="w-full h-full object-cover">' },
    { id: 'sagu', name: 'Sagu', region: 'Papua', stars: 4, color: 'bg-retro-pink', img: '<img src="assets/images/sagu.jpg" class="w-full h-full object-cover">' },
    { id: 'gaharu', name: 'Gaharu', region: 'Sumatera', stars: 5, color: 'bg-retro-yellow', img: '<img src="assets/images/gaharu.jpg" class="w-full h-full object-cover">' },
    { id: 'kemuning', name: 'Kemuning', region: 'Jawa', stars: 2, color: 'bg-retro-blue', img: '<img src="assets/images/kemuning.jpg" class="w-full h-full object-cover">' },
    { id: 'pulai', name: 'Pulai', region: 'Sumatera', stars: 3, color: 'bg-retro-green', img: '<img src="assets/images/pulai.jpg" class="w-full h-full object-cover">' },
    { id: 'beringin', name: 'Beringin', region: 'Nasional', stars: 4, color: 'bg-retro-purple', img: '<img src="assets/images/beringin.jpg" class="w-full h-full object-cover">' },
    { id: 'kecubung', name: 'Kecubung', region: 'Jawa', stars: 2, color: 'bg-retro-pink', img: '🌸' },
    { id: 'kenanga', name: 'Kenanga', region: 'Jawa', stars: 3, color: 'bg-retro-yellow', img: '<img src="assets/images/kenanga.jpg" class="w-full h-full object-cover">' },
    { id: 'tanjung', name: 'Tanjung', region: 'Nasional', stars: 4, color: 'bg-retro-blue', img: '<img src="assets/images/tanjung.jpg" class="w-full h-full object-cover">' },
];
window.endemicPlants = endemicPlants;

const colors = ['bg-retro-red', 'bg-retro-blue', 'bg-retro-yellow', 'bg-retro-green', 'bg-retro-purple', 'bg-retro-pink'];

// --- INITIALIZE FROM URL (For Scanner Mode) ---
window.initFromURL = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const plant = endemicPlants.find(p => p.id === id);
        if (plant) {
            const badge = document.getElementById('plant-info-badge');
            if (badge) {
                badge.classList.remove('hidden');
                document.getElementById('plant-info-title').innerText = plant.name;
                document.getElementById('plant-info-desc').innerText = `Asal: ${plant.region}`;
            }
        }
    }
}

// --- AUTH UI ---
window.handleAuthBtnClick = function() {
    if (window.currentUser && document.getElementById('auth-btn').textContent === 'LOGOUT') {
        if (typeof window.handleLogout === 'function') window.handleLogout();
    } else {
        window.toggleAuthModal();
    }
}

window.toggleAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    // Reset to Login state when opening
    if (modal && modal.classList.contains('hidden')) {
        if (typeof window.authActionType !== 'undefined' && window.authActionType === 'register') {
            window.toggleAuthMode(); 
        }
    }
    if (modal) modal.classList.toggle('hidden');
}

// --- COLLECTION TABS ---
window.switchTab = function(tabName) {
    const btnEndemic = document.getElementById('tab-endemic');
    const btnUser = document.getElementById('tab-user');
    const gridEndemic = document.getElementById('grid-endemic');
    const gridUser = document.getElementById('grid-user');

    if (tabName === 'endemic') {
        btnEndemic.classList.replace('bg-white', 'bg-retro-green');
        btnEndemic.classList.add('text-white', 'translate-y-1', 'translate-x-1', 'shadow-none');
        btnUser.classList.replace('bg-retro-green', 'bg-white');
        btnUser.classList.remove('text-white', 'translate-y-1', 'translate-x-1', 'shadow-none');
        
        gridEndemic.classList.remove('hidden');
        gridUser.classList.add('hidden');
    } else {
        btnUser.classList.replace('bg-white', 'bg-retro-green');
        btnUser.classList.add('text-white', 'translate-y-1', 'translate-x-1', 'shadow-none');
        btnEndemic.classList.replace('bg-retro-green', 'bg-white');
        btnEndemic.classList.remove('text-white', 'translate-y-1', 'translate-x-1', 'shadow-none');
        
        gridUser.classList.remove('hidden');
        gridEndemic.classList.add('hidden');
        window.loadUserPlants();
    }
}

window.generateStars = function(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
}

window.loadEndemicPlants = function() {
    const grid = document.getElementById('grid-endemic');
    grid.innerHTML = '';
    endemicPlants.forEach((p, idx) => {
        const qrUrl = window.location.origin + '/drop.html?id=' + encodeURIComponent(p.id);
        grid.innerHTML += createCardHTML(p.name, window.generateStars(p.stars), p.color, `<div class="text-6xl flex items-center justify-center h-full">${p.img}</div>`, `Asal: ${p.region}`, `NO.${String(idx+1).padStart(3, '0')}`, '', qrUrl, p.id);
    });
    // Inisialisasi preview 3D jika file tree.js telah dimuat (dengan delay agar browser selesai menghitung layout)
    setTimeout(() => {
        if (typeof window.init3DCardPreviews === 'function') {
            window.init3DCardPreviews();
        }
    }, 250);
}

window.loadUserPlants = async function() {
    const grid = document.getElementById('grid-user');
    grid.innerHTML = '<p class="font-bold">Loading...</p>';
    
    if (typeof window.fetchUserCollections === 'function') {
        const data = await window.fetchUserCollections();
        grid.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach((p, idx) => {
                const randomColor = colors[idx % colors.length];
                const imgTag = `<img src="${p.image_url}" class="w-full h-full object-contain drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" alt="${p.plant_name}">`;
                const descHTML = p.description ? `<p class="text-[9px] md:text-xs font-bold mt-1 mb-1 line-clamp-2 leading-tight break-words">${p.description}</p>` : '';
                const authorDisplay = p.author_name ? `@${p.author_name}` : `USR.${String(idx+1).padStart(3, '0')}`;
                const qrUrl = window.location.origin + '/drop.html?url=' + encodeURIComponent(p.image_url);
                grid.innerHTML += createCardHTML(p.plant_name, '★★★☆☆', randomColor, imgTag, 'Author', authorDisplay, descHTML, qrUrl);
            });
        } else {
            grid.innerHTML = '<p class="font-bold col-span-2">Belum ada karya pengguna. Jadilah yang pertama!</p>';
        }
    } else {
        grid.innerHTML = '<p class="font-bold text-retro-red col-span-2">Supabase is not configured properly yet.</p>';
    }
}

function createCardHTML(title, stars, bgColorClass, imgContent, attr, num, extraHTML = '', qrUrl = '', plantId = '') {
    let qrHTML = '';
    if (qrUrl && typeof QRCode !== 'undefined') {
        try {
            qrHTML = new QRCode({ content: qrUrl, padding: 1, width: 150, height: 150, color: '#000000', background: '#ffffff', join: true }).svg();
        } catch(e) { console.error('QR Gen error', e); }
    }

    // Escape title for filename
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    return `
        <div class="flip-card h-full w-full" style="min-height: 280px;">
            <div class="flip-card-inner h-full w-full">
                <!-- FRONT -->
                <div class="flip-card-front retro-card ${bgColorClass} p-3 flex flex-col justify-between h-full absolute top-0 left-0 w-full" data-plant-id="${plantId}">
                    <div class="flex justify-between items-start font-black text-sm mb-2 border-b-4 border-black pb-1">
                        <span class="uppercase font-pixel text-[9px] md:text-xs truncate max-w-[70%]">${title}</span>
                        <span>${stars}</span>
                    </div>
                    <div class="border-4 border-black rounded aspect-square flex items-center justify-center mb-2 overflow-hidden relative" style="background: repeating-conic-gradient(#00000010 0% 25%, transparent 0% 50%) 50% / 20px 20px;">
                        ${imgContent}
                    </div>
                    ${extraHTML}
                    <div class="flex justify-between items-center font-bold text-xs mt-auto pt-2 gap-1">
                        <span class="truncate"><span class="uppercase text-[10px] md:text-xs">${attr}</span> <span class="text-[9px] md:text-xs">${num}</span></span>
                        <button onpointerdown="event.stopPropagation(); this.closest('.flip-card').classList.add('flipped')" class="retro-btn bg-white px-2 py-1 text-[10px] shrink-0">↻ FLIP</button>
                    </div>
                </div>
                <!-- BACK -->
                <div class="flip-card-back retro-card bg-gray-200 p-3 flex flex-col justify-between h-full absolute top-0 left-0 w-full items-center">
                    <h3 class="font-pixel text-[10px] text-center w-full mb-1">SCAN ME</h3>
                    <div class="qr-container bg-white border-4 border-black p-1 w-3/4 max-w-[150px] aspect-square flex justify-center items-center">
                        ${qrHTML}
                    </div>
                    <p class="text-[9px] leading-tight font-bold text-center mt-1 px-1">Scan kode ini dengan HP untuk membuka karya!</p>
                    <div class="mt-auto w-full flex flex-col gap-1">
                        <button onpointerdown="event.stopPropagation(); window.location.href='${qrUrl}'" class="retro-btn bg-retro-blue text-white px-3 py-1 text-[10px] w-full">LIHAT DI AR</button>
                        <button onpointerdown="event.stopPropagation(); window.downloadQR(this, '${safeTitle}')" class="retro-btn bg-retro-green text-white px-3 py-1 text-[10px] w-full">DOWNLOAD QR</button>
                        <button onpointerdown="event.stopPropagation(); this.closest('.flip-card').classList.remove('flipped')" class="retro-btn bg-white px-3 py-1 text-xs w-full">KEMBALI</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- QR CODE DOWNLOAD ---
window.downloadQR = function(btn, filename) {
    const cardBack = btn.closest('.flip-card-back');
    const svgElement = cardBack.querySelector('svg');
    if (!svgElement) return;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = function() {
        // High resolution for print
        canvas.width = img.width * 4;
        canvas.height = img.height * 4;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Trigger download
        const a = document.createElement("a");
        a.download = `qr_${filename}.png`;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

// --- CANVAS DRAWING ---
let ctx, canvas;
let drawing = false;

window.setupCanvasDrawing = function() {
    canvas = document.getElementById('paintCanvas');
    if (!canvas) return;
    
    // Resize internal dimensions to match CSS dimensions
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endPosition);
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPosition(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, { passive: false });
}

function startPosition(e) {
    drawing = true;
    draw(e);
}

function endPosition() {
    drawing = false;
    if(ctx) ctx.beginPath();
}

function draw(e) {
    if (!drawing || !ctx) return;
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');

    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = colorPicker.value;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

window.clearCanvas = function() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- SAVE CANVAS TO SUPABASE ---
window.saveCanvas = async function(event) {
    const plantNameInput = document.getElementById('plantNameInput');
    const plantDescInput = document.getElementById('plantDescInput');
    const plantName = plantNameInput.value.trim();
    const plantDesc = plantDescInput ? plantDescInput.value.trim() : '';

    if (!plantName) {
        alert('Tulis nama tanamanmu dulu!');
        return;
    }

    if (!window.currentUser) {
        alert('Please login first to save!');
        if (typeof window.toggleAuthModal === 'function') window.toggleAuthModal();
        return;
    }

    const btn = event ? event.target : document.querySelector('button[onclick*="saveCanvas"]');
    const originalText = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        canvas.toBlob(async (blob) => {
            if (!blob) throw new Error("Canvas is empty");

            const fileName = `${window.currentUser.id}-${Date.now()}.png`;
        
            // 1. Upload ke Supabase Storage Bucket
            const { data, error } = await window.supabase.storage
                .from('drawings')
                .upload(fileName, blob, { contentType: 'image/png' });
                
            if (error) throw error;
                
            // 2. Dapatkan URL Public gambarnya
            const { data: urlData } = window.supabase.storage.from('drawings').getPublicUrl(fileName);
            
            const authorName = window.currentUser.email ? window.currentUser.email.split('@')[0] : 'Anonymous';
            
            // 3. Simpan URL beserta metadata nama tanaman ke tabel database
            const { error: dbError } = await window.supabase.from('user_collections').insert([
                { 
                    user_id: window.currentUser.id,
                    author_name: authorName,
                    plant_name: plantName,
                    description: plantDesc,
                    image_url: urlData.publicUrl 
                }
            ]);

            if (dbError) throw dbError;

            alert('Karya botani berhasil dibagikan ke semua orang!');
            plantNameInput.value = '';
            if (plantDescInput) plantDescInput.value = '';
            window.clearCanvas();
            window.location.href = 'collection.html';
        }, 'image/png');
    } catch (err) {
        console.error("Save failed:", err);
        alert("Gagal menyimpan karya: " + err.message + "\nPastikan Bucket Storage dan Tabel Supabase sudah disetup sesuai instruksi.");
    } finally {
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1000);
    }
}

// --- DROP MODE LOGIC ---
window.activeDropImage = null; // Exposed globally for drop-handler.js

window.initDropMode = async function() {
    const drawer = document.getElementById('drop-drawer');
    if (!drawer) return;
    drawer.classList.remove('hidden');
    drawer.innerHTML = '<p class="text-white font-bold text-sm px-4 whitespace-nowrap self-center">Loading collection...</p>';
    
    let allPlants = [];

    // 1. Add Endemic Plants
    endemicPlants.forEach(p => {
        let imgSrc = '';
        const match = p.img.match(/src="([^"]+)"/);
        if (match) imgSrc = match[1];
        if (imgSrc) {
            allPlants.push({
                id: p.id,
                image_url: imgSrc,
                plant_name: p.name,
                is_endemic: true
            });
        }
    });

    if (typeof window.fetchUserCollections === 'function') {
        const data = await window.fetchUserCollections();
        if (data && data.length > 0) {
            allPlants = allPlants.concat(data);
        }
    }

    drawer.innerHTML = '';
    if (allPlants.length > 0) {
        let autoSelectIndex = 0;
        const urlParams = new URLSearchParams(window.location.search);
        const targetUrl = urlParams.get('url');
        const targetId = urlParams.get('id');

        allPlants.forEach((p, idx) => {
            if (targetUrl && p.image_url === targetUrl) autoSelectIndex = idx;
            if (targetId && p.id === targetId) autoSelectIndex = idx;

            const item = document.createElement('div');
            item.className = 'w-20 h-20 flex-shrink-0 rounded-lg border-4 border-white overflow-hidden cursor-pointer snap-center opacity-50 transition-opacity drop-shadow-md drop-drawer-item bg-white';
            const objectFit = p.is_endemic ? 'object-cover' : 'object-contain';
            item.innerHTML = `<img src="${p.image_url}" class="w-full h-full ${objectFit}" alt="${p.plant_name}">`;
            item.onclick = () => {
                document.querySelectorAll('.drop-drawer-item').forEach(el => el.classList.replace('opacity-100', 'opacity-50'));
                item.classList.replace('opacity-50', 'opacity-100');
                window.activeDropImage = p.image_url;
                window.activeDropPlantId = p.is_endemic ? p.id : null;
                window.activeDropPlantName = p.plant_name;
                window.activeDropPlantDesc = p.is_endemic ? "" : (p.description || "Karya lukisan pengguna.");
                window.activeDropPlantRegion = p.is_endemic ? "" : (p.author_name ? `@${p.author_name}` : "Galeri Pengguna");
            };
            drawer.appendChild(item);
        });
        const items = document.querySelectorAll('.drop-drawer-item');
        if (items[autoSelectIndex]) items[autoSelectIndex].click();

        // Jika halaman dipanggil dengan parameter URL (dari QR Scan atau Collection)
        if (targetId || targetUrl) {
            const detectedPlant = allPlants[autoSelectIndex];
            if (detectedPlant) {
                const arStartModal = document.getElementById('ar-start-modal');
                const arStartPlantName = document.getElementById('ar-start-plant-name');
                const arStartPlantImg = document.getElementById('ar-start-plant-img');
                
                if (arStartModal && arStartPlantName && arStartPlantImg) {
                    arStartPlantName.innerText = detectedPlant.plant_name;
                    const objectFit = detectedPlant.is_endemic ? 'object-cover' : 'object-contain';
                    arStartPlantImg.innerHTML = `<img src="${detectedPlant.image_url}" class="w-full h-full ${objectFit}">`;
                    arStartModal.classList.remove('hidden');
                    
                    arStartModal.onclick = () => {
                        arStartModal.classList.add('hidden');
                        const scene = document.querySelector('a-scene');
                        if (scene) {
                            console.log("[AR Launcher] Memulai sesi WebXR AR melalui gesture pengguna...");
                            scene.enterAR(); // Masuk ke mode AR A-Frame/WebXR
                        }
                    };
                }
            }
        }
    } else {
        drawer.innerHTML = '<p class="text-white font-bold text-sm px-4 whitespace-nowrap self-center">Belum ada karya komunitas.</p>';
    }
}

// Pool/manajer renderer aktif untuk membatasi WebGL context maksimal
const activeRenderers = [];
const MAX_ACTIVE_RENDERERS = 5; // Batas aman untuk semua perangkat & browser

function registerActiveRenderer(card, cleanupFunc) {
    // Jika sudah melebihi batas, hapus renderer paling lama (LRU/FIFO)
    if (activeRenderers.length >= MAX_ACTIVE_RENDERERS) {
        const oldest = activeRenderers.shift();
        if (oldest && oldest.cleanup) {
            oldest.cleanup();
        }
    }
    activeRenderers.push({ card, cleanup: cleanupFunc });
}

function unregisterActiveRenderer(card) {
    const index = activeRenderers.findIndex(item => item.card === card);
    if (index !== -1) {
        activeRenderers.splice(index, 1);
    }
}

// --- INITIALIZE 3D CARD PREVIEWS IN COLLECTION ---
window.init3DCardPreviews = function() {
    if (typeof THREE === 'undefined' || typeof window.PlantModels === 'undefined') {
        console.warn("Three.js or PlantModels is not loaded yet.");
        return;
    }

    const cards = document.querySelectorAll('.flip-card-front[data-plant-id]');
    
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const plantId = card.getAttribute('data-plant-id');
            if (!plantId) return;
            const imgContainer = card.querySelector('.aspect-square');
            if (!imgContainer) return;

            if (entry.isIntersecting) {
                // Inisialisasi renderer jika belum diinisialisasi
                if (imgContainer.querySelector('canvas')) return;

                const originalContent = imgContainer.innerHTML;
                imgContainer.dataset.originalContent = originalContent; // Simpan fallback
                imgContainer.innerHTML = ''; // Kosongkan

                // Setup Scene
                const scene = new THREE.Scene();
                
                // Setup Kamera
                const width = imgContainer.clientWidth || 180;
                const height = imgContainer.clientHeight || 180;
                const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
                camera.position.set(0, 1.2, 2.5);
                camera.lookAt(0, 0.7, 0);

                // Setup WebGL Renderer
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                renderer.shadowMap.enabled = true;
                imgContainer.appendChild(renderer.domElement);

                // Lighting
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
                scene.add(ambientLight);

                const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
                dirLight.position.set(3, 5, 2);
                scene.add(dirLight);

                // Load 3D Model
                let model;
                try {
                    model = window.PlantModels.createModel(plantId);
                    scene.add(model);
                } catch(e) {
                    console.error("Failed to load 3D model in card:", plantId, e);
                    imgContainer.innerHTML = originalContent; // Fallback
                    return;
                }

                // Pointer/Drag Interaction
                let isDragging = false;
                let previousMousePosition = { x: 0, y: 0 };

                const handleDown = (e) => {
                    isDragging = true;
                    previousMousePosition = {
                        x: e.touches ? e.touches[0].clientX : e.clientX,
                        y: e.touches ? e.touches[0].clientY : e.clientY
                    };
                };

                const handleMove = (e) => {
                    if (!isDragging) return;
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const deltaX = clientX - previousMousePosition.x;
                    model.rotation.y += deltaX * 0.015;
                    previousMousePosition.x = clientX;
                };

                const handleUp = () => {
                    isDragging = false;
                };

                renderer.domElement.addEventListener('mousedown', handleDown);
                renderer.domElement.addEventListener('touchstart', handleDown, { passive: true });
                
                window.addEventListener('mousemove', handleMove);
                window.addEventListener('touchmove', handleMove, { passive: true });
                window.addEventListener('mouseup', handleUp);
                window.addEventListener('touchend', handleUp);

                // Animation loop
                let animId;
                const animate = () => {
                    animId = requestAnimationFrame(animate);
                    if (!isDragging) {
                        model.rotation.y += 0.012; // Auto rotate slow
                    }
                    renderer.render(scene, camera);
                };
                animate();

                // Fungsi pembersihan (cleanup)
                const cleanup = () => {
                    cancelAnimationFrame(animId);
                    if (renderer) {
                        renderer.domElement.removeEventListener('mousedown', handleDown);
                        renderer.domElement.removeEventListener('touchstart', handleDown);
                        window.removeEventListener('mousemove', handleMove);
                        window.removeEventListener('touchmove', handleMove);
                        window.removeEventListener('mouseup', handleUp);
                        window.removeEventListener('touchend', handleUp);
                        renderer.dispose();
                    }
                    if (imgContainer.dataset.originalContent) {
                        imgContainer.innerHTML = imgContainer.dataset.originalContent;
                    }
                    delete imgContainer._cleanup;
                };

                imgContainer._cleanup = cleanup;

                // Daftarkan ke manajer renderer aktif
                registerActiveRenderer(card, cleanup);

            } else {
                // Keluar dari viewport: Bersihkan
                if (imgContainer._cleanup) {
                    imgContainer._cleanup();
                    unregisterActiveRenderer(card);
                }
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        if (card.dataset.observed === 'true') return;
        card.dataset.observed = 'true';
        observer.observe(card);
    });
};

