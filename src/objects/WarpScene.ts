import * as THREE from "three";
import { createNebula } from "./createNebula";

interface WarpSceneOptions {
  container: HTMLElement;
}

export class WarpScene {
  private container: HTMLElement;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private stars: THREE.LineSegments;
  private starGeometry: THREE.BufferGeometry;
  private starMaterial: THREE.LineBasicMaterial;

  private nebula: THREE.Mesh;
  private nebulaGeometry: THREE.BufferGeometry;
  private nebulaMaterial: THREE.ShaderMaterial;

  private clock = new THREE.Clock();
  private animationId = 0;

  // =========================================================
  // Warp
  // =========================================================

  private speed = 2;

  private isExiting = false;
  private exitProgress = 0;

  private readonly exitDuration = 1;

  // =========================================================
  // Mouse Look
  // =========================================================

  private yaw = 0;
  private pitch = 0;

  private targetYaw = 0;
  private targetPitch = 0;

  private readonly mouseSensitivity = 0.002;
  private readonly mouseSmoothness = 0.12;

  private readonly maxPitch = THREE.MathUtils.degToRad(70);

  // =========================================================
  // Stars
  // =========================================================

  private readonly starCount = 1000;
  private readonly starDepth = 2000;

  private readonly minStarLength = 20;
  private readonly maxStarLength = 65;

  private disposed = false;

  constructor({ container }: WarpSceneOptions) {
    this.container = container;

    // =====================================================
    // Scene
    // =====================================================

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0x01020a);

