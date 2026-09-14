import * as THREE from "three";

export class MouseLookController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  private yaw = 0;
  private pitch = 0;

  private sensitivity = 0.002;

  private isFirstClick = true;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.domElement.addEventListener("click", this.handleClick);

    document.addEventListener("mousemove", this.handleMouseMove);
  }

  private handleClick = () => {
    // 최초 클릭일 때만 원점을 바라봄
    if (this.isFirstClick) {
      this.lookAtOrigin();

      this.isFirstClick = false;
    }

    this.domElement.requestPointerLock();
  };

  private lookAtOrigin() {
    const direction = new THREE.Vector3();

    direction
      .subVectors(new THREE.Vector3(0, 0, 0), this.camera.position)
      .normalize();

    this.yaw = Math.atan2(-direction.x, -direction.z);

    this.pitch = Math.asin(direction.y);

    const maxPitch = Math.PI / 2 - 0.01;

    this.pitch = THREE.MathUtils.clamp(this.pitch, -maxPitch, maxPitch);

    this.camera.rotation.order = "YXZ";

    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.domElement) {
      return;
    }

    this.yaw -= event.movementX * this.sensitivity;

    this.pitch -= event.movementY * this.sensitivity;

    const maxPitch = Math.PI / 2 - 0.01;

    this.pitch = THREE.MathUtils.clamp(this.pitch, -maxPitch, maxPitch);

    this.camera.rotation.order = "YXZ";

    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  };

  dispose() {
    this.domElement.removeEventListener("click", this.handleClick);

    document.removeEventListener("mousemove", this.handleMouseMove);
  }
}
