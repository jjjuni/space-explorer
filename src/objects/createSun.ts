import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

interface SunOptions {
  model: string;
  position: [number, number, number];
  size: number;
}

export function createSun(
  options: SunOptions,
  onLoad?: (sun: THREE.Group) => void,
) {
  const loader = new GLTFLoader();

  loader.load(
    options.model,
    (gltf) => {
      const model = gltf.scene;

      // 모델 크기 계산
      model.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(model);

      const modelSize = new THREE.Vector3();

      box.getSize(modelSize);

      const maxSize = Math.max(modelSize.x, modelSize.y, modelSize.z);

      // 모델 중심 보정
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);

      // 지정한 크기로 스케일
      if (maxSize > 0) {
        const scale = options.size / maxSize;

        model.scale.setScalar(scale);
      }

      // 태양의 위치를 관리하는 Group
      const sun = new THREE.Group();

      sun.position.set(
        options.position[0],
        options.position[1],
        options.position[2],
      );

      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = true;
        child.receiveShadow = true;
      });

      sun.add(model);

      onLoad?.(sun);
    },
    undefined,
    (error) => {
      console.error(`${options.model} 로드 실패:`, error);
    },
  );
}
