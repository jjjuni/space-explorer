import * as THREE from "three";

import { createPlanet } from "./objects/createPlanets";
import { createStars } from "./objects/createStars";

import { KeyboardController } from "./controls/KeyboardController";
import { MouseLookController } from "./controls/MouseLookController";
import { createSun } from "./objects/createSun";

export function createSpaceScene(container: HTMLDivElement) {
  // ----------------------------------------
  // Scene
  // ----------------------------------------

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x02030a);

  // ----------------------------------------
  // Camera
  // ----------------------------------------

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    5000,
  );

  camera.position.set(0, 100, 100);
  camera.lookAt(0, 0, 0);

  // ----------------------------------------
  // Renderer
  // ----------------------------------------

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.setSize(container.clientWidth, container.clientHeight);

  container.appendChild(renderer.domElement);

  // ----------------------------------------
  // ⭐ Stars
  // ----------------------------------------

  const {
    stars,
    geometry: starGeometry,
    material: starMaterial,
  } = createStars();

  scene.add(stars);

  // ----------------------------------------
  // ☀️ Sun
  // ----------------------------------------

  const {
    sun,
    geometry: sunGeometry,
    material: sunMaterial,
  } = createSun({
    texture: "/models/sun/sun.png",
    position: [0, 0, 0],
    radius: 10,
  });

  scene.add(sun);

  // ----------------------------------------
  // 💡 Light
  // ----------------------------------------

  // 전체적으로 너무 어두워지지 않도록
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  scene.add(ambientLight);

  // 태양에서 나오는 빛
  const sunLight = new THREE.PointLight(0xffffff, 5000, 3000);

  sunLight.position.copy(sun.position);

  scene.add(sunLight);

  // ----------------------------------------
  // 🌍 Earth Orbit
  // ----------------------------------------

  const earthOrbit = new THREE.Group();

  scene.add(earthOrbit);

  createPlanet(
    {
      model: "/models/earth/Earth 2K.obj",
      material: "/models/earth/Earth 2K.mtl",

      // 태양으로부터의 거리
      position: [60, 0, 0],

      scale: 2,

      bumpMap: "/models/earth/Bump_2K.png",
    },
    (earth) => {
      earthOrbit.add(earth);

      // 지구 자전 속도
      earth.userData.rotationSpeed = 0.002;

      // ----------------------------------------
      // 🌕 Moon Orbit
      // ----------------------------------------

      const moonOrbit = new THREE.Group();

      earth.add(moonOrbit);

      createPlanet(
        {
          model: "/models/moon/Moon 2K.obj",
          material: "/models/moon/Moon 2K.mtl",

          // 지구로부터의 거리
          position: [10, 0, 0],

          scale: 0.6,

          bumpMap: "/models/moon/Bump_2K.png",
        },
        (moon) => {
          moonOrbit.add(moon);

          // 달 자전 속도
          moon.userData.rotationSpeed = 0.001;
        },
      );

      // 달의 공전 속도
      moonOrbit.userData.orbitSpeed = 0.001;
    },
  );

  // 지구의 공전 속도
  earthOrbit.userData.orbitSpeed = 0.0003;

  // ----------------------------------------
  // 🔴 Mars Orbit
  // ----------------------------------------

  const marsOrbit = new THREE.Group();

  scene.add(marsOrbit);

  createPlanet(
    {
      model: "/models/mars/Mars 2K.obj",
      material: "/models/mars/Mars 2K.mtl",

      // 태양으로부터의 거리
      position: [120, 0, 0],

      scale: 2,

      bumpMap: "/models/mars/Bump_2K.png",
    },
    (mars) => {
      marsOrbit.add(mars);

      // 화성 자전 속도
      mars.userData.rotationSpeed = 0.0015;
    },
  );

  // 화성 공전 속도
  marsOrbit.userData.orbitSpeed = 0.00015;

  // ----------------------------------------
  // 🎮 Controls
  // ----------------------------------------

  const keyboardController = new KeyboardController(camera);

  const mouseLookController = new MouseLookController(
    camera,
    renderer.domElement,
  );

  // ----------------------------------------
  // Animation
  // ----------------------------------------

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    keyboardController.update(delta);

    // ----------------------------------------
    // ⭐ 별
    // ----------------------------------------

    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.00001;

    // ----------------------------------------
    // ☀️ 태양 자전
    // ----------------------------------------

    sun.rotation.y += 0.0005;

    // ----------------------------------------
    // 🌍 지구 공전
    // ----------------------------------------

    earthOrbit.rotation.y += earthOrbit.userData.orbitSpeed;

    // 지구 자전
    const earth = earthOrbit.children[0];

    if (earth) {
      earth.rotation.y += earth.userData.rotationSpeed;
    }

    // ----------------------------------------
    // 🌕 달 공전
    // ----------------------------------------

    if (earth) {
      const moonOrbit = earth.children.find(
        (child) => child instanceof THREE.Group,
      ) as THREE.Group | undefined;

      if (moonOrbit) {
        moonOrbit.rotation.y += moonOrbit.userData.orbitSpeed;
      }

      // 달 자전
      const moon = moonOrbit?.children[0];

      if (moon) {
        moon.rotation.y += moon.userData.rotationSpeed;
      }
    }

    // ----------------------------------------
    // 🔴 화성 공전
    // ----------------------------------------

    marsOrbit.rotation.y += marsOrbit.userData.orbitSpeed;

    // 화성 자전
    const mars = marsOrbit.children[0];

    if (mars) {
      mars.rotation.y += mars.userData.rotationSpeed;
    }

    // ----------------------------------------
    // Render
    // ----------------------------------------

    renderer.render(scene, camera);
  }

  animate();

  // ----------------------------------------
  // Resize
  // ----------------------------------------

  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    starMaterial.uniforms.pixelRatio.value = Math.min(
      window.devicePixelRatio,
      2,
    );
  }

  window.addEventListener("resize", handleResize);

  // ----------------------------------------
  // Cleanup
  // ----------------------------------------

  return () => {
    keyboardController.dispose();

    mouseLookController.dispose();

    window.removeEventListener("resize", handleResize);

    starGeometry.dispose();
    starMaterial.dispose();

    sunGeometry.dispose();
    sunMaterial.dispose();

    renderer.dispose();

    container.removeChild(renderer.domElement);
  };
}
