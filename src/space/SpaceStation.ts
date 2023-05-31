import {
  AbstractMesh,
  Mesh,
  PhysicsImpostor,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { FirstPersonPlayer } from "./Player";
import * as TWEEN from "tween.js";
import { HorizontalRectangleDoor } from './HorizontalRectangleDoor';

export class SpaceStation {
  private _scene: Scene;
  private _collider: AbstractMesh;
  private _spaceStation: AbstractMesh;
  private _player: FirstPersonPlayer;
  private _door0: HorizontalRectangleDoor;
  private _distanceToOpenDoor = 10;

  constructor(scene, position) {
    this._scene = scene;
  }

  public async init() {
    await this._setupCollider();
    await this._setupSpaceStation();
    await this._setupPlayer();
    await this._setupDoor();

    this._scene.registerBeforeRender(() => {
      this._update();
    });
  }

  private async _setupCollider() {
    var spaceStationColliderResult = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "collider.glb",
      this._scene
    );
    this._collider = spaceStationColliderResult.meshes[0];
    this._collider.position = new Vector3(0, 0, 0);
    spaceStationColliderResult.meshes.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0 },
        this._scene
      );
      mesh.checkCollisions = true;
    });
  }

  private async _setupSpaceStation() {
    var spaceStation = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "spaceship.glb",
      this._scene
    );

    this._spaceStation = spaceStation.meshes[0];
  }

  private async _setupPlayer() {
    this._player = new FirstPersonPlayer(this._scene, new Vector3(65, 5, 51));
  }

  private async _setupDoor() {
    this._door0 = new HorizontalRectangleDoor(
      this._getNodeById("HorizontalRectangleDoor", this._spaceStation),
      0.5
    );
  }

  private _getNodeById(id: string, parent: TransformNode): TransformNode {
    if (parent.id === id) {
      return parent;
    }
    for (let i = 0; i < parent.getChildren().length; i++) {
      let node = parent.getChildren()[i];
      if (node.id === id) {
        return node as TransformNode;
      }
      if (node.getChildren().length > 0) {
        let result = this._getNodeById(id, node as TransformNode);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  private _update() {
    TWEEN.update();
    this._updateDoor();
  }

  private _updateDoor() {
    let distance = Vector3.Distance(
      this._player.position,
      this._door0.getDoorPosition()
    );
    console.log(distance);
    console.log(this._player.position);
    console.log(this._door0.getDoorPosition());
    if (distance < this._distanceToOpenDoor) {
      console.log("open door");
      this._door0.open();
    } else {
      console.log("close door");
      this._door0.close();
    }
  }
}