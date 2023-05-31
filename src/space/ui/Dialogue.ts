import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Dialogue {
  private static instance: Dialogue;
  private _uiTexture: AdvancedDynamicTexture;
  private _texts: string[] = [];
  private _textTime: number[] = [];
  private monsterCountElement: HTMLDivElement;
  private playerInfo: PlayerInfo;
  private dialoguesElement: HTMLDivElement;

  constructor() {
    this.monsterCountElement = document.getElementById(
      "monster-count"
    ) as HTMLDivElement;
    this.playerInfo = {
      healthBar: document.getElementById("health-bar") as HTMLDivElement,
      questTitle: document.getElementById("quest-title") as HTMLDivElement,
      questDescription: document.getElementById(
        "quest-description"
      ) as HTMLDivElement,
      playerImage: document.getElementById("player-image") as HTMLImageElement,
    };
    this.dialoguesElement = document.getElementById(
      "dialogues"
    ) as HTMLDivElement;
  }

  public static getInstance(): Dialogue {
    if (!Dialogue.instance) {
      Dialogue.instance = new Dialogue();
    }
    return Dialogue.instance;
  }

  public addText(text: string, time: number) {
    this._texts.push(text);
    this._textTime.push(time);
  }

  public update(deltaTime: number) {
    if (this._texts.length > 0) {
      this.updateDialogues(this._texts[0]);
      this._textTime[0] -= deltaTime;
      if (this._textTime[0] < 0) {
        this._texts.shift();
        this._textTime.shift();
      }
    } else {
      this.clearDialogues();
    }
  }

  updateMonsterCount(count: number) {
    this.monsterCountElement.innerText = `Monstres à tuer : ${count}`;
  }

  updatePlayerInfo(
    health: number,
    questTitle: string,
    questDescription: string
  ) {
    this.playerInfo.healthBar.style.width = `${health}%`;
    this.playerInfo.questTitle.innerText = questTitle;
    this.playerInfo.questDescription.innerText = questDescription;
  }

  updateHealthBar(health: number) {
    this.playerInfo.healthBar.style.width = `${health}%`;
  }

  updateQuest(questTitle: string, questDescription: string) {
    this.playerInfo.questTitle.innerText = questTitle;
    this.playerInfo.questDescription.innerText = questDescription;
  }

  updateQuestTitle(questTitle: string) {
    this.playerInfo.questTitle.innerText = questTitle;
  }

  updateQuestDescription(questDescription: string) {
    this.playerInfo.questDescription.innerText = questDescription;
  }

  updateDialogues(dialogues: string) {
    this.dialoguesElement.innerText = dialogues;
  }

  updatePlayerImage(playerImage: string) {
    this.playerInfo.playerImage.src = playerImage;
  }

  show() {
    this.monsterCountElement.style.display = "block";
    this.playerInfo.healthBar.style.display = "block";
    this.playerInfo.questTitle.style.display = "block";
    this.playerInfo.questDescription.style.display = "block";
    this.dialoguesElement.style.display = "block";
    this.playerInfo.playerImage.style.display = "block";
  }

  hide() {
    this.monsterCountElement.style.display = "none";
    this.playerInfo.healthBar.style.display = "none";
    this.playerInfo.questTitle.style.display = "none";
    this.playerInfo.questDescription.style.display = "none";
    this.dialoguesElement.style.display = "none";
    this.playerInfo.playerImage.style.display = "none";
  }

  clearDialogues() {
    this.dialoguesElement.innerText = "";
  }

  showOnlyDialogues() {
    this.monsterCountElement.style.display = "none";
    this.playerInfo.healthBar.style.display = "none";
    this.playerInfo.questTitle.style.display = "none";
    this.playerInfo.questDescription.style.display = "none";
    this.dialoguesElement.style.display = "block";
  }

  public clear() {
    this._texts = [];
    this._textTime = [];
  }

  public get isCompleted(): boolean {
    return this._texts.length == 0;
  }
}

interface PlayerInfo {
  healthBar: HTMLDivElement;
  questTitle: HTMLDivElement;
  questDescription: HTMLDivElement;
  playerImage: HTMLImageElement;
}
