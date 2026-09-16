import * as THREE from "three";

export class MouseLookController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  private yaw = 0;
  private pitch = 0;

  private sensitivity = 0.002;

  private isFirstClick = true;
  private locked = false;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.domElement.addEventListener("click", this.handleClick);

    document.addEventListener("mousemove", this.handleMouseMove);
  }

  private handleClick = () => {
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

    this.applyRotation();
  }

  private handleMouseMove = (event: MouseEvent) => {
    // 행성 탐험 모드에서는 마우스 시점 변경 금지
    if (this.locked) {
      return;
    }

    // Pointer Lock 상태가 아니면 무시
    if (document.pointerLockElement !== this.domElement) {
      return;
    }

    this.yaw -= event.movementX * this.sensitivity;

    this.pitch -= event.movementY * this.sensitivity;

    const maxPitch = Math.PI / 2 - 0.01;

    this.pitch = THREE.MathUtils.clamp(this.pitch, -maxPitch, maxPitch);

    this.applyRotation();
  };

  private applyRotation() {
    this.camera.rotation.order = "YXZ";

    this.camera.rotation.y = this.yaw;

    this.camera.rotation.x = this.pitch;
  }

  /**
   * 현재 카메라의 rotation을
   * 마우스 컨트롤러의 yaw / pitch에 반영
   */
  syncFromCamera() {
    this.camera.rotation.order = "YXZ";

    this.yaw = this.camera.rotation.y;

    this.pitch = this.camera.rotation.x;
  }

  setLocked(locked: boolean) {
    this.locked = locked;
  }

  dispose() {
    this.domElement.removeEventListener("click", this.handleClick);

    document.removeEventListener("mousemove", this.handleMouseMove);
  }
}
