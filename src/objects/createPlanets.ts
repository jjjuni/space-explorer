import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three/examples/jsm/Addons.js";

interface PlanetOptions {
  model: string;
  material: string;
  position: [number, number, number];
  scale: number;
  bumpMap?: string;
  bumpScale?: number;
}

export function createPlanet(
  options: PlanetOptions,
  onLoad?: (planet: THREE.Group) => void,
) {
  const mtlLoader = new MTLLoader();
  const textureLoader = new THREE.TextureLoader();

  mtlLoader.load(
    options.material,
    (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();

      objLoader.setMaterials(materials);

      objLoader.load(
        options.model,
        (planet) => {
          planet.position.set(
            options.position[0],
            options.position[1],
            options.position[2],
          );

          planet.scale.setScalar(options.scale);

          // ----------------------------------------
          // Material
          // ----------------------------------------

          planet.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
              return;
            }

            const meshMaterials = Array.isArray(child.material)
              ? child.material
              : [child.material];

            meshMaterials.forEach((material) => {
              if (material instanceof THREE.MeshPhongMaterial) {
                // 광택 제거
                material.shininess = 0;
                material.specular.set(0x000000);
              }
            });
          });

          // ----------------------------------------
          // Bump Map
          // ----------------------------------------

          if (options.bumpMap) {
            const bumpTexture = textureLoader.load(options.bumpMap);

            planet.traverse((child) => {
              if (!(child instanceof THREE.Mesh)) {
                return;
              }

              const meshMaterials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              meshMaterials.forEach((material) => {
                if (material instanceof THREE.MeshPhongMaterial) {
                  material.bumpMap = bumpTexture;

                  material.bumpScale = options.bumpScale ?? 0.1;

                  material.needsUpdate = true;
                }
              });
            });
          }

          onLoad?.(planet);
        },
        undefined,
        (error) => {
          console.error("행성 OBJ 로드 실패:", error);
        },
      );
    },
    undefined,
    (error) => {
      console.error("행성 MTL 로드 실패:", error);
    },
  );
}
