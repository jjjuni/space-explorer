import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

interface GLBPlanetOptions {
  model: string;
  position: [number, number, number];

  // 원하는 최종 지름
  size: number;

  rotation?: [number, number, number];
}

export function createGLBPlanet(
  options: GLBPlanetOptions,
  onLoad?: (planet: THREE.Group) => void,
) {
  const loader = new GLTFLoader();

  loader.load(
    options.model,
    (gltf) => {
      const planet = gltf.scene;

      // ----------------------------------------
      // 모델 크기 계산
      // ----------------------------------------

      const box = new THREE.Box3().setFromObject(planet);

      const size = new THREE.Vector3();

      box.getSize(size);

      const maxSize = Math.max(size.x, size.y, size.z);

      // ----------------------------------------
      // 크기 정규화
      // ----------------------------------------

      if (maxSize > 0) {
        const scale = options.size / maxSize;

        planet.scale.setScalar(scale);
      }

      // ----------------------------------------
      // 위치
      // ----------------------------------------

      planet.position.set(
        options.position[0],
        options.position[1],
        options.position[2],
      );

      // ----------------------------------------
      // 회전
      // ----------------------------------------

      if (options.rotation) {
        planet.rotation.set(
          options.rotation[0],
          options.rotation[1],
          options.rotation[2],
        );
      }

      // ----------------------------------------
      // Mesh 설정
      // ----------------------------------------

      planet.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = true;
        child.receiveShadow = true;
      });

      onLoad?.(planet);
    },
    undefined,
    (error) => {
      console.error(`${options.model} 로드 실패:`, error);
    },
  );
}
