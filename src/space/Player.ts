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
  Scalar,
  Scene,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

export class FirstPersonPlayer {
  private scene: Scene;
  private playerMesh: Mesh;
  private _camera: UniversalCamera;
  private _startPosition: Vector3;
  private _moveSpeedPerSec = 0.3;
  private _moveRotationPerSec = 0.001;
  private _maxRotation = 20;
  private _moveForward = false;
  private _moveBackward = false;
  private _playerRotation = 0;

  constructor(scene: Scene, startPosition: Vector3) {
    this._startPosition = startPosition;
    this._camera = new UniversalCamera(
      "playerCamera",
      new Vector3(0, 0, 0),
      scene
    );
    //attach the camera inputs only for moving with mouse
    this._camera.attachControl();
    this._camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    this.scene = scene;
    this.setupPlayer();
    this.setupCamera();
    this.setupControls();
    //update
    this.scene.onBeforeRenderObservable.add(() => {
      this._update();
    });
  }

  private setupCamera() {
    // attach camera to player
    this._camera.parent = this.playerMesh;
    this._camera.position = new Vector3(0, 2, 0);
    this._camera.rotationQuaternion = Quaternion.Identity();
    this.scene.activeCamera = this._camera;
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
    this.playerMesh.ellipsoid = new Vector3(0.1, 1, 0.1);
    this.playerMesh.ellipsoidOffset = new Vector3(0, 1, 0);
  }

  private setupControls() {
    this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case "z":
              this._moveForward = true;
              break;
            case "s":
              this._moveBackward = true;
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
    let z = 0;
    if (this._moveForward) {
      z += this._moveSpeedPerSec;
    }
    if (this._moveBackward) {
      z -= this._moveSpeedPerSec;
    }

    // create the vector for move with collision that take z and take into account the direction of the camera
    let dir = this._camera.getDirection(new Vector3(0, 0, 1)).scale(z);
    dir.y = 0;

    this.playerMesh.physicsImpostor.setLinearVelocity(new Vector3(0, -1, 0));
    this.playerMesh.moveWithCollisions(dir);
    this.playerMesh.rotationQuaternion = Quaternion.FromEulerAngles(
      0,
      this._playerRotation,
      0
    );
  }

  public get position(): Vector3 {
    return this.playerMesh.position;
  }
}
