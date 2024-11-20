import { Config } from "./config";
import { Controller } from "./Controller";
import { Model, Monster } from "./Model";
import "./style.css";

export class View {
  canvas = document.getElementsByTagName("canvas").item(0)!;
  ctx: CanvasRenderingContext2D;
  model: Model;

  // for calculating fps
  fps = 0;
  frameCount = 0;
  lastFpsUpdateTime = 0;

  constructor(model: Model) {
    this.model = model;
    const ctx = this.canvas.getContext("2d")!;

    this.ctx = ctx;
    this.render = this.render.bind(this); // Bind the render method
  }

  renderEntities() {
    // Draw
    for (const e of this.model.entities) {
      // Generate a random color for each entity

      this.ctx.fillStyle = e.color;

      // Draw the entity with the random color
      this.ctx.fillRect(
        e.position.x,
        e.position.y,
        e.dimensions.width,
        e.dimensions.height
      );

      // Set text style and render the ID
      this.ctx.fillStyle = "black"; // Text color
      this.ctx.font = "16px Arial"; // Text font and size
      this.ctx.textAlign = "center"; // Center align text horizontally
      this.ctx.textBaseline = "middle"; // Center align text vertically

      // Draw the ID text in the middle of the entity
      this.ctx.fillText(
        e.id,
        e.position.x + e.dimensions.width / 2,
        e.position.y + e.dimensions.height / 2
      );

      if (e instanceof Monster) {
        this.ctx.fillStyle = Config.healthBarColor;
        this.ctx.fillRect(
          e.position.x,
          e.position.y - 5,
          Config.healthUnitWidth * e.health,
          Config.healthUnitHeight
        );
      }
    }
  }

  render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render entities
    this.renderEntities();

    // FPS calculation
    const now = Date.now();

    // Update FPS every second
    this.frameCount++;
    if (now - this.lastFpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;
    }

    // Log frame time

    // Request the next frame
    requestAnimationFrame(this.render);
  }
}

enum GameState {
  RUNNING,
  STOPPED,
}
interface UIUpdateParams {
  gameState?: GameState;
  fps?: number;
  tps?: number;
  numbOfEntities?: number;
}
class UI {
  gameStateElement = document.getElementById("game-state")!;
  fpsElement = document.getElementById("fps")!;
  tpsElement = document.getElementById("tps")!;
  numbOfEntitiesElement = document.getElementById("number-of-entities")!;

  update({ gameState, fps, numbOfEntities, tps }: UIUpdateParams) {
    this.gameStateElement.textContent =
      gameState === undefined ? "Unknown" : GameState[gameState];
    this.fpsElement.textContent = fps?.toString() ?? "";
    this.tpsElement.textContent = tps?.toString() ?? "";
    this.numbOfEntitiesElement.textContent = numbOfEntities?.toString() ?? "";
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const init = async () => {
  const model = new Model();
  const view = new View(model);
  const controller = new Controller(model, view);
  const ui = new UI();
  view.render();

  let gameState = GameState.RUNNING;
  ui.gameStateElement.textContent = GameState[gameState];
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      gameState =
        gameState === GameState.RUNNING ? GameState.STOPPED : GameState.RUNNING;
      ui.gameStateElement.textContent = GameState[gameState];
    }
  });

  const startModel = async () => {
    while (true) {
      let startTime = Date.now();
      if (gameState === GameState.RUNNING) {
        model.update();
        controller.applyControls();
      }
      ui.update({
        fps: view.fps,
        tps: Date.now() - startTime,
        gameState: gameState,
        numbOfEntities: model.entities.length,
      });

      await delay(1000 / 60);
    }
  };
  startModel();
};

init();
