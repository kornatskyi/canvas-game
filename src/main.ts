import "./style.css";

class Position {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

interface EntityParams {
  position?: Position;
}

class Entity {
  private _position: Position;
  constructor() {
    this._position = new Position(0, 0);
  }

  public get position(): Position {
    return this._position;
  }
  public set position(value: Position) {
    this._position = value;
  }

  move(amount: number, direction: number) {
    // Convert degrees to radians
    const radians = (direction * Math.PI) / 180;

    // Calculate the new x and y using trigonometry
    this._position.x += amount * Math.cos(radians); // Move along the x-axis
    this._position.y += amount * Math.sin(radians); // Move along the y-axis
  }

  static create({ position }: EntityParams) {
    const e = new Entity();
    if (position) {
      e.position = position;
    }
    return e;
  }
}

class Model {
  player: Entity;
  constructor() {
    this.player = Entity.create({ position: new Position(100, 100) });
  }
}

class View {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  model: Model;
  constructor(model: Model) {
    this.model = model;
    // get first canvas
    const c = document.getElementsByTagName("canvas").item(0);
    if (!c) {
      throw "Can't find canvas element on the page";
    }
    this.canvas = c;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw "Couldn't get canvas' context!";
    }
    this.ctx = ctx;
    this.render = this.render.bind(this); // Bind the render method
  }
  render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw
    this.ctx.fillStyle = "rgb(200, 200, 256)";
    this.ctx.fillRect(
      this.model.player.position.x,
      this.model.player.position.y,
      50,
      100
    );

    // Request the next frame
    requestAnimationFrame(this.render);
  }
}

class Controller {
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
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const gameSateDiv = document.getElementById("game-state")!;

const init = async () => {
  const model = new Model();
  const view = new View(model);
  const controller = new Controller(model, view);
  view.render();

  let gameState: "RUNNING" | "STOPPED" = "RUNNING";
  gameSateDiv.textContent = gameState;
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      gameState = gameState === "RUNNING" ? "STOPPED" : "RUNNING";
      gameSateDiv.textContent = gameState;
    }
  });

  const startModel = async () => {
    while (true) {
      if (gameState === "RUNNING") {
        controller.applyControls();
      }
      await delay(1000 / 60);
    }
  };
  startModel();
};

init();
