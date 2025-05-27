// three-scene.js
// Scène spatiale élégante et légère pour le site Celestia

// S'assurer d'avoir Three.js en global (three.min.js doit être chargé AVANT ce script)

(function () {
  // ------- 1. Initialisation des éléments de la scène -------
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  // -- Taille responsive --
  let width = window.innerWidth;
  let height = window.innerHeight;

  // -- Renderer --
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setClearColor(0x000000, 0); // transparent
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // -- Scène et Camera --
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    200
  );
  camera.position.set(0, 0, 18);

  // ------- 2. Eclairage doux -------
  const ambient = new THREE.AmbientLight(0x237cfb, 0.38);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0x2faafc, 1.1, 50, 2);
  pointLight.position.set(9, 12, 13);
  scene.add(pointLight);

  // ------- 3. Création du fond spatial (étoiles/particules) -------
  // -- Générer une sphère de points (étoiles) mobiles --

  const starCount = 350;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = [];
  const starSpeeds = [];

  for (let i = 0; i < starCount; i++) {
    // Position dans une sphère creuse
    const r = 34 + Math.random() * 30;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    starPositions.push(x, y, z);

    // Chaque étoile a une vitesse lente (fausse perspective)
    starSpeeds.push(0.0007 + Math.random() * 0.0007);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x97e8fd,
    size: 0.24,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // ------- 4. Planète centrale rotative -------
  // -- Texture légère (dégradé via canvas) pour donner du relief même sans image --
  function createSimplePlanetTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');

    // Dégradé radial bleu nuit vers bleu clair
    const gradient = ctx.createRadialGradient(
      size * 0.55,
      size * 0.5,
      size * 0.21,
      size * 0.52,
      size * 0.47,
      size * 0.49
    );
    gradient.addColorStop(0.0, '#c5eaff');
    gradient.addColorStop(0.30, '#1c64a9');
    gradient.addColorStop(0.75, '#0b2348');
    gradient.addColorStop(1.0, '#141634');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Petites taches pour donner un effet nuage / relief
    for (let i = 0; i < 29; i++) {
      ctx.globalAlpha = 0.04 + Math.random() * 0.09;
      const r = 20 + Math.random() * 36;
      const x = Math.random() * (size - r);
      const y = Math.random() * (size - r);
      ctx.beginPath();
      ctx.arc(x + r / 2, y + r / 2, r, 0, 2 * Math.PI);
      ctx.fillStyle = ['#c3e0ff', '#238be3', '#2896b7', '#f6fafe'][Math.floor(Math.random() * 4)];
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(c);
  }

  const planetGeo = new THREE.SphereGeometry(5.2, 48, 48);
  const planetMat = new THREE.MeshPhysicalMaterial({
    map: createSimplePlanetTexture(),
    color: 0x1f3893,
    roughness: 0.33,
    metalness: 0.44,
    clearcoat: 0.17,
    sheen: 0.50,
    sheenColor: new THREE.Color(0x208bfc),
    transparent: false,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.set(0, 0, 0);
  scene.add(planet);

  // Légère atmosphère
  const atmGeo = new THREE.SphereGeometry(5.32, 48, 48);
  const atmMat = new THREE.MeshBasicMaterial({
    color: 0x92faff,
    transparent: true,
    opacity: 0.09,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const atmosphere = new THREE.Mesh(atmGeo, atmMat);
  planet.add(atmosphere);

  // ------- 5. Galaxy Glow (halo effet derrière planète) -------
  const haloGeo = new THREE.RingGeometry(7, 12.2, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x2291ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.18,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.z = -2.6;
  planet.add(halo);

  // ------- 6. Animation --------
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // -- Animation de la planète centrale
    planet.rotation.y += 0.0041;
    planet.rotation.x = Math.sin(clock.getElapsedTime() * 0.18) * 0.07;

    // -- Atmosphère rotation opposée subtile
    atmosphere.rotation.y -= 0.0025;

    // -- Mouvement des étoiles (léger effet d'orbite)
    let positions = starGeo.getAttribute('position');
    for (let i = 0; i < starCount; i++) {
      let idx = i * 3;
      let angle = clock.getElapsedTime() * starSpeeds[i] + i;
      let r = Math.sqrt(
        positions.array[idx] * positions.array[idx] +
        positions.array[idx + 1] * positions.array[idx + 1]
      );
      const x0 = positions.array[idx];
      const y0 = positions.array[idx + 1];
      // Tourne chaque étoile lentement sur l'axe Z
      positions.array[idx]     = x0 * Math.cos(0.0005) - y0 * Math.sin(0.0005);
      positions.array[idx + 1] = x0 * Math.sin(0.0005) + y0 * Math.cos(0.0005);
    }
    positions.needsUpdate = true;

    // -- Halo pulsant léger --
    halo.material.opacity = 0.10 + 0.09 * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 0.65));

    renderer.render(scene, camera);
  }

  animate();

  // ------- 7. Responsivité -------
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  // ------- 8. Astuce : Recalage sur la section "Accueil" -------
  // Si la section "Accueil" n'est pas plein écran, caler la hauteur du canvas pour
  // ne pas dépasser visuellement
  function adjustCanvasSizeToSection() {
    const hero = document.getElementById('accueil');
    if (hero) {
      canvas.style.position = "absolute";
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.width = "100vw";
      // Hauteur de la section "accueil", ou fenêtre si pas trouvée
      let h = hero.offsetHeight || window.innerHeight;
      canvas.style.height = h + "px";
      renderer.setSize(window.innerWidth, h, false);
    }
  }

  window.addEventListener('resize', adjustCanvasSizeToSection);
  window.addEventListener('DOMContentLoaded', adjustCanvasSizeToSection);
  adjustCanvasSizeToSection();

  // ------- FIN -------
})();