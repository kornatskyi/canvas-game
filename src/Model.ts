import { Config } from "./config";
import { checkAABBCollision, SpatialHashGrid } from "./SpatialHashGrid";
type EntityParams = {
  id?: string;
  position?: Position;
  dimensions?: Dimensions;
};

export class Position {
  constructor(public x: number, public y: number) {}
}

export class Dimensions {
  constructor(public width: number, public height: number) {}
}

export class Entity {
  private _position: Position;
  private _dimensions: Dimensions;
  id: string;
  color: string;
  isAlive = true;
  constructor(id?: string) {
    this._position = new Position(0, 0);
    this._dimensions = Config.entityDefaultDimensions();
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
    console.log(id);

    const e = new Entity(id);
    if (position) {
      e.position = position;
    }
    return e;
  }
}

export class Monster extends Entity {
  health: number;

  constructor(health: number, id?: string) {
    super(id);
    this.health = health;
  }

  static create({ position, id }: EntityParams) {
    console.log(id);

    const e = new Monster(Config.monsterDefaultHealth, id);
    if (position) {
      e.position = position;
    }
    return e;
  }
}

export class Model {
  private _space: SpatialHashGrid;
  public entities: Entity[];
  public player: Entity;
  constructor() {
    this.player = Entity.create({
      position: new Position(100, 100),
      id: "player",
    });
    this._space = new SpatialHashGrid(Config.numberOfSpacialCells);
    this.entities = [this.player];

    for (let i = 0; i < Config.randomEntitiesToRender; i++) {
      this.entities.push(
        Monster.create({
          position: new Position(Math.random() * 800, Math.random() * 1000),
        })
      );
    }
    console.log(this.entities);
  }

  update() {
    // Clear the grid before each update
    this._space.clear();

    // filter out dead entities
    this.entities = this.entities.filter((e) => e.isAlive);

    // Update entity positions and insert them into the grid
    for (const entity of this.entities) {
      this._space.insert(entity);
    }
    // Detect collisions
    for (const entity of this.entities) {
      const possibleCollisions = this._space.retrieve(entity);
      for (const otherEntity of possibleCollisions) {
        if (checkAABBCollision(entity, otherEntity)) {
          if (entity.id === "player") {
            otherEntity.isAlive = false;
          }
          // Handle collision between entity and otherEntity
        }
      }
    }
  }
}
