import * as THREE from "three";

export class KeyboardController {
  private camera: THREE.PerspectiveCamera;

  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  private velocity = new THREE.Vector3();

  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();

  private maxSpeed = 30;
  private acceleration = 10;
  private deceleration = 10;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    window.addEventListener("keydown", this.handleKeyDown);

    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case "KeyW":
        this.keys.forward = true;
        break;

      case "KeyS":
        this.keys.backward = true;
        break;

      case "KeyA":
        this.keys.left = true;
        break;

      case "KeyD":
        this.keys.right = true;
        break;

      case "Space":
        this.keys.up = true;
        break;

      case "KeyC":
        this.keys.down = true;
        break;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case "KeyW":
        this.keys.forward = false;
        break;

      case "KeyS":
        this.keys.backward = false;
        break;

      case "KeyA":
        this.keys.left = false;
        break;

      case "KeyD":
        this.keys.right = false;
        break;

      case "Space":
        this.keys.up = false;
        break;

      case "KeyC":
        this.keys.down = false;
        break;
    }
  };

  update(delta: number) {
    this.camera.getWorldDirection(this.forward);

    this.right.crossVectors(this.forward, this.camera.up).normalize();

    const movement = new THREE.Vector3();

    if (this.keys.forward) {
      movement.add(this.forward);
    }

    if (this.keys.backward) {
      movement.sub(this.forward);
    }

    if (this.keys.left) {
      movement.sub(this.right);
    }

    if (this.keys.right) {
      movement.add(this.right);
    }

    if (this.keys.up) {
      movement.y += 1;
    }

    if (this.keys.down) {
      movement.y -= 1;
    }

    if (movement.lengthSq() > 0) {
      movement.normalize();

      this.velocity.add(
        movement.clone().multiplyScalar(this.acceleration * delta),
      );

      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize().multiplyScalar(this.maxSpeed);
      }
    } else {
      const speed = this.velocity.length();

      if (speed > 0) {
        const newSpeed = Math.max(0, speed - this.deceleration * delta);

        this.velocity.normalize().multiplyScalar(newSpeed);
      }
    }

    this.camera.position.add(this.velocity.clone().multiplyScalar(delta));
  }

  decelerate(delta: number) {
    const speed = this.velocity.length();

    if (speed <= 0) {
      return;
    }

    const newSpeed = Math.max(0, speed - this.deceleration * 3 * delta);

    this.velocity.normalize().multiplyScalar(newSpeed);
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);

    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
