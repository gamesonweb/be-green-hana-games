import {
  CannonJSPlugin,
  Color3,
  CubeTexture,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import Scene from "./scene";
import { PlanetManager } from "../space/PlanetManager";
import { Spaceship } from "../space/Spaceship";

export default class SpaceScene extends Scene {
  private _camera: UniversalCamera;
  private _sun: HemisphericLight;
  private _planets: PlanetManager;

  constructor(engine: Engine) {
    super(engine);
    this.onDispose = () => {};
  }

  public async init(): Promise<void> {
    await super.init();

    var physicsPlugin = new CannonJSPlugin();
    this.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

    this._createCamera();
    this._createLight();
    this._createSkybox();
    this._createPlanets();
    await this._createSpaceship();

    // this.debugLayer.show();
  }

  private _createCamera(): void {
    this._camera = new UniversalCamera("camera", new Vector3(0, 0, -10), this);
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
    let ship = new Spaceship(
      "assets/space/obj/",
      "cockpit.glb",
      this,
      this._camera
    );
    await ship.spawnAsync(this._planets);
    ship.subCollision(this.onSpaceShipCollision.bind(this));
  }

  public update() {
    this._planets.update(this.getEngine().getDeltaTime());
    super.update();
  }

  private onSpaceShipCollision() {
    console.log("collision");
  }
}
