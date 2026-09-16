import * as THREE from "three";
import { PLANETS } from "./constants/planets";
import { KeyboardController } from "./controls/KeyboardController";
import { MouseLookController } from "./controls/MouseLookController";
import { PlanetFocusController } from "./controls/PlanetFocusController";
import { createGLBPlanet } from "./objects/createGLBPlanet";
import { createNebula } from "./objects/createNebula";
import { createOrbit } from "./objects/createOrbit";
import { createStars } from "./objects/createStars";
import { createSun } from "./objects/createSun";

export function createSpaceScene(container: HTMLElement, onLoaded: () => void) {
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x02030a);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    10000,
  );

  camera.position.set(0, 60, 100);

  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.setSize(container.clientWidth, container.clientHeight);

  container.appendChild(renderer.domElement);

  // =====================================================
  // Nebula
  // =====================================================

  const {
    mesh: nebula,
    geometry: nebulaGeometry,
    material: nebulaMaterial,
  } = createNebula();

  scene.add(nebula);

  // =====================================================
  // Stars
  // =====================================================

  const {
    stars,
    geometry: starGeometry,
    material: starMaterial,
  } = createStars();

  scene.add(stars);

  // =====================================================
  // Lights
  // =====================================================

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffffff, 5000, 0);

  sunLight.position.set(0, 0, 0);

  scene.add(sunLight);

  // =====================================================
  // Sun
  // =====================================================

  let sun: THREE.Group | null = null;

  createSun(
    {
      model: "/models/sun/sun.glb",
      position: [0, 0, 0],
      size: 10,
    },
    (loadedSun) => {
      sun = loadedSun;

      scene.add(loadedSun);

      sunLight.position.copy(loadedSun.position);
    },
  );

  // =====================================================
  // Planets
  // =====================================================

  const planetOrbits = new Map<string, THREE.Group>();

  const planets: THREE.Group[] = [];

  let loadedPlanetCount = 0;

  PLANETS.forEach((planetConfig) => {
    const planetOrbit = new THREE.Group();

    planetOrbit.userData.orbitSpeed = planetConfig.orbitSpeed;

    planetOrbits.set(planetConfig.name, planetOrbit);

    scene.add(planetOrbit);

    const orbit = createOrbit(planetConfig.position[0]);

    scene.add(orbit);

    createGLBPlanet(
      {
        model: planetConfig.model,
        position: planetConfig.position,
        size: planetConfig.size,
      },
      (planet) => {
        planet.userData.rotationSpeed = planetConfig.rotationSpeed;

        planet.userData.config = planetConfig;

        planetOrbit.add(planet);

        planets.push(planet);

        // =========================================
        // Satellites
        // =========================================

        planetConfig.satellites?.forEach((satelliteConfig) => {
          const satelliteOrbit = new THREE.Group();

          satelliteOrbit.userData.orbitSpeed = satelliteConfig.orbitSpeed;

          planet.add(satelliteOrbit);

          createGLBPlanet(
            {
              model: satelliteConfig.model,
              position: satelliteConfig.position,
              size: satelliteConfig.size,
            },
            (satellite) => {
              satellite.userData.rotationSpeed = satelliteConfig.rotationSpeed;

              satelliteOrbit.add(satellite);
            },
          );
        });

        // =========================================
        // Main planet loading
        // =========================================

        loadedPlanetCount += 1;

        if (loadedPlanetCount === PLANETS.length) {
          onLoaded();
        }
      },
    );
  });

  // =====================================================
  // Controllers
  // =====================================================

  const keyboardController = new KeyboardController(camera);

  const mouseLookController = new MouseLookController(
    camera,
    renderer.domElement,
  );

  const planetFocusController = new PlanetFocusController(camera);

  // =====================================================
  // Animation
  // =====================================================

  const clock = new THREE.Clock();

  let animationId = 0;
  let started = false;

  let previousFocusState = false;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const delta = clock.getDelta();

    const isFocused = planetFocusController.isFocused();

    const isTransitioning = planetFocusController.isTransitioningMode();

    // ==========================================
    // Player movement
    // ==========================================

    if (!isFocused && !isTransitioning) {
      keyboardController.update(delta);
    }

    if (isTransitioning) {
      keyboardController.decelerate(delta);
    }

    // ==========================================
    // Stars
    // ==========================================

    stars.rotation.y += 0.0001;

    stars.rotation.x += 0.00001;

    // ==========================================
    // Sun
    // ==========================================

    if (sun) {
      sun.rotation.y += 0.0005;
    }

    // ==========================================
    // Planet orbit
    // ==========================================

    planetOrbits.forEach((planetOrbit) => {
      planetOrbit.rotation.y += planetOrbit.userData.orbitSpeed;

      const planet = planetOrbit.children[0];

      if (!planet) return;

      planet.rotation.y += planet.userData.rotationSpeed;

      const satelliteOrbits = planet.children.filter(
        (child) => child.userData.orbitSpeed !== undefined,
      ) as THREE.Group[];

      satelliteOrbits.forEach((satelliteOrbit) => {
        satelliteOrbit.rotation.y += satelliteOrbit.userData.orbitSpeed;

        const satellite = satelliteOrbit.children[0];

        if (!satellite) return;

        satellite.rotation.y += satellite.userData.rotationSpeed;
      });
    });

    // ==========================================
    // Focus
    // ==========================================

    planetFocusController.update(planets, delta);

    mouseLookController.setLocked(planetFocusController.isFocused());

    const currentFocused = planetFocusController.isFocused();

    if (currentFocused !== previousFocusState) {
      if (!currentFocused) {
        mouseLookController.syncFromCamera();
      }

      mouseLookController.setLocked(currentFocused);

      previousFocusState = currentFocused;
    }

    renderer.render(scene, camera);
  }

  // =====================================================
  // Start
  // =====================================================

  function start() {
    if (started) return;

    started = true;

    clock.start();

    animate();
  }

  // =====================================================
  // Resize
  // =====================================================

  function handleResize() {
    const width = container.clientWidth;

    const height = container.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  window.addEventListener("resize", handleResize);

  // =====================================================
  // Cleanup
  // =====================================================

  function cleanup() {
    cancelAnimationFrame(animationId);

    keyboardController.dispose();

    mouseLookController.dispose();

    planetFocusController.dispose();

    window.removeEventListener("resize", handleResize);

    starGeometry.dispose();
    starMaterial.dispose();

    nebulaGeometry.dispose();
    nebulaMaterial.dispose();

    renderer.dispose();

    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  }

  return {
    start,
    cleanup,
  };
}
