// Library Model 3D Prosedural untuk Tanaman Endemik
// Menggunakan Three.js dasar untuk menyusun objek 3D low-poly

(function() {
    const PlantModels = {};

    // Helper untuk membuat material standar low-poly
    function createMat(color, roughness = 0.8, metalness = 0.1) {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness,
            flatShading: true // Menghasilkan tampilan retro low-poly
        });
    }

    // 1. ULIN (Pohon Besi - Tinggi, kokoh, rindang)
    function createUlin() {
        const group = new THREE.Group();
        
        // Batang (Cokelat tua kokoh)
        const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.8, 8);
        const trunkMat = createMat(0x4A2E1B, 0.9);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.9;
        group.add(trunk);

        // Daun (Rimbun bertumpuk)
        const foliageMat = createMat(0x1E4620);
        
        const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 1), foliageMat);
        f1.position.set(0, 1.6, 0);
        f1.scale.set(1, 0.8, 1);
        group.add(f1);

        const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), foliageMat);
        f2.position.set(0.2, 1.3, 0.2);
        group.add(f2);

        const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), foliageMat);
        f3.position.set(-0.2, 1.3, -0.2);
        group.add(f3);

        const f4 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), foliageMat);
        f4.position.set(0, 2.0, 0);
        group.add(f4);

        return group;
    }

    // 2. KANTONG SEMAR (Pitcher Plant - Menjalar dengan kantong gantung)
    function createKantongSemar() {
        const group = new THREE.Group();

        // Pot/Dudukan dasar (hijau lumut)
        const baseGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
        const baseMat = createMat(0x3B5E2B);
        const base = new THREE.Mesh(baseGeo, baseMat);
        group.add(base);

        // Tangkai utama melengkung
        const stemMat = createMat(0x556B2F);
        for (let i = 0; i < 8; i++) {
            const segment = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), stemMat);
            segment.position.set(Math.sin(i * 0.4) * 0.1, 0.075 + i * 0.12, Math.cos(i * 0.4) * 0.05);
            segment.rotation.z = Math.sin(i * 0.3) * 0.2;
            group.add(segment);
        }

        // Kantong Gantung (Tubular, merah-hijau)
        const pitcherGroup = new THREE.Group();
        pitcherGroup.position.set(0.2, 0.6, 0.1);
        
        // Badan Kantong
        const bodyGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.4, 8);
        const bodyMat = createMat(0x8B2500); // Merah kecokelatan/maroon
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        pitcherGroup.add(body);

        // Bibir Kantong (Ring hijau kekuningan)
        const lipGeo = new THREE.TorusGeometry(0.12, 0.02, 6, 12);
        const lipMat = createMat(0xADFF2F);
        const lip = new THREE.Mesh(lipGeo, lipMat);
        lip.rotation.x = Math.PI / 2;
        lip.position.y = 0.2;
        pitcherGroup.add(lip);

        // Tutup Kantong (Kecil di atas)
        const lidGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.01, 8);
        const lid = new THREE.Mesh(lidGeo, lipMat);
        lid.position.set(0, 0.23, -0.05);
        lid.rotation.x = 0.3;
        pitcherGroup.add(lid);

        group.add(pitcherGroup);

        // Daun Lebar menjuntai ke bawah
        const leafGeo = new THREE.BoxGeometry(0.3, 0.02, 0.12);
        const leafMat = createMat(0x6B8E23);
        const leaf1 = new THREE.Mesh(leafGeo, leafMat);
        leaf1.position.set(-0.15, 0.4, 0);
        leaf1.rotation.z = -0.3;
        group.add(leaf1);

        const leaf2 = new THREE.Mesh(leafGeo, leafMat);
        leaf2.position.set(0.15, 0.3, -0.1);
        leaf2.rotation.z = 0.2;
        group.add(leaf2);

        return group;
    }

    // 3. BUNGA BANGKAI (Rafflesia / Amorphophallus - Kelopak lebar merah hati, tiang tinggi)
    function createBungaBangkai() {
        const group = new THREE.Group();

        // Batang bawah (Pendek tebal)
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8), createMat(0x4E6E35));
        stem.position.y = 0.15;
        group.add(stem);

        // Kelopak Mekar/Spathe (Kerucut terbalik merah marun tua)
        const spatheGeo = new THREE.CylinderGeometry(0.5, 0.15, 0.6, 10, 1, true); // Open-ended cylinder
        const spatheMat = createMat(0x7A1C2E); // Maroon
        const spathe = new THREE.Mesh(spatheGeo, spatheMat);
        spathe.position.y = 0.5;
        group.add(spathe);

        // Bagian luar kelopak (Kehijauan/berbintik)
        const outerSpatheGeo = new THREE.CylinderGeometry(0.52, 0.16, 0.58, 10, 1, true);
        const outerSpathe = new THREE.Mesh(outerSpatheGeo, createMat(0x5F8A4F));
        outerSpathe.position.y = 0.5;
        group.add(outerSpathe);

        // Tongkol/Spadix (Kerucut tinggi menjulang, kuning kehijauan)
        const spadixGeo = new THREE.ConeGeometry(0.12, 1.1, 8);
        const spadixMat = createMat(0xBEB145);
        const spadix = new THREE.Mesh(spadixGeo, spadixMat);
        spadix.position.y = 0.95;
        group.add(spadix);

        return group;
    }

    // 4. AREN (Pohon Enau / Sugar Palm)
    function createAren() {
        const group = new THREE.Group();

        // Batang (Cokelat hitam beruas-ruas kasar)
        const trunkHeight = 1.6;
        const trunkGroup = new THREE.Group();
        const trunkMat = createMat(0x3B2F2F);
        
        // Menyusun ruas batang
        const numSegments = 8;
        for (let i = 0; i < numSegments; i++) {
            const h = trunkHeight / numSegments;
            const segment = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, h, 8), trunkMat);
            segment.position.y = (i * h) + (h / 2);
            // Tambahkan cincin pembatas bertekstur
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.015, 4, 8), createMat(0x221100));
            ring.rotation.x = Math.PI / 2;
            ring.position.y = segment.position.y + h/2;
            trunkGroup.add(segment);
            trunkGroup.add(ring);
        }
        group.add(trunkGroup);

        // Daun Palem Melengkung di atas
        const leavesGroup = new THREE.Group();
        leavesGroup.position.y = trunkHeight;
        
        const numFronds = 7;
        const leafMat = createMat(0x1B4D22);
        
        for (let i = 0; i < numFronds; i++) {
            const frond = new THREE.Group();
            const angle = (i / numFronds) * Math.PI * 2;
            frond.rotation.y = angle;

            // Batang pelepah
            const stemGeo = new THREE.CylinderGeometry(0.01, 0.015, 0.8, 5);
            const stem = new THREE.Mesh(stemGeo, createMat(0x556B2F));
            stem.rotation.z = 1.1; // Melengkung ke samping bawah
            stem.position.set(0.3, 0.1, 0);
            frond.add(stem);

            // Sirip daun (beberapa box pipih di sepanjang pelepah)
            for (let j = 1; j <= 5; j++) {
                const pinna = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18 - j*0.02, 0.01), leafMat);
                pinna.rotation.z = 1.1;
                pinna.rotation.x = 0.3;
                pinna.position.set(0.12 * j, 0.04 * j, 0);
                frond.add(pinna);
            }
            leavesGroup.add(frond);
        }
        group.add(leavesGroup);

        return group;
    }

    // 5. SAGU (Pohon Sagu - Batang lebih pendek dan melebar, daun lebat)
    function createSagu() {
        const group = new THREE.Group();

        // Batang (Pendek, tebal, abu-abu kecokelatan)
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 1.0, 8);
        const trunkMat = createMat(0x5D544C);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.5;
        group.add(trunk);

        // Daun palem melimpah
        const leavesGroup = new THREE.Group();
        leavesGroup.position.y = 0.95;

        const numFronds = 10;
        const leafMat = createMat(0x2D6A4F);
        for (let i = 0; i < numFronds; i++) {
            const frond = new THREE.Group();
            frond.rotation.y = (i / numFronds) * Math.PI * 2;

            // Pelepah melengkung
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.9, 5), createMat(0x40916C));
            stem.rotation.z = 0.9 + (i % 2) * 0.2; // Sudut selang-seling agar natural
            stem.position.set(0.3, 0.15, 0);
            frond.add(stem);

            // Sirip daun sagu
            for (let j = 1; j <= 6; j++) {
                const pinna = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22 - j*0.03, 0.01), leafMat);
                pinna.rotation.z = 0.9;
                pinna.position.set(0.11 * j, 0.06 * j, 0.02);
                frond.add(pinna);
            }
            leavesGroup.add(frond);
        }
        group.add(leavesGroup);

        return group;
    }

    // 6. GAHARU (Pohon Harum - Batang berkayu dengan guratan getah hitam, tajuk kerucut)
    function createGaharu() {
        const group = new THREE.Group();

        // Batang Utama
        const trunkGeo = new THREE.CylinderGeometry(0.1, 0.14, 1.7, 8);
        const trunkMat = createMat(0x5C4033);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.85;
        group.add(trunk);

        // Guratan Resin Gaharu (Kotak-kotak hitam menempel di batang)
        const resinMat = createMat(0x1C1C1C, 0.2, 0.8); // Hitam mengkilap
        for (let i = 0; i < 3; i++) {
            const resin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.03), resinMat);
            resin.position.set(Math.sin(i*2) * 0.1, 0.4 + i*0.4, Math.cos(i*2) * 0.1);
            resin.rotation.y = i * 2;
            group.add(resin);
        }

        // Tajuk/Daun (Kerucut bertumpuk hijau tua kekuningan)
        const foliageMat = createMat(0x4F7942);
        
        const tier1 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 8), foliageMat);
        tier1.position.y = 1.4;
        group.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 8), foliageMat);
        tier2.position.y = 1.8;
        group.add(tier2);

        const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 8), foliageMat);
        tier3.position.y = 2.1;
        group.add(tier3);

        return group;
    }

    // 7. KEMUNING (Perdu Berbunga Kecil - Banyak daun kecil, bunga putih & buah merah)
    function createKemuning() {
        const group = new THREE.Group();

        // Ranting/Batang bercabang banyak
        const stemMat = createMat(0x8B7355);
        const mainStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6), stemMat);
        mainStem.position.y = 0.4;
        group.add(mainStem);

        // Cabang-cabang kecil
        const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 5), stemMat);
        branch1.position.set(0.1, 0.6, 0.05);
        branch1.rotation.z = -0.6;
        group.add(branch1);

        const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 5), stemMat);
        branch2.position.set(-0.1, 0.6, -0.05);
        branch2.rotation.z = 0.6;
        group.add(branch2);

        // Rimbunan daun (Kumpulan bola hijau kecil)
        const leafMat = createMat(0x32CD32);
        const leafCenters = [
            [0, 0.8, 0, 0.35],
            [0.18, 0.75, 0.1, 0.28],
            [-0.18, 0.75, -0.1, 0.28],
            [0.1, 0.95, -0.1, 0.25],
            [-0.1, 0.95, 0.1, 0.25]
        ];

        leafCenters.forEach(c => {
            const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(c[3], 0), leafMat);
            leaves.position.set(c[0], c[1], c[2]);
            group.add(leaves);

            // Tambahkan bunga putih kecil (spheres) secara acak menempel di daun
            const flowerMat = createMat(0xFFFFFF, 0.9, 0);
            for (let j = 0; j < 3; j++) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), flowerMat);
                flower.position.set(
                    c[0] + (Math.random() - 0.5) * c[3] * 1.4,
                    c[1] + (Math.random() - 0.5) * c[3] * 1.4,
                    c[2] + (Math.random() - 0.5) * c[3] * 1.4
                );
                group.add(flower);
            }

            // Buah berry merah kecil
            const berryMat = createMat(0xE63946, 0.5, 0.2);
            for (let k = 0; k < 2; k++) {
                const berry = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), berryMat);
                berry.position.set(
                    c[0] + (Math.random() - 0.5) * c[3] * 1.4,
                    c[1] + (Math.random() - 0.5) * c[3] * 1.4,
                    c[2] + (Math.random() - 0.5) * c[3] * 1.4
                );
                group.add(berry);
            }
        });

        return group;
    }

    // 8. PULAI (Pohon Pagoda - Cabang bertingkat melingkar datar)
    function createPulai() {
        const group = new THREE.Group();

        // Batang Utama tinggi lurus
        const trunkGeo = new THREE.CylinderGeometry(0.07, 0.12, 2.0, 8);
        const trunkMat = createMat(0x8F8F8F);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.0;
        group.add(trunk);

        // Tingkat daun (seperti piring/kerucut datar hijau)
        const leafMat = createMat(0x006400); // Hijau tua

        const levels = [
            { y: 0.9, radius: 0.5, h: 0.15 },
            { y: 1.4, radius: 0.4, h: 0.12 },
            { y: 1.8, radius: 0.3, h: 0.1 },
            { y: 2.1, radius: 0.2, h: 0.08 }
        ];

        levels.forEach(lvl => {
            const levelMesh = new THREE.Mesh(new THREE.ConeGeometry(lvl.radius, lvl.h, 8), leafMat);
            levelMesh.position.y = lvl.y;
            group.add(levelMesh);

            // Cabang horizontal penyangga tingkat (kecil tipis)
            const numSpokes = 5;
            for (let i = 0; i < numSpokes; i++) {
                const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, lvl.radius, 4), trunkMat);
                spoke.rotation.x = Math.PI/2;
                spoke.rotation.y = (i/numSpokes) * Math.PI * 2;
                spoke.position.y = lvl.y - lvl.h/2;
                group.add(spoke);
            }
        });

        return group;
    }

    // 9. BERINGIN (Banyan - Rindang lebar dengan akar gantung)
    function createBeringin() {
        const group = new THREE.Group();

        // Batang utama tebal meliuk-liuk bawah
        const trunkMat = createMat(0x543D2B);
        const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.0, 8), trunkMat);
        mainTrunk.position.y = 0.5;
        group.add(mainTrunk);

        // Cabang-cabang penyangga lebar
        const branches = [
            [0.15, 0.7, 0, 0.6, 0.6],  // x, y, z, rotationZ, len
            [-0.15, 0.7, 0, -0.6, 0.6],
            [0, 0.7, 0.15, 0.6, 0.6, true], // rotX
            [0, 0.7, -0.15, -0.6, 0.6, true]
        ];

        branches.forEach(b => {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, b[4], 6), trunkMat);
            branch.position.set(b[0], b[1], b[2]);
            if (b[5]) {
                branch.rotation.x = b[3];
            } else {
                branch.rotation.z = b[3];
            }
            group.add(branch);
        });

        // Akar gantung (Cylinder tipis menjulur ke bawah)
        const rootMat = createMat(0x6E4C33, 0.9);
        const rootCoords = [
            [0.2, 0.7, 0.1, 0.65],
            [-0.2, 0.7, -0.1, 0.65],
            [0.1, 0.6, -0.2, 0.55],
            [-0.1, 0.6, 0.2, 0.55]
        ];
        rootCoords.forEach(rc => {
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, rc[3], 4), rootMat);
            root.position.set(rc[0], rc[1] - rc[3]/2, rc[2]);
            group.add(root);
        });

        // Rimbunan daun lebar (Payung raksasa bertumpuk)
        const leafMat = createMat(0x1B4D3E);
        
        const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), leafMat);
        canopy1.position.set(0, 1.4, 0);
        canopy1.scale.set(1.4, 0.7, 1.4);
        group.add(canopy1);

        const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), leafMat);
        canopy2.position.set(0.4, 1.2, 0.3);
        group.add(canopy2);

        const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), leafMat);
        canopy3.position.set(-0.4, 1.2, -0.3);
        group.add(canopy3);

        return group;
    }

    // 10. KECUBUNG (Kecubung Hias - Tanaman perdu bunga trompet ungu)
    function createKecubung() {
        const group = new THREE.Group();

        // Batang/Dahan Hijau
        const stemMat = createMat(0x556B2F);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.7, 6), stemMat);
        stem.position.y = 0.35;
        group.add(stem);

        // Daun Lebar (Box pipih miring)
        const leafMat = createMat(0x3B7A57);
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.1), leafMat);
            leaf.position.set(Math.sin(i*1.2)*0.15, 0.25 + i*0.08, Math.cos(i*1.2)*0.15);
            leaf.rotation.y = i * 1.2;
            leaf.rotation.z = 0.4;
            group.add(leaf);
        }

        // Bunga Trompet (Cone terbalik ungu-putih gantung kebawah)
        const flowerGroup = new THREE.Group();
        flowerGroup.position.set(0, 0.5, 0);

        const numFlowers = 3;
        const flowerMat = createMat(0xD8B4F8); // Ungu muda
        for (let i = 0; i < numFlowers; i++) {
            const angle = (i / numFlowers) * Math.PI * 2;
            const flowerBranch = new THREE.Group();
            flowerBranch.rotation.y = angle;

            // Gagang bunga
            const stemF = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4), stemMat);
            stemF.position.set(0.1, 0.05, 0);
            stemF.rotation.z = -0.8;
            flowerBranch.add(stemF);

            // Kelopak Trompet
            const trumpet = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6, 1, true), flowerMat);
            trumpet.position.set(0.18, -0.05, 0);
            trumpet.rotation.z = -2.2; // Mengarah serong bawah
            flowerBranch.add(trumpet);

            // Benang sari kuning kecil di dalam trompet
            const stamen = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 4), createMat(0xFFFF00));
            stamen.position.set(0.18, -0.05, 0);
            stamen.rotation.z = -2.2;
            flowerBranch.add(stamen);

            flowerGroup.add(flowerBranch);
        }
        group.add(flowerGroup);

        return group;
    }

    // 11. KENANGA (Pohon Kenanga - Bunga kuning gantung menjuntai)
    function createKenanga() {
        const group = new THREE.Group();

        // Batang cokelat abu-abu
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.6, 8), createMat(0x7D7D7D));
        trunk.position.y = 0.8;
        group.add(trunk);

        // Tajuk/Dedaunan hijau muda kekuningan
        const canopyMat = createMat(0x6B8E23);
        const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), canopyMat);
        leaves.position.set(0, 1.4, 0);
        group.add(leaves);

        // Bunga Kenanga Kuning (Beberapa helai pita gantung)
        const flowerMat = createMat(0xEEDC82, 0.7, 0); // Kuning kelopak
        const numFlowers = 4;
        
        for (let i = 0; i < numFlowers; i++) {
            const fGroup = new THREE.Group();
            fGroup.position.set(Math.sin(i*1.5)*0.25, 1.25, Math.cos(i*1.5)*0.25);
            
            // Tangkai bunga
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 4), createMat(0x556B2F));
            stem.position.y = 0.05;
            fGroup.add(stem);

            // Helai kelopak tipis melengkung ke bawah
            const numPetals = 5;
            for (let p = 0; p < numPetals; p++) {
                const petal = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.004), flowerMat);
                petal.rotation.y = (p / numPetals) * Math.PI * 2;
                petal.rotation.z = 0.4; // Terbuka keluar bawah
                petal.position.set(Math.sin((p / numPetals) * Math.PI * 2)*0.02, -0.05, Math.cos((p / numPetals) * Math.PI * 2)*0.02);
                fGroup.add(petal);
            }
            group.add(fGroup);
        }

        return group;
    }

    // 12. TANJUNG (Pohon Tanjung - Daun rimbun bulat simetris, bunga bintang kecil)
    function createTanjung() {
        const group = new THREE.Group();

        // Batang (Cokelat gelap kokoh bertekstur)
        const trunkGeo = new THREE.CylinderGeometry(0.09, 0.14, 1.5, 8);
        const trunkMat = createMat(0x3B2219);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        group.add(trunk);

        // Dedaunan rimbun simetris (Kerucut bulat/Dodecahedron)
        const leafMat = createMat(0x0B6623); // Hijau rimba
        
        const mainCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), leafMat);
        mainCanopy.position.set(0, 1.35, 0);
        group.add(mainCanopy);

        const subCanopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), leafMat);
        subCanopy1.position.set(0.15, 1.1, 0.15);
        group.add(subCanopy1);

        const subCanopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), leafMat);
        subCanopy2.position.set(-0.15, 1.1, -0.15);
        group.add(subCanopy2);

        // Bunga Tanjung Bintang Putih Kecil
        const starMat = createMat(0xFFFFF0, 0.9, 0.1);
        const starGeo = new THREE.BoxGeometry(0.03, 0.03, 0.01);
        
        for (let i = 0; i < 8; i++) {
            const star = new THREE.Mesh(starGeo, starMat);
            // Putar acak seperti bintang
            star.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            star.position.set(
                (Math.random() - 0.5) * 0.9,
                1.1 + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.9
            );
            group.add(star);
        }

        return group;
    }

    // Router utama pembuatan model 3D berdasarkan ID tanaman
    PlantModels.createModel = function(type) {
        let plant;
        
        switch (type ? type.toLowerCase() : '') {
            case 'ulin':
                plant = createUlin();
                break;
            case 'kantong_semar':
                plant = createKantongSemar();
                break;
            case 'bunga_bangkai':
                plant = createBungaBangkai();
                break;
            case 'aren':
                plant = createAren();
                break;
            case 'sagu':
                plant = createSagu();
                break;
            case 'gaharu':
                plant = createGaharu();
                break;
            case 'kemuning':
                plant = createKemuning();
                break;
            case 'pulai':
                plant = createPulai();
                break;
            case 'beringin':
                plant = createBeringin();
                break;
            case 'kecubung':
                plant = createKecubung();
                break;
            case 'kenanga':
                plant = createKenanga();
                break;
            case 'tanjung':
                plant = createTanjung();
                break;
            default:
                // Fallback: Default stylized generic tree jika tipe tidak dikenal
                plant = createUlin();
                break;
        }

        // Standardisasi posisi agar nempel di lantai y = 0
        // Serta skala dasar yang sesuai untuk diletakkan di card atau AR
        plant.position.set(0, 0, 0);
        return plant;
    };

    // Kamus deskripsi untuk setiap tanaman endemik
    PlantModels.descriptions = {
        ulin: "Pohon Ulin (Eusideroxylon zwageri) atau Kayu Besi adalah pohon khas Kalimantan. Kayunya sangat keras, awet, dan tahan air laut, sehingga sering digunakan untuk jembatan, perkapalan, dan tiang bangunan.",
        kantong_semar: "Kantong Semar (Nepenthes) adalah tanaman karnivora unik. Daunnya bermodifikasi membentuk kantong berisi cairan asam pencerna untuk melumpuhkan serangga guna mendapatkan nitrogen tambahan.",
        bunga_bangkai: "Bunga Bangkai (Amorphophallus titanum) adalah tumbuhan dengan struktur bunga terbesar di dunia. Bunga ini mengeluarkan bau mirip daging membusuk untuk memikat lalat penyerbuk.",
        aren: "Pohon Aren (Arenga pinnata) adalah tanaman palma multiguna. Menghasilkan nira manis untuk bahan gula merah, serat ijuk hitam untuk sapu/atap, serta buah kolang-kaling yang segar.",
        sagu: "Pohon Sagu (Metroxylon sagu) tumbuh melimpah di wilayah rawa Papua dan Maluku. Bagian dalam batang sagu mengandung pati yang diolah menjadi tepung sagu sebagai makanan pokok setempat.",
        gaharu: "Pohon Gaharu (Aquilaria) menghasilkan resin wangi berwarna gelap di dalam serat kayunya akibat infeksi jamur alami. Resin gaharu sangat wangi dan bernilai ekspor tinggi sebagai bahan parfum.",
        kemuning: "Kemuning (Murraya paniculata) merupakan perdu hias beraroma wangi melati dengan bunga putih cantik dan buah berry merah jingga. Daunnya sering digunakan sebagai jamu obat herbal.",
        pulai: "Pohon Pulai (Alstonia scholaris) memiliki daun melingkar bertingkat menyerupai pagoda. Kayunya ringan namun serat batangnya bernilai tinggi dan berkhasiat sebagai obat demam.",
        beringin: "Pohon Beringin (Ficus benjamina) memiliki payung dedaunan yang rimbun dan akar gantung yang kokoh. Beringin bernilai ekologi penting sebagai peneduh sekaligus pengikat cadangan air tanah.",
        kecubung: "Kecubung (Datura metel) memiliki bunga cantik mirip terompet berwarna ungu-putih. Tanaman ini mengandung senyawa alkaloid aktif yang dapat memicu halusinasi kuat jika disalahgunakan.",
        kenanga: "Kenanga (Cananga odorata) adalah pohon penghasil bunga kuning kehijauan yang layu menjuntai namun sangat harum. Sulingan bunga kenanga memproduksi minyak atsiri bernilai tinggi.",
        tanjung: "Pohon Tanjung (Mimusops elengi) adalah tanaman peneduh dengan bunga kecil beraroma manis mirip bintang. Bunganya biasa dikeringkan untuk wewangian pakaian tradisional."
    };

    // Fungsi pembantu untuk mengambil detail terstruktur
    PlantModels.getDetails = function(type) {
        const id = type ? type.toLowerCase() : '';
        const descText = PlantModels.descriptions[id] || "Deskripsi tidak tersedia.";
        
        let name = "Tanaman Kustom";
        let region = "Galeri Pengguna";
        
        switch (id) {
            case 'ulin': name = "Pohon Ulin"; region = "Kalimantan"; break;
            case 'kantong_semar': name = "Kantong Semar"; region = "Jawa, Sumatera, Kalimantan"; break;
            case 'bunga_bangkai': name = "Bunga Bangkai"; region = "Sumatera"; break;
            case 'aren': name = "Pohon Aren"; region = "Sumatera, Jawa"; break;
            case 'sagu': name = "Pohon Sagu"; region = "Papua, Maluku"; break;
            case 'gaharu': name = "Pohon Gaharu"; region = "Sumatera, Kalimantan"; break;
            case 'kemuning': name = "Kemuning"; region = "Jawa, Bali"; break;
            case 'pulai': name = "Pohon Pulai"; region = "Sumatera, Jawa"; break;
            case 'beringin': name = "Pohon Beringin"; region = "Nasional"; break;
            case 'kecubung': name = "Kecubung"; region = "Jawa"; break;
            case 'kenanga': name = "Kenanga"; region = "Jawa, Maluku"; break;
            case 'tanjung': name = "Pohon Tanjung"; region = "Nasional"; break;
        }

        return { name, region, desc: descText };
    };

    // Tempelkan di global namespace window
    window.PlantModels = PlantModels;
})();
