import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Dialogue {
  private static instance: Dialogue;
  private _uiTexture: AdvancedDynamicTexture;
  private _texts: string[] = [];
  private _textTime: number[] = [];
  private _textBlock: TextBlock;

  constructor() {
    this._uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this._textBlock = new TextBlock();
    this._textBlock.text = "Hello world";
    this._textBlock.color = "white";
    this._textBlock.fontSize = 24;
    this._textBlock.resizeToFit = true;
    this._textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this._textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this._textBlock.width = 1;
    this._textBlock.height = "40%";

    this._textBlock.textWrapping = true;

    this._uiTexture.addControl(this._textBlock);
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
      this._textBlock.text = this._texts[0];
      this._textTime[0] -= deltaTime;
      if (this._textTime[0] < 0) {
        this._texts.shift();
        this._textTime.shift();
      }
    } else {
        this._textBlock.text = "";
    }
  }

  public clear() {
    this._texts = [];
    this._textTime = [];
  }

    public get isCompleted(): boolean {
        return this._texts.length == 0;
    }
}
