import GameObject, { GameObjectType } from "./gameObject";
import Level from "../level/level";
import Config from "../config/config";

export default class Trigger extends GameObject {
    private _triggered: boolean;
    private _area: {
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number
    }

    public onTrigger: () => void;

    public constructor(config: Config, level: Level) {
        super(config, level);
    }

    public get type(): GameObjectType {
        return GameObjectType.Trigger;
    }
    
    public update(): void {
        super.update();
        if (this._triggered) {
            return;
        }
        
        const objects = this.gameObjectManager.objects.values();
        for (const object of objects) {
            if (object.type == GameObjectType.Character) {
                const position = object.position;
                if (position.x >= this._area.xMin && position.x <= this._area.xMax && position.y >= this._area.yMin && position.y <= this._area.yMax) {
                    this._triggered = true;
                    if (this.onTrigger !== undefined) {
                        this.onTrigger();
                    }
                    break;
                }
            }
        }
    }

    public load(data: any): void {
        super.load(data);
        this._triggered = data.triggered || false;
        this._area = {
            xMin: data.area[0],
            yMin: data.area[1],
            xMax: data.area[2],
            yMax: data.area[3]
        };
    }

    public save(): any {
        let data = super.save();
        data.triggered = this._triggered;
        data.area = [this._area.xMin, this._area.yMin, this._area.xMax, this._area.yMax];
        return data;
    }
}