    // =====================================================
    // Camera
    // =====================================================

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      3000,
    );

    this.camera.position.set(0, 0, 0);

    // =====================================================
    // Renderer
    // =====================================================

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.renderer.domElement.style.display = "block";

    container.appendChild(this.renderer.domElement);

    // =====================================================
    // Nebula
    // =====================================================

    const nebula = createNebula();

    this.nebula = nebula.mesh;

    this.nebulaGeometry = nebula.geometry;

    this.nebulaMaterial = nebula.material;

    this.scene.add(this.nebula);

    // =====================================================
    // Stars
    // =====================================================

    const stars = this.createWarpStars();

    this.stars = stars.stars;

    this.starGeometry = stars.geometry;

    this.starMaterial = stars.material;

    this.scene.add(this.stars);

    // =====================================================
    // Events
    // =====================================================

    window.addEventListener("resize", this.handleResize);

    window.addEventListener("mousemove", this.handleMouseMove);

    // =====================================================
    // Start
    // =====================================================

    this.animate();
  }

  // =========================================================
  // Stars
  // =========================================================

  private createWarpStars(): {
    stars: THREE.LineSegments;
    geometry: THREE.BufferGeometry;
    material: THREE.LineBasicMaterial;
  } {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.starCount * 2 * 3);

    const colors = new Float32Array(this.starCount * 2 * 3);

    const starColors = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xc7dcff),
      new THREE.Color(0xaabfff),
      new THREE.Color(0xd7c2ff),
      new THREE.Color(0xffdfb5),
      new THREE.Color(0x9de8ff),
    ];

    for (let i = 0; i < this.starCount; i++) {
      const i6 = i * 6;

      // -----------------------------------------------
      // 카메라 앞쪽 공간에 별 배치
      // -----------------------------------------------

      const x = THREE.MathUtils.randFloat(-500, 500);

      const y = THREE.MathUtils.randFloat(-500, 500);

      const z = THREE.MathUtils.randFloat(-this.starDepth, 0);

      // -----------------------------------------------
      // Star Length
      // -----------------------------------------------

      const length = THREE.MathUtils.randFloat(
        this.minStarLength,
        this.maxStarLength,
      );

      // -----------------------------------------------
      // 앞쪽
      // -----------------------------------------------

      positions[i6] = x;
      positions[i6 + 1] = y;
      positions[i6 + 2] = z;

      // -----------------------------------------------
      // 뒤쪽
      // -----------------------------------------------

      positions[i6 + 3] = x;
      positions[i6 + 4] = y;
      positions[i6 + 5] = z - length;

      // -----------------------------------------------
      // Color
      // -----------------------------------------------

      const color = starColors[Math.floor(Math.random() * starColors.length)];

      const brightness = THREE.MathUtils.randFloat(0.65, 1);

      colors[i6] = color.r * brightness;

      colors[i6 + 1] = color.g * brightness;

      colors[i6 + 2] = color.b * brightness;

      colors[i6 + 3] = color.r * brightness * 0.05;

      colors[i6 + 4] = color.g * brightness * 0.05;

      colors[i6 + 5] = color.b * brightness * 0.05;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.LineSegments(geometry, material);

    stars.frustumCulled = false;

    return {
      stars,
      geometry,
      material,
    };
  }

  // =========================================================
  // Mouse Look
  // =========================================================

  private handleMouseMove = (event: MouseEvent) => {
    if (this.disposed) {
      return;
    }

    // 마우스 이동량
    this.targetYaw -= event.movementX * this.mouseSensitivity;

    this.targetPitch -= event.movementY * this.mouseSensitivity;

    // 위아래 회전 제한
    this.targetPitch = THREE.MathUtils.clamp(
      this.targetPitch,
      -this.maxPitch,
      this.maxPitch,
    );
  };

  private updateMouseLook() {
    // 부드럽게 따라가기
    this.yaw = THREE.MathUtils.lerp(
      this.yaw,
      this.targetYaw,
      this.mouseSmoothness,
    );

    this.pitch = THREE.MathUtils.lerp(
      this.pitch,
      this.targetPitch,
      this.mouseSmoothness,
    );

    // Euler 순서
    this.camera.rotation.order = "YXZ";

    this.camera.rotation.y = this.yaw;

    this.camera.rotation.x = this.pitch;
  }

  // =========================================================
  // Animation
  // =========================================================

  private animate = () => {
    if (this.disposed) {
      return;
    }

    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    this.updateWarp(delta);

    // 마우스 시점
    this.updateMouseLook();

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  // =========================================================
  // Warp Update
  // =========================================================

  private updateWarp(delta: number) {
    const currentSpeed = this.isExiting
      ? THREE.MathUtils.lerp(4, 8, 1 - Math.pow(1 - this.exitProgress, 3))
      : 4;

    // 카메라 전진
    this.camera.position.z -= currentSpeed * 60 * delta;

    if (!this.isExiting) {
      return;
    }

    this.exitProgress += delta / this.exitDuration;

    const progress = THREE.MathUtils.clamp(this.exitProgress, 0, 1);

    const eased = 1 - Math.pow(1 - progress, 3);

    // 속도 증가
    this.speed = THREE.MathUtils.lerp(4, 8, eased);

    // FOV 증가
    this.camera.fov = THREE.MathUtils.lerp(75, 110, eased);

    this.camera.updateProjectionMatrix();
  }

  // =========================================================
  // Exit
  // =========================================================

  startExit(onComplete: () => void) {
    if (this.isExiting || this.disposed) {
      return;
    }

    this.isExiting = true;
    this.exitProgress = 0;

    window.setTimeout(() => {
      if (this.disposed) {
        return;
      }

      onComplete();
    }, this.exitDuration * 1000);
  }

  // =========================================================
  // Resize
  // =========================================================

  private handleResize = () => {
    if (this.disposed) {
      return;
    }

    const width = this.container.clientWidth;

    const height = this.container.clientHeight;

    this.camera.aspect = width / height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.5));
  };

  // =========================================================
  // Dispose
  // =========================================================

  dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    cancelAnimationFrame(this.animationId);

    window.removeEventListener("resize", this.handleResize);

    window.removeEventListener("mousemove", this.handleMouseMove);

    this.starGeometry.dispose();
    this.starMaterial.dispose();

    this.nebulaGeometry.dispose();
    this.nebulaMaterial.dispose();

    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
