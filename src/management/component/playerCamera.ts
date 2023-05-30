import { Camera, FlyCamera, FreeCamera, Vector3 } from "@babylonjs/core";
import GameObject from "../../logic/gameobject/gameObject";
import WorldScene from "../../scenes/world";
import ISceneComponent from "./interface";

export default class PlayerCamera implements ISceneComponent {
    private _scene: WorldScene;
    private _camera: FreeCamera;
    private _target: GameObject;
    private _offset: Vector3;

    private _speed: number;

    constructor(scene: WorldScene, target: GameObject, camera: FreeCamera, offset: Vector3, speed: number = 10) {
        this._scene = scene;
        this._camera = camera;
        this._camera.mode = Camera.PERSPECTIVE_CAMERA;
        this._camera.parent = null;

        this._target = target;
        this._offset = offset;
        this._speed = speed;
    }

    public update(t: number): void {
        if (this._target) {
            const target3D = new Vector3(this._target.position.x, 0, this._target.position.y);
            const currentPosition = this._camera.position;
            const targetPosition = target3D.add(this._offset);
            const newPosition = Vector3.Lerp(currentPosition, targetPosition, this._speed * t);

            this._camera.position = newPosition;

            // calculate the new x direction
            const direction = target3D.subtract(newPosition);
            direction.normalize();
            const angle = Math.atan2(direction.y, direction.z);
            this._camera.rotation = new Vector3(-angle, 0, 0);
        } else {
            console.warn('No target set for player camera');
        }
    }

    public destroy(): void {
        this._camera = null;
        this._target = null;
    }
}