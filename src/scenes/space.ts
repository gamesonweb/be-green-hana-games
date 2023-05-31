import {
  AbstractMesh,
  AmmoJSPlugin,
  Camera,
  Color3,
  CubeTexture,
  DefaultRenderingPipeline,
  FreeCamera,
  HemisphericLight,
  KeyboardEventTypes,
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
import { FirstPersonPlayer } from "../space/Player";
import { SpaceStation } from "../space/SpaceStation";
import * as TWEEN from "tween.js";

export default class SpaceScene extends Scene {
  private _sun: HemisphericLight;
  private _planets: PlanetManager;
  private _dialogue: Dialogue;
  private _ship: Spaceship;
  private _station: SpaceStation;

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

    this._createLight();

    // let space = new SpaceStation(this, new Vector3(0, 0, 0));
    // await space.init();

    //bind the enter key to switch to world scene

    this._createSkybox();
    this._createPlanets();
    this._createDialogue();

    await this._createSpaceship();
    await this._createSpaceStation();
    this._addPostProcessing([
      this._ship.getCamera(),
      this._station.getCamera(),
    ]);

    this.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key == "Enter") {
          this._station.exitStation();
          this._ship.enterSpaceship();
        }
        if (kbInfo.event.key == "Escape") {
          this._ship.exitSpaceship();
          this._station.enterStation();
        }
      }
    });

    this.debugLayer.show();

    setTimeout(() => {
      this._switchToWorldScene();
    }, 2500);
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
    this._ship = new Spaceship(
      "assets/space/obj/",
      "Luminaris Starship.glb",
      this
    );
    await this._ship.spawnAsync(this._planets);
    this._ship.subCollision((ship) => this.onSpaceShipCollision(ship));
  }

  private _addPostProcessing(cameras: Camera[]) {
    var defaultPipeline = new DefaultRenderingPipeline(
      "default",
      true,
      this,
      cameras
    );
    defaultPipeline.bloomEnabled = true;
    defaultPipeline.bloomThreshold = 0.05;
    defaultPipeline.bloomWeight = 0.35;
    defaultPipeline.bloomScale = 1;
    defaultPipeline.bloomKernel = 32;

    defaultPipeline.imageProcessingEnabled = true;
    defaultPipeline.imageProcessing.contrast = 1.25;
    defaultPipeline.imageProcessing.exposure = 1.2;
    defaultPipeline.imageProcessing.toneMappingEnabled = false;
    defaultPipeline.imageProcessing.vignetteEnabled = true;
    defaultPipeline.imageProcessing.vignetteWeight = 2.5;
    defaultPipeline.imageProcessing.vignetteStretch = 0.5;
  }

  private async _createSpaceStation() {
    this._station = new SpaceStation(this);
    await this._station.init();
    await this._station.enterStation();
  }

  private _createDialogue() {
    this._dialogue = new Dialogue();
    this._dialogue.showOnlyDialogues();
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
    this._planets.update(this.getEngine().getDeltaTime());
    this._dialogue.update(this.getEngine().getDeltaTime());
    TWEEN.update();
    super.update();
  }

  private onSpaceShipCollision(planet) {
    if (this.isDisposed) {
      return;
    }
    this._switchToWorldScene();
  }

  private _switchToWorldScene() {
    const engine = this.getEngine();
    console.log("switching to world scene using engine", engine);
    new WorldScene(engine, ConfigTable.getScene(1)).init().then(() => {
      this.dispose();
    });
  }
}
