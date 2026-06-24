// Mengurangi jitter visual dengan Exponential Smoothing Filter
let targetPosition = new THREE.Vector3();
let currentPosition = new THREE.Vector3();
const alpha = 0.2; // Faktor kehalusan filter smoothing (0 < alpha <= 1)

AFRAME.registerComponent('smoothing-handler', {
  tick: function () {
    let markerEl = document.querySelector('#botani-marker');
    let modelEntity = document.querySelector('#render-object');
    
    if (markerEl && markerEl.object3D.visible && modelEntity) {
      // Ambil posisi real-time hasil estimasi matriks transformasi AR.js
      targetPosition.copy(markerEl.object3D.position);
      
      // Rumus Exponential Smoothing Filter: Bersihan posisi = (alpha * target) + ((1 - alpha) * posisi_sekarang)
      currentPosition.x = (alpha * targetPosition.x) + ((1 - alpha) * currentPosition.x);
      currentPosition.y = (alpha * targetPosition.y) + ((1 - alpha) * currentPosition.y);
      currentPosition.z = (alpha * targetPosition.z) + ((1 - alpha) * currentPosition.z);
      
      // Terapkan koordinat baru yang sudah dihaluskan ke entitas objek 3D
      modelEntity.object3D.position.copy(currentPosition);
    }
  }
});
