export interface SatelliteConfig {
  name: string;
  model: string;
  position: [number, number, number];
  size: number;
  orbitSpeed: number;
  rotationSpeed: number;
}

export interface PlanetConfig {
  name: string;
  model: string;
  position: [number, number, number];
  size: number;
  diameter: number;
  description: string;
  moonCount: number;
  orbitSpeed: number;
  rotationSpeed: number;
  satellites?: SatelliteConfig[];
}

export const PLANETS: PlanetConfig[] = [
  {
    name: "Mercury",
    model: "/models/mercury/mercury.glb",
    position: [20, 0, 0],
    size: 1.2,
    diameter: 4879,
    description: "태양에 가장 가까우며 태양계에서 가장 작은 행성입니다.",
    moonCount: 0,
    orbitSpeed: 0.00058,
    rotationSpeed: 0.00069,
  },
  {
    name: "Venus",
    model: "/models/venus/venus.glb",
    position: [32, 0, 0],
    size: 2.8,
    diameter: 12104,
    description:
      "두꺼운 대기와 높은 표면 온도를 가진 태양계의 두 번째 행성입니다.",
    moonCount: 0,
    orbitSpeed: 0.00024,
    rotationSpeed: -0.0001,
  },
  {
    name: "Earth",
    model: "/models/earth/earth.glb",
    position: [45, 0, 0],
    size: 3,
    diameter: 12756,
    description:
      "액체 상태의 물이 존재하며 현재까지 생명체가 확인된 유일한 행성입니다.",
    moonCount: 1,
    orbitSpeed: 0.00015,
    rotationSpeed: 0.001,
    satellites: [
      {
        name: "Moon",
        model: "/models/moon/moon.glb",
        position: [0.4, 0, 0],
        size: 0.06,
        orbitSpeed: 0.00015,
        rotationSpeed: 0.00004,
      },
    ],
  },
  {
    name: "Mars",
    model: "/models/mars/mars.glb",
    position: [65, 0, 0],
    size: 2,
    diameter: 6792,
    description:
      "붉은 표면을 가진 암석 행성으로 두 개의 작은 위성을 가지고 있습니다.",
    moonCount: 2,
    orbitSpeed: 0.00008,
    rotationSpeed: 0.00097,
    satellites: [
      {
        name: "Phobos",
        model: "/models/phobos/phobos.glb",
        position: [2, 0, 0],
        size: 0.3,
        orbitSpeed: 0.0004,
        rotationSpeed: 0.0001,
      },
      {
        name: "Deimos",
        model: "/models/deimos/deimos.glb",
        position: [3, 0, 0],
        size: 0.2,
        orbitSpeed: 0.00008,
        rotationSpeed: 0.00005,
      },
    ],
  },
  {
    name: "Jupiter",
    model: "/models/jupiter/jupiter.glb",
    position: [95, 0, 0],
    size: 15,
    diameter: 142984,
    description: "태양계에서 가장 큰 행성으로 거대한 가스 행성입니다.",
    moonCount: 115,
    orbitSpeed: 0.000013,
    rotationSpeed: 0.0025,
    satellites: [
      {
        name: "Io",
        model: "/models/io/io.glb",
        position: [200, 0, 0],
        size: 5,
        orbitSpeed: 0.001,
        rotationSpeed: 0.00004,
      },
      {
        name: "Europa",
        model: "/models/europa/europa.glb",
        position: [250, 0, 0],
        size: 5.5,
        orbitSpeed: 0.00052,
        rotationSpeed: 0.00002,
      },
      {
        name: "Ganymede",
        model: "/models/ganymede/ganymede.glb",
        position: [300, 0, 0],
        size: 9,
        orbitSpeed: 0.00024,
        rotationSpeed: 0.00001,
      },
      {
        name: "Callisto",
        model: "/models/callisto/callisto.glb",
        position: [350, 0, 0],
        size: 8,
        orbitSpeed: 0.00011,
        rotationSpeed: 0.000008,
      },
    ],
  },
  {
    name: "Saturn",
    model: "/models/saturn/saturn.gltf",
    position: [135, 0, 0],
    size: 12,
    diameter: 120536,
    description:
      "거대한 얼음과 암석으로 이루어진 아름다운 고리를 가진 가스 행성입니다.",
    moonCount: 293,
    orbitSpeed: 0.000006,
    rotationSpeed: 0,
    satellites: [
      {
        name: "Titan",
        model: "/models/titan/titan.glb",
        position: [2000, 0, 0],
        size: 100,
        orbitSpeed: 0.002,
        rotationSpeed: 0.00002,
      },
    ],
  },
  {
    name: "Uranus",
    model: "/models/uranus/uranus.gltf",
    position: [170, 0, 0],
    size: 8,
    diameter: 51118,
    description:
      "푸른빛을 띠는 얼음 거인으로 자전축이 크게 기울어진 독특한 행성입니다.",
    moonCount: 29,
    orbitSpeed: 0.000002,
    rotationSpeed: 0,
  },
  {
    name: "Neptune",
    model: "/models/neptune/neptune.glb",
    position: [205, 0, 0],
    size: 8,
    diameter: 49528,
    description: "태양계에서 가장 바깥쪽에 위치한 푸른색의 얼음 거인입니다.",
    moonCount: 16,
    orbitSpeed: 0.000001,
    rotationSpeed: 0,
  },
];
