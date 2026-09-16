import * as THREE from "three";

import type { PlanetConfig } from "../constants/planets";
import { useSpaceStore } from "../stores/spaceStore";

export class PlanetFocusController {
  private camera: THREE.PerspectiveCamera;

  private nearbyPlanet: THREE.Group | null = null;
  private focusedPlanet: THREE.Group | null = null;

  private enterDistance = 20;

  private focusOffset = new THREE.Vector3();

  /*
   * Focus 전환 애니메이션
   */
  private isTransitioning = false;
  private transitionProgress = 0;
  private transitionDuration = 0.8;

  private transitionStartPosition = new THREE.Vector3();

  private transitionStartQuaternion = new THREE.Quaternion();

  private transitionOrbit: THREE.Object3D | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    window.addEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.code !== "KeyF") {
      return;
    }

    /*
     * 전환 중에는 F 무시
     */
    if (this.isTransitioning) {
      return;
    }

    /*
     * =========================
     * Focus 종료
     * =========================
     */

    if (this.focusedPlanet) {
      this.focusedPlanet = null;

      useSpaceStore.getState().setFocusedPlanet(null);

      return;
    }

    /*
     * =========================
     * Focus 시작
     * =========================
     */

    if (!this.nearbyPlanet) {
      return;
    }

    const planet = this.nearbyPlanet;

    const planetOrbit = planet.parent;

    if (!planetOrbit) {
      return;
    }

    /*
     * Focus 시작 시점의 카메라 상태 저장
     */
    this.transitionStartPosition.copy(this.camera.position);

    this.transitionStartQuaternion.copy(this.camera.quaternion);

    /*
     * 행성의 공전 그룹 저장
     */
    this.transitionOrbit = planetOrbit;

    /*
     * 최종적으로 사용할
     * 카메라의 orbit-local 위치 계산
     */
    this.focusOffset.copy(this.camera.position);

    planetOrbit.worldToLocal(this.focusOffset);

    /*
     * Focus 대상 지정
     */
    this.focusedPlanet = planet;

    /*
     * UI 표시
     */
    useSpaceStore.getState().setFocusedPlanet(this.getPlanetConfig(planet));

    /*
     * 전환 시작
     */
    this.isTransitioning = true;
    this.transitionProgress = 0;
  };

  update(planets: THREE.Group[], delta: number) {
    /*
     * =========================
     * Focus 전환
     * =========================
     */

    if (this.isTransitioning && this.focusedPlanet) {
      this.updateTransition(delta);
      return;
    }

    /*
     * =========================
     * Focus 모드
     * =========================
     */

    if (this.focusedPlanet) {
      this.updateFocus();
      return;
    }

    /*
     * =========================
     * 자유 탐험
     * =========================
     */

    this.updateNearbyPlanet(planets);
  }

  private updateTransition(delta: number) {
    if (!this.focusedPlanet || !this.transitionOrbit) {
      return;
    }

    const planet = this.focusedPlanet;

    const planetOrbit = this.transitionOrbit;

    /*
     * 현재 공전 상태 반영
     */
    planetOrbit.updateMatrixWorld(true);

    /*
     * 목표 카메라 위치
     */
    const targetPosition = this.focusOffset.clone();

    planetOrbit.localToWorld(targetPosition);

    /*
     * 현재 행성 위치
     */
    const planetPosition = planet.getWorldPosition(new THREE.Vector3());

    /*
     * 목표 회전
     */
    const targetQuaternion = new THREE.Quaternion();

    const targetMatrix = new THREE.Matrix4();

    targetMatrix.lookAt(targetPosition, planetPosition, this.camera.up);

    targetQuaternion.setFromRotationMatrix(targetMatrix);

    /*
     * 전환 진행
     */
    this.transitionProgress += delta / this.transitionDuration;

    const progress = THREE.MathUtils.clamp(this.transitionProgress, 0, 1);

    /*
     * 부드러운 ease-out
     *
     * 처음에는 빠르게 움직이고
     * 마지막에 천천히 멈춘다.
     */
    const eased = 1 - Math.pow(1 - progress, 3);

    /*
     * 카메라 위치 이동
     */
    this.camera.position.lerpVectors(
      this.transitionStartPosition,
      targetPosition,
      eased,
    );

    /*
     * 카메라 회전 이동
     */
    this.camera.quaternion.slerpQuaternions(
      this.transitionStartQuaternion,
      targetQuaternion,
      eased,
    );

    /*
     * 전환 완료
     */
    if (progress >= 1) {
      this.isTransitioning = false;

      this.camera.position.copy(targetPosition);

      this.camera.quaternion.copy(targetQuaternion);
    }
  }

  private updateFocus() {
    if (!this.focusedPlanet) {
      return;
    }

    const planet = this.focusedPlanet;

    const planetOrbit = planet.parent;

    if (!planetOrbit) {
      return;
    }

    /*
     * 현재 공전 상태 반영
     */
    planetOrbit.updateMatrixWorld(true);

    /*
     * 공전 그룹을 따라 카메라도 이동
     */
    const cameraPosition = this.focusOffset.clone();

    planetOrbit.localToWorld(cameraPosition);

    this.camera.position.copy(cameraPosition);

    /*
     * 행성 바라보기
     */
    const planetPosition = planet.getWorldPosition(new THREE.Vector3());

    this.camera.lookAt(planetPosition);
  }

  private updateNearbyPlanet(planets: THREE.Group[]) {
    let closestPlanet: THREE.Group | null = null;

    let closestDistance = Infinity;

    for (const planet of planets) {
      const planetPosition = planet.getWorldPosition(new THREE.Vector3());

      const distance = this.camera.position.distanceTo(planetPosition);

      if (distance <= this.enterDistance && distance < closestDistance) {
        closestDistance = distance;
        closestPlanet = planet;
      }
    }

    if (closestPlanet !== this.nearbyPlanet) {
      this.nearbyPlanet = closestPlanet;

      useSpaceStore
        .getState()
        .setNearbyPlanet(
          closestPlanet ? this.getPlanetConfig(closestPlanet) : null,
        );
    }
  }

  private getPlanetConfig(planet: THREE.Group): PlanetConfig {
    return planet.userData.config as PlanetConfig;
  }

  getFocusedPlanet() {
    return this.focusedPlanet;
  }

  isFocused() {
    return this.focusedPlanet !== null;
  }

  isTransitioningMode() {
    return this.isTransitioning;
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}
