import {
  AbstractMesh,
  ActionManager,
  Camera,
  ExecuteCodeAction,
  FreeCamera,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  PointerEventTypes,
  Quaternion,
  Ray,
  RayHelper,
  Scene,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

export class FirstPersonPlayer {
  private scene: Scene;
  private playerMesh: Mesh;
  private _camera: UniversalCamera;
  private _startPosition: Vector3;
  private _moveSpeedPerSec = 0.01;
  private _moveForward = false;
  private _moveBackward = false;

  constructor(scene: Scene, camera: UniversalCamera, startPosition: Vector3) {
    this._startPosition = startPosition;
    this._camera = camera;
    this.scene = scene;
    this.setupPlayer();
    // this.setupCamera();
    this.setupControls();
    //update
    this.scene.onBeforeRenderObservable.add(() => {
      this._update();
      this.playerMesh.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
      this.playerMesh.physicsImpostor.setLinearVelocity(new Vector3(0, -1, 0));
    });
  }

  private setupCamera() {
    // attach camera to player
    this._camera.parent = this.playerMesh;
    this._camera.position = new Vector3(0, 1, -2);
  }

  private setupPlayer() {
    this.playerMesh = MeshBuilder.CreateCapsule(
      "player",
      { radius: 0.5, height: 2 },
      this.scene
    );
    this.playerMesh.position = this._startPosition;
    this.playerMesh.physicsImpostor = new PhysicsImpostor(
      this.playerMesh,
      PhysicsImpostor.CapsuleImpostor,
      { mass: 1, restitution: 0, friction: 1 },
      this.scene
    );
    this.playerMesh.checkCollisions = true;
    this.playerMesh.ellipsoid = new Vector3(0.5, 1, 0.5);
    this.playerMesh.ellipsoidOffset = new Vector3(0, 1, 0);
    this.playerMesh.physicsImpostor.setLinearVelocity(new Vector3(0, -1, 0));
    // lock rotation on x and z axis
  }

  private setupControls() {
    const keyboardObservable = this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case "z":
              this._moveForward = true;
              break;
            case "s":
              this._moveBackward = true;
              break;
            case "q":
              this.playerMesh.moveWithCollisions(
                new Vector3(
                  -this._moveSpeedPerSec *
                    this.scene.getEngine().getDeltaTime(),
                  0,
                  0
                )
              );
              break;
            case "d":
              this.playerMesh.moveWithCollisions(
                new Vector3(
                  this._moveSpeedPerSec * this.scene.getEngine().getDeltaTime(),
                  0,
                  0
                )
              );

              break;
          }
          break;
      }
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYUP:
          switch (kbInfo.event.key) {
            case "z":
              this._moveForward = false;
              break;
            case "s":
              this._moveBackward = false;
              break;
          }
          break;
      }
    });
  }

  private _update() {
    let moveVector = new Vector3(0, 0, 0);
    if (this._moveForward) {
      moveVector.z += this._moveSpeedPerSec;
    }
    if (this._moveBackward) {
      moveVector.z -= this._moveSpeedPerSec;
    }

    this.playerMesh.moveWithCollisions(moveVector);
  }
}
