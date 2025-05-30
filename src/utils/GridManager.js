export default class GridManager {
  /**
   * Creates a grid manager for positioning game objects
   * @param {Phaser.Scene} scene - The scene this grid belongs to
   * @param {number} rows - Number of rows in the grid
   * @param {number} cols - Number of columns in the grid
   * @param {number} padding - Optional padding around the grid (default: 0)
   */
  constructor(scene, rows, cols, padding = 0) {
    this.scene = scene;
    this.rows = rows;
    this.cols = cols;
    this.padding = padding;

    // Get game dimensions
    this.gameWidth = scene.sys.game.config.width;
    this.gameHeight = scene.sys.game.config.height;

    // Calculate cell dimensions
    this.cellWidth = (this.gameWidth - padding * 2) / cols;
    this.cellHeight = (this.gameHeight - padding * 2) / rows;

    // Create graphics object for grid visualization
    this.gridGraphics = null;
    this.gridLabels = [];
    this.visible = false;
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
    const { offsetX = 0, offsetY = 0, scale = 1, snapToPixel = true } = options;

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
    const { offsetX = 0, offsetY = 0, snapToPixel = true } = options;

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
      height: this.cellHeight,
    };
  }
  /**
   * Shows the grid with visual lines
   * @param {Object} options - Grid visualization options
   * @param {number} options.lineWidth - Width of grid lines (default: 1)
   * @param {number} options.lineColor - Color of grid lines (default: 0xFFFFFF)
   * @param {number} options.lineAlpha - Alpha/opacity of grid lines (default: 0.5)
   * @param {number} options.depth - Z-depth of the grid (default: 1000)
   * @param {boolean} options.showNumbers - Whether to show row and column numbers (default: true)
   * @param {number} options.textColor - Color of the grid numbers (default: 0xFFFFFF)
   * @param {number} options.textSize - Size of number labels in pixels (default: 12)
   * @returns {Phaser.GameObjects.Graphics} - The graphics object
   */
  showGrid(options = {}) {
    const {
      lineWidth = 1,
      lineColor = 0xffffff,
      lineAlpha = 0.5,
      depth = 1000,
      showNumbers = true,
      textColor = 0xffffff,
      textSize = 12,
    } = options;

    // Destroy previous grid if it exists
    this.hideGrid();

    // Create new graphics object
    this.gridGraphics = this.scene.add.graphics();
    // Set the depth to ensure grid appears on top of other game objects
    this.gridGraphics.setDepth(depth);
    this.gridGraphics.lineStyle(lineWidth, lineColor, lineAlpha);

    // Draw vertical lines
    for (let col = 0; col <= this.cols; col++) {
      const x = this.padding + col * this.cellWidth;
      this.gridGraphics.moveTo(x, this.padding);
      this.gridGraphics.lineTo(x, this.gameHeight - this.padding);
    }

    // Draw horizontal lines
    for (let row = 0; row <= this.rows; row++) {
      const y = this.padding + row * this.cellHeight;
      this.gridGraphics.moveTo(this.padding, y);
      this.gridGraphics.lineTo(this.gameWidth - this.padding, y);
    }

    // Stroke the path to make cell lines visible
    this.gridGraphics.strokePath();

    // Draw grid outline with slightly thicker line
    const outlineWidth = lineWidth * 1.5;
    this.gridGraphics.lineStyle(outlineWidth, lineColor, lineAlpha);
    this.gridGraphics.strokeRect(
      this.padding,
      this.padding,
      this.gameWidth - this.padding * 2,
      this.gameHeight - this.padding * 2
    );
    this.visible = true;

    // Add row and column numbers if requested
    if (showNumbers) {
      this.gridLabels = [];

      // Column numbers (along the top)
      for (let col = 0; col < this.cols; col++) {
        const x = this.padding + (col + 0.5) * this.cellWidth;
        const y = Math.max(15, this.padding - 15); // Increased offset from grid

        const colLabel = this.scene.add
          .text(x, y, col.toString(), {
            fontSize: textSize,
            color: this.rgbToHex(textColor),
            align: "center",
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
          })
          .setOrigin(0.5, 1)
          .setDepth(depth);

        this.gridLabels.push(colLabel);
      }

      // Row numbers (along the left side)
      for (let row = 0; row < this.rows; row++) {
        const x = Math.max(15, this.padding - 15); // Increased offset from grid
        const y = this.padding + (row + 0.5) * this.cellHeight;

        const rowLabel = this.scene.add
          .text(x, y, row.toString(), {
            fontSize: textSize,
            color: this.rgbToHex(textColor),
            align: "center",
            backgroundColor: '#000000',
            padding: { x: 2, y: 2 }
          })
          .setOrigin(1, 0.5)
          .setDepth(depth);

        this.gridLabels.push(rowLabel);
      }
    }

    return this.gridGraphics;
  }

  /**
   * Converts a hex color to an RGB string for Phaser text
   * @private
   * @param {number} hex - Hexadecimal color value
   * @returns {string} - RGB color string in format '#RRGGBB'
   */
  rgbToHex(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  /**
   * Hides the grid
   */
  hideGrid() {
    if (this.gridGraphics) {
      this.gridGraphics.destroy();
      this.gridGraphics = null;
    }

    // Remove all number labels
    if (this.gridLabels && this.gridLabels.length > 0) {
      this.gridLabels.forEach((label) => label.destroy());
      this.gridLabels = [];
    }

    this.visible = false;
  }
  /**
   * Toggles grid visibility
   * @param {Object} options - Grid visualization options (see showGrid)
   * @returns {boolean} - New visibility state
   */
  toggleGrid(options = {}) {
    if (this.visible) {
      this.hideGrid();
      return false;
    } else {
      this.showGrid(options);
      return true;
    }
  }

  /**
   * Checks if the grid is currently visible
   * @returns {boolean} - Whether the grid is visible
   */
  isGridVisible() {
    return this.visible;
  }
}
