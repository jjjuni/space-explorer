import * as THREE from "three";

interface SunOptions {
  texture: string;
  position: [number, number, number];
  radius: number;
}

export function createSun(options: SunOptions) {
  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load(options.texture);

  const geometry = new THREE.SphereGeometry(options.radius, 64, 64);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  const sun = new THREE.Mesh(geometry, material);

  sun.position.set(
    options.position[0],
    options.position[1],
    options.position[2],
  );

  return {
    sun,
    geometry,
    material,
  };
}
