import { Entity } from "./Model";

export class SpatialHashGrid {
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
export function checkAABBCollision(a: Entity, b: Entity): boolean {
  return (
    a.position.x < b.position.x + b.dimensions.width &&
    a.position.x + a.dimensions.width > b.position.x &&
    a.position.y < b.position.y + b.dimensions.height &&
    a.position.y + a.dimensions.height > b.position.y
  );
}
