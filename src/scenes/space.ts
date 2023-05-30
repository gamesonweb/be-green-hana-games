import {
  AbstractMesh,
  AmmoJSPlugin,
  Color3,
  CubeTexture,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  StandardMaterial,
  Texture,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import Scene from "./scene";
import { PlanetManager } from "../space/PlanetManager";
import { Spaceship } from "../space/Spaceship";
import WorldScene from "./world";
import { Dialogue } from "../space/ui/Dialogue";
import ConfigTable from "../logic/config/table";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { FirstPersonPlayer } from "./Player";

export default class SpaceScene extends Scene {
  private _camera: FreeCamera;
  private _sun: HemisphericLight;
  private _planets: PlanetManager;
  private _dialogue: Dialogue;

  constructor(engine: Engine) {
    super(engine);
    this.onDispose = () => {};
  }

  public async init(): Promise<void> {
    await super.init();

    //@ts-ignore
    await Ammo();
    // @ts-ignore
    let plugin = new AmmoJSPlugin(undefined, Ammo);
    this.enablePhysics(new Vector3(0, -9.81, 0), plugin);

    this._createCamera();
    this._createLight();
    //load collider.glb, add mesh collider to scene
    var spaceStationCollider = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "collider.glb",
      this
    );
    spaceStationCollider.meshes[0].position = new Vector3(0, 0, 0);
    // get the second mesh in collider
    spaceStationCollider.meshes.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0 },
        this
      );
      mesh.checkCollisions = true;
    });

    var spaceStation = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "spaceship.glb",
      this
    );

    // var colliders = spaceStation.getChildren()[0];
    // console.log(colliders);
    // var tmp = spaceStation.getChildren()[1];
    // console.log(tmp);
    //get the first mesh of tmp (the collider)
    // var door = tmp.getChildren()[tmp.getChildren().length - 1];
    // console.log(door);
    //foreach mesh in collider, add physicsImpostor
    // colliders.getChildMeshes().forEach((mesh) => {
    //   console.log(mesh);
    //   mesh.physicsImpostor = new PhysicsImpostor(
    //     mesh,
    //     PhysicsImpostor.MeshImpostor,
    //     { mass: 0, restitution: 0 },
    //     this
    //   );
    //   mesh.checkCollisions = true;
    // });

    //spawn a sphere with physics ar 85 10 280
    var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this);
    sphere.position = new Vector3(65, 5, 51);
    sphere.physicsImpostor = new PhysicsImpostor(
      sphere,
      PhysicsImpostor.SphereImpostor,
      { mass: 1, restitution: 0 },
      this
    );
    sphere.checkCollisions = true;

    // put the camera on top of the sphere and target it
    this._camera.position = new Vector3(65, 5, 51);
    this._camera.setTarget(spaceStationCollider.meshes[0].position);

    // this._createSkybox();
    // this._createPlanets();
    // await this._createSpaceship();
    // this._createDialogue();

    //Create a player that can move zsqd and rotate with mouse, and attach it to the camera. Also add a collider to it
    const player = new FirstPersonPlayer(
      this,
      null,
      new Vector3(65, 5, 51)
    );

    this.debugLayer.show();

    // setTimeout(() => {
    //   this._switchToWorldScene();
    // }, 2500);
  }

  private _createCamera(): void {
    this._camera = new FreeCamera("camera", new Vector3(0, 0, -10), this);
    //attach input
    this._camera.attachControl();
    this._camera.maxZ = 100000;
  }

  private _createLight(): void {
    this._sun = new HemisphericLight("light1", new Vector3(1, 1, 0), this);
  }

  private _createSkybox() {
    let skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, this);
    let skyboxMaterial = new StandardMaterial("skyBox", this);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "assets/space/img/skybox/skybox",
      this
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
  }

  private _createPlanets() {
    this._planets = new PlanetManager(this);
    this._planets.createMeshes();
  }

  private async _createSpaceship() {
    // let ship = new Spaceship(
    //   "assets/space/obj/",
    //   "cockpit.glb",
    //   this,
    //   this._camera
    // );
    // await ship.spawnAsync(this._planets);
    // ship.subCollision((ship) => this.onSpaceShipCollision(ship));
  }

  private _createDialogue() {
    this._dialogue = new Dialogue();
    this._dialogue.addText(
      "Bienvenue dans Nakama ! Nous sommes heureux de vous accueillir dans ce jeu spatial épique (1/4)",
      10000
    );
    this._dialogue.addText(
      "Avant de commencer, voici les commandes de votre vaisseau spatial : Z pour monter, S pour descendre, Q pour tourner à gauche et D pour tourner à droite (2/4)",
      10000
    );
    this._dialogue.addText(
      "Espace pour accélérer, et Shift pour ralentir. Assurez-vous de les maîtriser avant de partir à l'aventure. (3/4)",
      10000
    );
    this._dialogue.addText(
      "Votre mission est de naviguer dans l'espace et de trouver la planète la plus proche. Utilisez la touche E pour orienter votre vaisseau vers elle. Une fois que vous l'avez trouvée, atterrissez sur sa surface pour explorer ses merveilles. (4/4)",
      10000
    );
  }

  public update() {
    // this._planets.update(this.getEngine().getDeltaTime());
    // this._dialogue.update(this.getEngine().getDeltaTime());
    super.update();
  }

  private onSpaceShipCollision(planet) {
    if (this.isDisposed) {
      return;
    }
    this._switchToWorldScene();
  }

  private _switchToWorldScene() {
    // switch to the world scene
    const engine = this.getEngine();
    new WorldScene(engine, ConfigTable.getScene(1)).init().then(() => {
      this.dispose();
    });
  }
}
