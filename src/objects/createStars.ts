import * as THREE from "three";

export function createStars() {
  const starCount = 5000;

  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  const starColors = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xbdd7ff),
    new THREE.Color(0xffe7c2),
    new THREE.Color(0xd8c8ff),
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 500;

    positions[i3 + 1] = (Math.random() - 0.5) * 500;

    positions[i3 + 2] = (Math.random() - 0.5) * 500;

    const color = starColors[Math.floor(Math.random() * starColors.length)];

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] =
      Math.random() < 0.03
        ? Math.random() * 0.8 + 1.0
        : Math.random() * 0.5 + 0.25;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,

    uniforms: {
      pixelRatio: {
        value: Math.min(window.devicePixelRatio, 2),
      },
    },

    vertexShader: `
      attribute float size;

      varying vec3 vColor;

      uniform float pixelRatio;

      void main() {
        vColor = color;

        vec4 mvPosition =
          modelViewMatrix *
          vec4(position, 1.0);

        gl_Position =
          projectionMatrix *
          mvPosition;

        gl_PointSize =
          size *
          pixelRatio *
          (300.0 / -mvPosition.z);
      }
    `,

    fragmentShader: `
      varying vec3 vColor;

      void main() {
        float distanceFromCenter =
          distance(
            gl_PointCoord,
            vec2(0.5)
          );

        float alpha =
          1.0 -
          smoothstep(
            0.0,
            0.5,
            distanceFromCenter
          );

        alpha = pow(alpha, 2.0);

        gl_FragColor =
          vec4(vColor, alpha);
      }
    `,
  });

  const stars = new THREE.Points(geometry, material);

  return {
    stars,
    geometry,
    material,
  };
}
