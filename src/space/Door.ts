import { TransformNode, Vector3 } from "@babylonjs/core";
import * as TWEEN from "tween.js";

export default abstract class Door {
  private _transformNode: TransformNode;
  private _maxTravelDistance: number;
  private doors: TransformNode[] = [];
  private initialPositions: Vector3[] = [];
  private isOpening: boolean = false;
  private isClosing: boolean = false;
  private doorsTween: TWEEN.Tween[] = [];
  private trigger: Vector3;

  constructor(transformNode: TransformNode, maxPosition: number) {
    this._maxTravelDistance = maxPosition;
    this._transformNode = transformNode;
    this.doors.push(this._transformNode.getChildren()[0] as TransformNode);
    this.initialPositions.push(this.doors[0].position.clone());
    this.doors.push(this._transformNode.getChildren()[1] as TransformNode);
    this.initialPositions.push(this.doors[1].position.clone());
    this.trigger = this.doors[0].absolutePosition.clone();
  }

  private stopAllTweens() {
    this.doorsTween.forEach((tween) => {
      tween.stop();
    });
    this.doorsTween = [];
  }

  public open(): void {
    if (this.isOpening) {
      return;
    }
    this.stopAllTweens();
    this.isOpening = true;
    this.isClosing = false;

    const door1TargetZ = this.initialPositions[0].z + this._maxTravelDistance;
    const door2TargetZ = this.initialPositions[1].z - this._maxTravelDistance;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ z: door1TargetZ }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out);

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ z: door2TargetZ }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.isOpening = false;
      });

    this.doorsTween.push(door1Tween);
    this.doorsTween.push(door2Tween);

    door1Tween.start();
    door2Tween.start();
  }

  public close(): void {
    if (this.isClosing) {
      return;
    }
    this.stopAllTweens();
    this.isOpening = false;
    this.isClosing = true;

    const door1TargetZ = this.initialPositions[0].z;
    const door2TargetZ = this.initialPositions[1].z;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ z: door1TargetZ }, 500)
      .easing(TWEEN.Easing.Quadratic.In);

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ z: door2TargetZ }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.isClosing = false;
      });

    door1Tween.start();
    door2Tween.start();
  }

  public toggleDoors(): void {
    if (this.isOpening) {
      console.log("close");
      this.close();
    } else {
      console.log("open");
      this.open();
    }
  }

  public getDoorPosition() {
    return this.trigger;
  }
}

export enum DoorAxis {
  X,
  Y,
  Z,
}
