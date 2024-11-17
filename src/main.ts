import "./style.css";

type EntityParams = {
  id?: string;
  position?: Position;
  dimensions?: Dimensions;
};

class Position {
  constructor(public x: number, public y: number) {}
}

class Dimensions {
  constructor(public width: number, public height: number) {}
}

class Entity {
  private _position: Position;
  private _dimensions: Dimensions;
  public id: string;
  public color: string;
  constructor(id?: string) {
    this._position = new Position(0, 0);
    this._dimensions = new Dimensions(100, 50);
    this.id = id ?? crypto.randomUUID();
    this.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    })`;
  }

  public get position(): Position {
    return this._position;
  }
  public set position(value: Position) {
    this._position = value;
  }
  public get dimensions(): Dimensions {
    return this._dimensions;
  }
  public set dimensions(value: Dimensions) {
    this._dimensions = value;
  }

  move(amount: number, direction: number) {
    // Convert degrees to radians
    const radians = (direction * Math.PI) / 180;

    // Calculate the new x and y using trigonometry
    this._position.x += amount * Math.cos(radians); // Move along the x-axis
    this._position.y += amount * Math.sin(radians); // Move along the y-axis
  }

  static create({ position, id }: EntityParams) {
    const e = new Entity(id);
    if (position) {
      e.position = position;
    }
    return e;
  }
}

class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, Entity[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  // Generates a unique key for a cell based on coordinates
  private getCellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  // Adds an entity to the grid cells it occupies
  public insert(entity: Entity) {
    const cellIndices = this.getCellIndices(entity);
    for (const index of cellIndices) {
      if (!this.grid.has(index)) {
        this.grid.set(index, []);
      }
      this.grid.get(index)!.push(entity);
    }
  }

  // Removes all entities from the grid
  public clear() {
    this.grid.clear();
  }

  // Retrieves all potential collisions
  public retrieve(entity: Entity): Entity[] {
    const entities: Set<Entity> = new Set();
    const cellIndices = this.getCellIndices(entity);

    for (const index of cellIndices) {
      const cellEntities = this.grid.get(index);
      if (cellEntities) {
        for (const cellEntity of cellEntities) {
          if (cellEntity !== entity) {
            entities.add(cellEntity);
          }
        }
      }
    }
    return Array.from(entities);
  }

  // Calculates which cells an entity occupies
  private getCellIndices(entity: Entity): Set<string> {
    const indices = new Set<string>();
    const minX = Math.floor(entity.position.x / this.cellSize);
    const minY = Math.floor(entity.position.y / this.cellSize);
    const maxX = Math.floor(
      (entity.position.x + entity.dimensions.width) / this.cellSize
    );
    const maxY = Math.floor(
      (entity.position.y + entity.dimensions.height) / this.cellSize
    );

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        indices.add(this.getCellKey(x, y));
      }
    }
    return indices;
  }
}

// AABB collision detection
function checkAABBCollision(a: Entity, b: Entity): boolean {
  return (
    a.position.x < b.position.x + b.dimensions.width &&
    a.position.x + a.dimensions.width > b.position.x &&
    a.position.y < b.position.y + b.dimensions.height &&
    a.position.y + a.dimensions.height > b.position.y
  );
}

class Model {
  private _space: SpatialHashGrid;
  public entities: Entity[];
  public player: Entity;
  constructor() {
    this.player = Entity.create({ position: new Position(100, 100) });
    this._space = new SpatialHashGrid(100);
    this.entities = [this.player];
  }

  update() {
    // Clear the grid before each update
    this._space.clear();

    // Update entity positions and insert them into the grid
    for (const entity of this.entities) {
      // entity.move(/* amount */, /* direction */);
      this._space.insert(entity);
    }

    // Detect collisions
    for (const entity of this.entities) {
      const possibleCollisions = this._space.retrieve(entity);
      for (const otherEntity of possibleCollisions) {
        if (checkAABBCollision(entity, otherEntity)) {
          console.log(entity.id + " is colliding with " + otherEntity.id);

          // Handle collision between entity and otherEntity
        }
      }
    }
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

    model.entities.push(
      ...[
        Entity.create({ position: new Position(50, 200) }),
        Entity.create({ position: new Position(200, 300) }),
      ]
    );
  }

  render() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    }

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
        model.update();
        controller.applyControls();
      }
      await delay(1000 / 60);
    }
  };
  startModel();
};

init();
