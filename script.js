// script.js - Celestia, animations et 3D immersives

// ========== 1. Animations d'apparition au scroll ==========

// Liste des classes d'animation à gérer
const animatedClasses = [
  'animated-fadein',
  'animated-risein'
];

// Fonction d'initialisation de l'IntersectionObserver
function initAppearAnimations() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated-show');
        obs.unobserve(entry.target); // Animation une seule fois
      }
    });
  }, {
    threshold: 0.18
  });

  animatedClasses.forEach(animClass => {
    document.querySelectorAll(`.${animClass}`).forEach(el => {
      observer.observe(el);
    });
  });
}

// Appel à l'initialisation au chargement
window.addEventListener('DOMContentLoaded', initAppearAnimations);


// ========== 2. Smooth Scroll sur les liens d'ancrage ==========

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const hash = anchor.getAttribute('href');
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Fermer le menu mobile si besoin
      if (window.innerWidth < 701) {
        closeMobileMenu();
      }
    }
  });
});

// ========== 3. Menu Burger Mobile ==========

const burger = document.getElementById('burger-menu');
const nav = document.querySelector('.nav-header nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    burger.classList.toggle('open');
  });
}
function closeMobileMenu() {
  nav.classList.remove('open');
  burger.classList.remove('open');
}

// ========== 4. Effets de survol sur les boutons (GSAP recommandé) ==========

// Attire l'oeil et donne du feedback sur chaque bouton d'appel à l'action
function initButtonHover() {
  document.querySelectorAll('.cta-primary, .cta-secondary, .cta-header').forEach(btn => {
    // Utilise GSAP si dispo, sinon fallback CSS
    if (window.gsap) {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.07, duration: 0.18, boxShadow: "0 8px 30px #008aff33", overwrite: "auto" });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.21, boxShadow: "0 4px 18px 0 #0fffc149", overwrite: "auto" });
      });
    }
  });
}
window.addEventListener('DOMContentLoaded', initButtonHover);

// ========== 5. GSAP/ScrollTrigger — animation synchronisée au scroll (optionnel) ==========

// Petit effet de parallaxe sur la planète si GSAP/ScrollTrigger chargés
function gsapParallaxPlanet() {
  if (window.gsap && window.ScrollTrigger && document.getElementById('three-bg')) {
    gsap.to('#three-bg', {
      scrollTrigger: {
        trigger: '#accueil',
        start: "top top",
        end: "bottom 20%",
        scrub: true
      },
      y: 100,
      opacity: 0.3,
      ease: "power1.out"
    });
  }
}
window.addEventListener('DOMContentLoaded', gsapParallaxPlanet);

// ========== 6. Three.js — Scène 3D Cosmique pour l’accueil ==========

import * as THREE from './three.min.js'; // Si vous utilisez modules. Sinon, dépend du build.

function initThreeBG() {
  const container = document.getElementById('three-bg');
  if (!container) return;

  // -- 3D Scene Setup --
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0); // transparent for overlay
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000);
  camera.position.z = 17.5;
  camera.position.y = 1.8;

  // Lights
  const ambient = new THREE.AmbientLight(0x70aaff, 0.39);
  scene.add(ambient);

  const pointLight1 = new THREE.PointLight(0x0080ff, 1.05, 60, 2.4);
  pointLight1.position.set(-13, 10, 25);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x0fffc2, 0.78, 40, 2.1);
  pointLight2.position.set(12, -12, 20);
  scene.add(pointLight2);

  // --- Main Planet ---
  const geometry = new THREE.SphereGeometry(5.2, 48, 48);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x1589ff,
    roughness: 0.32,
    metalness: 0.56,
    clearcoat: 0.3,
    clearcoatRoughness: 0.23,
    sheen: 0.73,
    sheenColor: new THREE.Color(0x006aff),
    opacity: 0.99,
    transparent: true,
    transmission: 0.14
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(0, 0, 0);
  scene.add(planet);

  // --- Subtle "Atmosphere" glow ---
  const atmGeometry = new THREE.SphereGeometry(5.38, 60, 60);
  const atmMaterial = new THREE.MeshBasicMaterial({
    color: 0x43dfff,
    transparent: true,
    opacity: 0.13,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
  scene.add(atmosphere);

  // --- Starfield / particles ---
  const starCount = 340;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < starCount; i++) {
    // In a large spherical shell
    const r = 35 + Math.random() * 38;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xbbf6fb,
    size: 0.29,
    transparent: true,
    opacity: 0.68
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ---- Responsive update ----
  function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onWindowResize);

  // ---- Animation loop ----
  let planetAngle = 0;

  function animate() {
    planetAngle += 0.0025;
    planet.rotation.y = planetAngle;
    planet.rotation.x = Math.sin(planetAngle) * 0.021;
    atmosphere.rotation.y = -planetAngle * 1.01;
    stars.rotation.y += 0.00023;

    // Subtle camera motion for immersion
    camera.position.x = Math.sin(planetAngle) * 0.76;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

window.addEventListener('DOMContentLoaded', initThreeBG);


// ========== 7. Apparition/Zoom anim. sur héros avec GSAP (bonus si GSAP chargé) ==========

function heroIntroAnim() {
  if (!window.gsap) return;
  const tl = gsap.timeline();
  tl.from(".hero h1",    { y: 40, opacity: 0, ease: "expo.out", duration: 0.77 })
    .from(".hero h2",    { y: 22, opacity: 0, ease: "expo.out", duration: 0.55 }, "-=0.41")
    .from(".hero-sub",   { y: 32, opacity: 0, ease: "expo.out", duration: 0.44 }, "-=0.29")
    .from(".hero-buttons",  { scale: 0.86, opacity: 0, duration: 0.39, ease:"expo.out" }, "-=0.27")
    .from(".scroll-indicator", { opacity: 0, duration: 0.7, ease:"sine.out" }, "-=0.53");
}
window.addEventListener('DOMContentLoaded', heroIntroAnim);


// ========== 8. Soumission du formulaire contact (optionnel: feedback, pas d'envoi réel ici) ==========

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Animation GSAP si chargé
    if (window.gsap) {
      gsap.to(this, { scale: 1.05, boxShadow: "0 0 25px #0fffc233", duration: 0.22, yoyo: true, repeat: 1 });
    }
    // Reset and feedback
    setTimeout(() => {
      this.reset();
      // Affiche une mini notification sans recharger
      const notif = document.createElement('div');
      notif.textContent = "Merci ! Votre message a bien été envoyé 🚀";
      notif.style.cssText = `
        position: absolute; left: 50%; top: 13px; transform: translateX(-50%);
        background: #0061ff; color: white; border-radius: 20px; padding: 8px 18px;
        box-shadow: 0 2px 18px #0fffc24a; letter-spacing:0.01em; z-index:200;
        font-weight:600; font-size:1.12rem; opacity:0.94;
      `;
      this.parentNode.appendChild(notif);
      setTimeout(() => notif.remove(), 3000);
    }, 350);
  });
}

// ========== 9. Curseur stylisé sur le hero (bonus immersif) ==========
/*
Optionnel : ajoute un léger effet de parallax sur le contenu du hero selon le mouvement de la souris pour plus d'immersion.
*/
const heroContent = document.querySelector('.hero-content');
if (heroContent) {
  heroContent.addEventListener('mousemove', e => {
    if (window.innerWidth < 860) return;
    const { left, top, width, height } = heroContent.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    heroContent.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale(1.025)`;
  });
  heroContent.addEventListener('mouseleave', () => {
    heroContent.style.transform = '';
  });
}

// ========== THE END ==========