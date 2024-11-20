import { Dimensions } from "./Model";

export class Config {
  static numberOfSpacialCells = 20;
  static randomEntitiesToRender = 10;

  static entityDefaultDimensions = () => new Dimensions(20, 20)

  static monsterDefaultHealth = 10

  static healthUnitWidth = 3
  static healthUnitHeight = 3

  static healthBarColor = "green"
}
