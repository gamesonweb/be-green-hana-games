import { AbstractMesh, DirectionalLight, FlyCamera, HardwareScalingOptimization, HemisphericLight, Mesh, MeshBuilder, Ray, SceneLoader, SceneOptimization, SceneOptimizer, SceneOptimizerOptions, ShadowGenerator, Space, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
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

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 15;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 25 * 1.5, -20 * 1.5);

    private _config: SceneConfig;

    private _level: Level;
    private _logicTime: number = 0;
    private _initialized: boolean = false;

    private _dialogue: Dialogue;

    private _sun: DirectionalLight;
    private _shadowGenerator: ShadowGenerator;
    private _optimizer: SceneOptimizer;

    constructor(engine: Engine, config: SceneConfig) {
        super(engine);
        this._level = new Level(new Vector2(Math.floor(config.width / config.precision), Math.floor(config.height / config.precision)), config.precision);
        this._config = config;
        this.onDispose = () => {
            this._level.destroy();
        };

        this._sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), this);
        this._shadowGenerator = new ShadowGenerator(1024, this._sun);
        this._shadowGenerator.useExponentialShadowMap = true;

        const options = new SceneOptimizerOptions();
        options.addOptimization(new HardwareScalingOptimization(0, 1));

        this._optimizer = new SceneOptimizer(this, options);
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
            objects: loadData
        });

        this.debugLayer.show();

        const character = this._getCharacter();
        if (character !== null) {
            this.addComponent(new PlayerInput(this, character));
            this.addComponent(new PlayerCamera(this, character, WorldScene.CAMERA_OFFSET, WorldScene.CAMERA_SPEED));
        } else {
            console.warn("Could not find character");
        }

        this._createDialogue();

        this._initialized = true;

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

        root.computeWorldMatrix(true);
        root.freezeWorldMatrix();

        const subMeshes = root.getChildMeshes(false);
        // Merge meshes
        if (subMeshes.length > 1) {
            const newModel = Mesh.MergeMeshes(subMeshes as Mesh[], true, true);
            if (newModel !== null) {
                this._onModelLoaded(newModel);
                return;
            }
        }

        this._onModelLoaded(root);
    }

    private _onModelLoaded(model: AbstractMesh) {
        model.receiveShadows = true;
        for (const mesh of model.getChildMeshes(false)) {
            mesh.receiveShadows = true;
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
            this.switchToSpace();
        }
    }

    public update() {
        this.updateLogic();
        this._dialogue.update(this.getEngine().getDeltaTime());
        super.update();
    }

    private _createDialogue() {
        this._dialogue = new Dialogue();
        this._dialogue.clear();
        this._dialogue.addText
        this._dialogue.addText(
          "Hmm... Cette planète est étrange. Je devrais aller voir ce qu'il se passe.",
          5000
        );
        this._dialogue.addText(
          "Avancer: Z | Reculer: S | Gauche: Q | Droite: D | Attaquer : Cliquer sur l'ennemi",
          30000
        );
    }

    private switchToSpace() {
        const engine = this.getEngine();
        const scene = new SpaceScene(engine);
        scene.init().then(() => {
            this.dispose();
        });
    }
}