import { AnimationGroup } from "@babylonjs/core";
import GameObject from "../gameObject";
import Component, { ComponentType } from "./component";
import MovementComponent from "./movement";
import MonsterMovementComponent from "./monsterMovement";

export default class AnimationComponent extends Component {
    private _groups: { [name: string]: AnimationGroup } = {};
    private _currentGroup: AnimationGroup;

    constructor(parent: GameObject) {
        super(parent);

        const movementComponent = this.parent.findComponent(MovementComponent) ?? this.parent.findComponent(MonsterMovementComponent);
        if (movementComponent) {
            movementComponent.onMove = (rate) => {
                if (rate < 0.1) {
                    this.play("idle");
                } else {
                    this.play("run", rate);
                }
            };
        }
    }

    public play(name, speed = 1, stopCurrent: boolean = true): void {
        const group = this._groups[name];
        if (!group) {
          console.warn(`Animation group ${name} not found`);
          return null;
        }

        if (group === this._currentGroup) {
            group.speedRatio = speed;
            return;
        }
    
        group.play(true);
    
        if (stopCurrent) {
            if (this._currentGroup) {
                this._currentGroup.stop();
            }
        }

        this._currentGroup = group;
      }

    public get type(): ComponentType {
        return ComponentType.Animation;
    }
    
    public update(): void {
        
    }

    public setGroups(groups: AnimationGroup[]): void {
        groups.forEach((group) => {
            this._groups[group.name] = group;
        });
    }
}