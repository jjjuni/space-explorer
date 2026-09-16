import * as THREE from "three";

interface CreateNebulaResult {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
}

export function createNebula(): CreateNebulaResult {
  const geometry = new THREE.SphereGeometry(4000, 8, 8);

  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,

    uniforms: {
      time: {
        value: 0,
      },

      topColor: {
        value: new THREE.Color(0x1b122d),
      },

      bottomColor: {
        value: new THREE.Color(0x040208),
      },

      nebulaColor1: {
        value: new THREE.Color(0x593052),
      },

      nebulaColor2: {
        value: new THREE.Color(0x363568),
      },
    },

    vertexShader: `
      varying vec3 vDirection;

      void main() {
        vDirection = normalize(position);

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform float time;

      uniform vec3 topColor;
      uniform vec3 bottomColor;

      uniform vec3 nebulaColor1;
      uniform vec3 nebulaColor2;

      varying vec3 vDirection;

      float hash(vec3 p) {
        p = fract(
          p * 0.3183099 +
          vec3(0.1, 0.2, 0.3)
        );

        p *= 17.0;

        return fract(
          p.x *
          p.y *
          p.z *
          (
            p.x +
            p.y +
            p.z
          )
        );
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);

        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i);
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));

        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        return mix(
          mix(
            mix(n000, n100, f.x),
            mix(n010, n110, f.x),
            f.y
          ),
          mix(
            mix(n001, n101, f.x),
            mix(n011, n111, f.x),
            f.y
          ),
          f.z
        );
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;

        for (int i = 0; i < 3; i++) {
          value += noise(p) * amplitude;

          p *= 2.0;
          amplitude *= 0.5;
        }

        return value;
      }

      void main() {
        vec3 direction =
          normalize(vDirection);

        float height =
          direction.y;

        float gradient =
          smoothstep(
            -0.7,
            0.8,
            height
          );

        vec3 color =
          mix(
            bottomColor,
            topColor,
            gradient
          );

        float angle =
          atan(
            direction.z,
            direction.x
          );

        float radial =
          acos(
            clamp(
              direction.y,
              -1.0,
              1.0
            )
          );

        // 기존 성운
        vec3 nebulaPos =
          direction * 3.0;

        nebulaPos.x +=
          sin(angle * 2.0) * 0.7;

        nebulaPos.z +=
          cos(angle * 3.0) * 0.5;

        float n1 =
          fbm(nebulaPos);

        vec3 nebulaPos2 =
          direction * 6.0;

        nebulaPos2.x +=
          sin(angle * 4.0) * 0.8;

        float n2 =
          fbm(nebulaPos2);

        float band =
          1.0 -
          abs(radial - 1.35);

        band =
          smoothstep(
            0.0,
            0.55,
            band
          );

        float nebula1 =
          smoothstep(
            0.38,
            0.72,
            n1
          );

        float nebula2 =
          smoothstep(
            0.45,
            0.75,
            n2
          );

        color +=
          nebulaColor1 *
          nebula1 *
          band *
          0.65;

        color +=
          nebulaColor2 *
          nebula2 *
          band *
          0.55;

        // 중앙의 푸른빛
        float center =
          1.0 -
          abs(direction.y);

        center =
          pow(
            center,
            8.0
          );

        color +=
          vec3(
            0.08,
            0.10,
            0.28
          ) *
          center;

        // 아래쪽 성운
        float lowerBand =
          smoothstep(
            0.0,
            0.8,
            1.0 -
            abs(direction.y + 0.35)
          );

        color +=
          nebulaColor2 *
          n2 *
          lowerBand *
          0.25;

        float vignette =
          smoothstep(
            1.25,
            0.25,
            abs(direction.y)
          );

        color *=
          0.7 +
          vignette * 0.3;

        gl_FragColor =
          vec4(
            color,
            1.0
          );
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.frustumCulled = false;

  return {
    mesh,
    geometry,
    material,
  };
}
