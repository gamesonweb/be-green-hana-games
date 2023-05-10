import ConfigTable from "../config/table";
import Level from "../level/level";
import Character from "./character";
import GameObject, { GameObjectType } from "./gameObject";
import Monster from "./monster";

export default class GameObjectManager {
    // declare 2 events: onNewObject and onRemoveObject
    public onNewObject: (object: GameObject) => void = () => {};
    public onRemoveObject: (object: GameObject) => void = () => {};

    private readonly _level: Level;
    private readonly _objects: Map<number, GameObject> = new Map();

    private _nextId: number = 0;

    constructor(level: Level) {
        this._level = level;
    }

    public get level(): Level {
        return this._level;
    }
    public get objects(): Map<number, GameObject> {
        return this._objects;
    }

    public addObject(object: GameObject): void {
        if (object.id == -1) {
            object.id = this._nextId++;
        }
        if (this._objects.has(object.id)) {
            throw new Error(`Object with id ${object.id} already exists.`);
        }
        this._objects.set(object.id, object);
        this.onNewObject(object);
    }

    public removeObject(object: GameObject): void {
        if (!this._objects.has(object.id)) {
            throw new Error(`Object with id ${object.id} does not exist.`);
        }
        object.destroy();
        this._objects.delete(object.id);
        this.onRemoveObject(object);
    }

    public getObject(id: number): GameObject {
        return this._objects.get(id);
    }

    public destroy(): void {
        this._objects.forEach((object) => {
            object.destroy();
        });
        this._objects.clear();
        this._nextId = 0;
    }

    public load(data: any): void {
        this.destroy();

        for (let i = 0; i < data.length; i++) {
            const object = data[i];
            const type = object.type;
            const configId = object.config;
            const gameObject = this.createObject(type, configId);
            gameObject.id = object.id;
            gameObject.load(object);
            this.addObject(gameObject);
        }
    }

    public save(): any {
        let objects = [];
        this._objects.forEach((object) => {
            let save = object.save();
            save.type = object.type;
            save.config = object.config.id;
            save.id = object.id;
            objects.push(save);
        });
        return objects;
    }

    public update() {
        this._objects.forEach((object) => {
            object.update();
        });
    }

    private createObject(type: GameObjectType, configId: number): GameObject {
        switch (type) {
            case GameObjectType.Character:
                return new Character(ConfigTable.getCharacter(configId), this._level);
            case GameObjectType.Monster:
                return new Monster(ConfigTable.getMonster(configId), this._level);

            default:
                throw new Error(`Unknown game object type: ${type}`);
        }
    }
}