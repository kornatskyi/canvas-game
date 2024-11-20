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
    // to do, when moving diagonally it's moving with double speed (actually sqrt(2))
    if (this._pressedKeys.has("ArrowUp") || this._pressedKeys.has("w")) {
      this.model.player.move(5, 270);
    }
    if (this._pressedKeys.has("ArrowDown") || this._pressedKeys.has("s")) {
      this.model.player.move(5, 90);
    }
    if (this._pressedKeys.has("ArrowLeft") || this._pressedKeys.has("a")) {
      this.model.player.move(5, 180);
    }
    if (this._pressedKeys.has("ArrowRight") || this._pressedKeys.has("d")) {
      this.model.player.move(5, 0);
    }
  }
}
