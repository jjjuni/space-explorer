import * as THREE from "three";

export function createOrbit(radius: number) {
  const points: THREE.Vector3[] = [];

  const segments = 128;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;

    points.push(
      new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
  });

  return new THREE.LineLoop(geometry, material);
}
