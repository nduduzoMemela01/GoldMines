export default class GridManager {
  /**
   * Creates a grid manager for positioning game objects
   * @param {Phaser.Scene} scene - The scene this grid belongs to
   * @param {number} rows - Number of rows in the grid
   * @param {number} cols - Number of columns in the grid
   * @param {number} padding - Optional padding around the grid (default: 20)
   */
  constructor(scene, rows, cols, padding = 20) {
    this.scene = scene;
    this.rows = rows;
    this.cols = cols;
    this.padding = padding;
    
    // Get game dimensions
    this.gameWidth = scene.sys.game.config.width;
    this.gameHeight = scene.sys.game.config.height;
    
    // Calculate cell dimensions
    this.cellWidth = (this.gameWidth - (padding * 2)) / cols;
    this.cellHeight = (this.gameHeight - (padding * 2)) / rows;
  }
  
  /**
   * Places a game object at a specific grid position
   * @param {Phaser.GameObjects.GameObject} gameObject - The game object to position
   * @param {number} row - Row index (0-based)
   * @param {number} col - Column index (0-based)
   * @param {Object} options - Additional options
   * @param {number} options.offsetX - X offset from cell center (default: 0)
   * @param {number} options.offsetY - Y offset from cell center (default: 0)
   * @param {number} options.scale - Scale factor (default: 1)
   * @param {boolean} options.snapToPixel - Whether to round to integer pixels (default: true)
   */
  placeAt(gameObject, row, col, options = {}) {
    const {
      offsetX = 0,
      offsetY = 0,
      scale = 1,
      snapToPixel = true
    } = options;
    
    let x = this.padding + (col + 0.5) * this.cellWidth + offsetX;
    let y = this.padding + (row + 0.5) * this.cellHeight + offsetY;
    
    if (snapToPixel) {
      x = Math.round(x);
      y = Math.round(y);
    }
    
    gameObject.setPosition(x, y);
    
    if (scale !== 1) {
      gameObject.setScale(scale);
    }
    
    return gameObject;
  }
  
  /**
   * Places a game object to span multiple grid cells
   * @param {Phaser.GameObjects.GameObject} gameObject - The game object to position
   * @param {number} startRow - Starting row index
   * @param {number} startCol - Starting column index
   * @param {number} endRow - Ending row index (inclusive)
   * @param {number} endCol - Ending column index (inclusive)
   * @param {Object} options - Additional options (same as placeAt)
   */
  placeInArea(gameObject, startRow, startCol, endRow, endCol, options = {}) {
    const centerCol = startCol + (endCol - startCol) / 2;
    const centerRow = startRow + (endRow - startRow) / 2;
    
    return this.placeAt(gameObject, centerRow, centerCol, options);
  }
  
  /**
   * Gets the world coordinates for a grid position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {Object} options - Additional options (same as placeAt)
   * @returns {Object} - { x, y } coordinates
   */
  getPosition(row, col, options = {}) {
    const {
      offsetX = 0,
      offsetY = 0,
      snapToPixel = true
    } = options;
    
    let x = this.padding + (col + 0.5) * this.cellWidth + offsetX;
    let y = this.padding + (row + 0.5) * this.cellHeight + offsetY;
    
    if (snapToPixel) {
      x = Math.round(x);
      y = Math.round(y);
    }
    
    return { x, y };
  }
  
  /**
   * Get the dimensions of one grid cell
   * @returns {Object} - { width, height }
   */
  getCellSize() {
    return {
      width: this.cellWidth,
      height: this.cellHeight
    };
  }
}
