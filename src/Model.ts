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
  public id: string;
  public color: string;
  constructor(id?: string) {
    this._position = new Position(0, 0);
    this._dimensions = new Dimensions(10, 20);
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

export class Model {
  private _space: SpatialHashGrid;
  public entities: Entity[];
  public player: Entity;
  constructor() {
    this.player = Entity.create({ position: new Position(100, 100) });
    this._space = new SpatialHashGrid(20);
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
    let colliding = 0;
    // Detect collisions
    for (const entity of this.entities) {
      const possibleCollisions = this._space.retrieve(entity);
      for (const otherEntity of possibleCollisions) {
        if (checkAABBCollision(entity, otherEntity)) {
          colliding++;
          // Handle collision between entity and otherEntity
        }
      }
    }
  }
}