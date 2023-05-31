import ISceneComponent from "./interface";
import Scene from "../../scenes/scene";
import MissionManager from "../../logic/mission/manager";
import {AnimationGroup, FreeCamera, Quaternion, TransformNode, Vector3} from "@babylonjs/core";
import PlayerCamera from "./playerCamera";

export default class CinematicComponent implements ISceneComponent {
    private readonly _scene: Scene;
    private readonly _missionManager: MissionManager;

    private _currentCinematic: AnimationGroup | null = null;

    private _playerCamera: PlayerCamera;
    private _cinematicCamera: FreeCamera;

    constructor(scene: Scene, cinematicCamera: FreeCamera, missionManager: MissionManager) {
        this._scene = scene;
        this._missionManager = missionManager;
        this._playerCamera = scene.getComponent(PlayerCamera);
        this._cinematicCamera = cinematicCamera;

        const cinematics = [];
        for (const group of scene.animationGroups) {
            console.log(group.name);
            if (group.name.toLowerCase().startsWith('cinematic')) {
                cinematics.push(group);
            }
        }

        // create a html select element
        const select = document.createElement('select');
        select.style.position = 'absolute';
        select.style.top = '0';
        select.style.left = '0';
        select.style.zIndex = '100';
        select.style.color = 'white';
        select.style.backgroundColor = 'black';
        select.style.border = 'none';
        select.style.padding = '5px';
        select.style.fontFamily = 'monospace';

        // create a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'None';
        select.appendChild(defaultOption);

        // create an option for each cinematic
        for (const cinematic of cinematics) {
            const option = document.createElement('option');
            option.value = cinematic.name;
            option.text = cinematic.name;
            select.appendChild(option);
        }

        // add the select to the document
        document.body.appendChild(select);

        // add an event listener to the select
        select.addEventListener('change', () => {
            const value = select.value;
            if (value === '') {
                this._cinematicCamera.setEnabled(false);
                this._playerCamera.camera.setEnabled(true);
                this._scene.activeCamera = this._playerCamera.camera;
            } else {
                this._playCinematic(value);
            }
        });
    }

    update(): void {
        if (this._currentCinematic) {
            this._updatePlayingCinematic();
        }
        if (this._currentCinematic === null) {
            const mission = this._missionManager.currentMission;
            if (mission && !mission.isCompleted) {
                const config = mission.config;
                if (config.cinematic && config.cinematic != "") {
                    this._playCinematic(config.cinematic);
                }
            }
        }
    }

    destroy(): void {
    }

    private _playCinematic(name: string): void {
        console.log('Playing cinematic: ' + name);

        this._playerCamera.camera.setEnabled(false);
        this._cinematicCamera.setEnabled(true);
        this._scene.activeCamera = this._cinematicCamera;

        this._currentCinematic = this._scene.getAnimationGroupByName(name);
        this._currentCinematic.play();
    }

    private _updatePlayingCinematic(): void {
        if (this._currentCinematic) {
            if (!this._currentCinematic.isPlaying) {
                this._currentCinematic = null;
                this._cinematicCamera.setEnabled(false);
                this._playerCamera.camera.setEnabled(true);
                this._scene.activeCamera = this._playerCamera.camera;
                this._missionManager.currentMission?.complete();
            }
        }
    }
}