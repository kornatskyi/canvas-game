import { View } from "./main";
import { Model } from "./Model";

export class Controller {
  model: Model;
  view: View;
  _pressedKeys: Set<string>;
  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;

    this._pressedKeys = new Set<string>();

    document.addEventListener("keydown", (e) => {
      this._pressedKeys.add(e.key);
    });

    document.addEventListener("keyup", (e) => {
      this._pressedKeys.delete(e.key);
    });
  }
  applyControls() {
    if (this._pressedKeys.has("ArrowUp")) {
      this.model.player.move(10, 270);
    }
    if (this._pressedKeys.has("ArrowDown")) {
      this.model.player.move(10, 90);
    }
    if (this._pressedKeys.has("ArrowLeft")) {
      this.model.player.move(10, 180);
    }
    if (this._pressedKeys.has("ArrowRight")) {
      this.model.player.move(10, 0);
    }
  }
}
