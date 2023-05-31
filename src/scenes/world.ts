import {
    AbstractMesh,
    BloomEffect, Camera,
    DefaultRenderingPipeline,
    DirectionalLight,
    FlyCamera,
    FreeCamera,
    HardwareScalingOptimization,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PBRMaterial,
    Ray,
    SceneLoader,
    SceneOptimization,
    SceneOptimizer,
    SceneOptimizerOptions,
    ShadowGenerator,
    Space,
    StandardMaterial,
    UniversalCamera,
    Vector2,
    Vector3
} from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import Character from "../logic/gameobject/character";
import { GameObjectType } from "../logic/gameobject/gameObject";
import Level from "../logic/level/level";
import Time from "../logic/time/time";
import PlayerCamera from "../management/component/playerCamera";
import PlayerInput from "../management/component/playerInput";
import Scene from "./scene";
import SpaceScene from "./space";
import { Dialogue } from "../space/ui/Dialogue";
import SceneConfig from "../logic/config/scene";
import TilemapLoaderComponent from "../management/component/tilemapLoader";
import CinematicComponent from "../management/component/cinematic";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";
import DialogComponent from "../management/component/dialog";
import MeshProvider from "../management/meshprovider";
import {SkyMaterial} from "@babylonjs/materials";
import UIComponent from "../management/component/ui";

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 15;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 25 * 1.5, -20 * 1.5);

    private _config: SceneConfig;

    private _level: Level;
    private _logicTime: number = 0;
    private _initialized: boolean = false;

    private _sun: DirectionalLight;
    private _shadowGenerator: ShadowGenerator;

    constructor(engine: Engine, config: SceneConfig) {
        super(engine);
        this._level = new Level(config.id, new Vector2(Math.floor(config.width / config.precision), Math.floor(config.height / config.precision)), config.precision);
        this._config = config;
        this.onDispose = () => {
            this._level.destroy();
        };
    }

    public get level(): Level {
        return this._level;
    }

    public async init(): Promise<void> {
        await super.init();
        await this.createTerrain();

        const loadData = [];
        for (const object of this._config.objects) {
            console.log('loading object', object.name);

            loadData.push({
                id: object.id,
                position: new Vector3(object.position.x, object.position.y, 0),
                direction: Math.PI / 2 - object.direction,
                type: object.type,
                ...object.params
            });
        }

        this._level.load({
            objects: loadData,
            points: this._config.points,
        });

        this.debugLayer.show();

        const cinematicCamera = this.cameras[0] as FreeCamera;
        const playerCamera = new TargetCamera("PlayerCamera", Vector3.Up(), this, true);
        this.activeCamera = playerCamera;
        
        this._sun = this.lights[0] as DirectionalLight;
        this._sun.autoCalcShadowZBounds = true;

        this._shadowGenerator = new ShadowGenerator(8192, this._sun, null, this.activeCamera);
        this._shadowGenerator.useCloseExponentialShadowMap = true;
        this._shadowGenerator.bias = 0.0001;
        this._shadowGenerator.setDarkness(0.1);

        for (const mesh of this.meshes) {
            if (mesh.receiveShadows) {
                this._shadowGenerator.addShadowCaster(mesh);
                console.log('added shadow caster', mesh.name);
            }
        }

        this.addComponent(new DialogComponent(this, this._level));
        this.addComponent(new UIComponent(this, this._level))

        const character = this._getCharacter();
        if (character !== null) {
            this.addComponent(new PlayerCamera(this, character, this.activeCamera as TargetCamera, WorldScene.CAMERA_OFFSET, WorldScene.CAMERA_SPEED));
            this.addComponent(new CinematicComponent(this, cinematicCamera, this._level));
            this.addComponent(new PlayerInput(this, character));
        } else {
            console.warn("Could not find character");
        }

        const defaultPipeline = new DefaultRenderingPipeline("default", true, this, [this.activeCamera, cinematicCamera]);
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomThreshold = 0.05;
        defaultPipeline.bloomWeight = 0.35;
        defaultPipeline.bloomScale = 1;
        defaultPipeline.bloomKernel = 32;

        defaultPipeline.imageProcessingEnabled = true;
        defaultPipeline.imageProcessing.contrast = 1.10;
        defaultPipeline.imageProcessing.exposure = 1.15;
        defaultPipeline.imageProcessing.toneMappingEnabled = false;
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteWeight = 2.5;
        defaultPipeline.imageProcessing.vignetteStretch = 0.5;

        /*const skyMaterial = new SkyMaterial("skyMaterial", this);
        skyMaterial.backFaceCulling = false;
        skyMaterial.turbidity = 10;

        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this);
        skybox.material = skyMaterial;*/

        this._initialized = true;

        await MeshProvider.instance.executeAsync();

        console.log('scene initialized');
    }

    private async createTerrain() : Promise<void> {
        const assetRootPath = "assets/scenes/" + this._config.name + "/models/";
        const assetLoaderPromises = [];

        for (const model of this._config.models) {
            // convert unity coordinates to babylon coordinates
            const position = new Vector3(model.position.x, model.position.y, model.position.z);
            position.x *= -1;
            position.z *= -1;
            const rotation = new Vector3(model.rotation.x * Math.PI / 180, model.rotation.y * Math.PI / 180, model.rotation.z * Math.PI / 180);
            const scaling = new Vector3(model.scale.x, model.scale.y, model.scale.z);
            scaling.x *= -1; 

            assetLoaderPromises.push(this.loadModelAsync(assetRootPath + model.path, position, rotation, scaling));
        }

        await Promise.all(assetLoaderPromises);

        if (this._config.useBakedTilemap) {
            const tilemapComponent = new TilemapLoaderComponent(this._config, this._level);
            this.addComponent(tilemapComponent);
            await tilemapComponent.loadAsync();
        } else {
            throw new Error("Non baked tilemap is not supported now");
        }
    }

    private async loadModelAsync(path: string, position: Vector3, rotation: Vector3, scaling: Vector3): Promise<void> {
        console.log("Loading model", path);
        
        const model = await SceneLoader.ImportMeshAsync("", path, null, this);
        const root = model.meshes[0];

        root.position = position;
        root.rotation = rotation;
        root.scaling = scaling;

        for (const mesh of root.getChildMeshes()) {
            mesh.receiveShadows = true;
            // set roughness to 0.25
            if (mesh.material instanceof PBRMaterial) {
                mesh.material.roughness = 0.25;
            }
        }

        for (const child of root.getChildren()) {
            child.computeWorldMatrix(true);
            if (child instanceof Mesh) {
                child.freezeWorldMatrix();
            }
        }
    }

    private _getCharacter(): Character {
        const objects = this._level.gameObjectManager.objects;
        for (const object of objects.values()) {
            if (object.type === GameObjectType.Character) {
                return object as Character;
            }
        }
        return null;
    }

    private updateLogic() {
        if (!this._initialized) {
            return;
        }

        const delta = this.getEngine().getDeltaTime() / 1000;
        this._logicTime += delta;
        while (this._logicTime > Time.TICK_DELTA_TIME) {
            this._level.update();
            this._logicTime -= Time.TICK_DELTA_TIME;
        }

        if (this._getCharacter() === null) {
            this._initialized = false;
            this._reloadCurrentScene();
        }
    }

    public update() {
        this.updateLogic();
        super.update();
    }

    private switchToSpace() {
        const engine = this.getEngine();
        const scene = new SpaceScene(engine);
        scene.init().then(() => {
            this.dispose();
        });
    }

    private _reloadCurrentScene() {
        const engine = this.getEngine();
        const scene = new WorldScene(engine, this._config);
        scene.init().then(() => {
            this.dispose();
        });
    }
}