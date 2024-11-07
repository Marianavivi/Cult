class TicTacToe {
  constructor(playerX = 'x', playerO = 'o') {
    this.playerX = playerX;
    this.playerO = playerO;
    this._currentTurn = false; // False represents X, true represents O
    this._x = 0;
    this._o = 0;
    this.turns = 0;
  }

  /**
   * Get the combined board state
   */
  get board() {
    return this._x | this._o;
  }

  /**
   * Get the name of the player whose turn it is currently
   */
  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX;
  }

  /**
   * Get the name of the player who is waiting for their turn
   */
  get enemyTurn() {
    return this._currentTurn ? this.playerX : this.playerO;
  }

  /**
   * Check if a given state represents a winning state
   * @param {number} state - The state to check
   * @returns {boolean} - True if the state is a winning state
   */
  static check(state) {
    const winningCombos = [7, 56, 73, 84, 146, 273, 292, 448];
    for (let combo of winningCombos) {
      if ((state & combo) === combo) return true;
    }
    return false;
  }

  /**
   * Convert x, y coordinates to binary representation
   * @param {number} x - The x-coordinate
   * @param {number} y - The y-coordinate
   * @returns {number} - The binary representation of the position
   * @throws {Error} - If the position is invalid
   */
  static toBinary(x = 0, y = 0) {
    if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error('invalid position');
    return 1 << (x + 3 * y);
  }

  /**
   * Make a move in the game
   * @param {number} player - 0 for X, 1 for O
   * @param {number} x - The x-coordinate or a single position index
   * @param {number} [y] - The y-coordinate (optional if using single index)
   * @returns {-3|-2|-1|0|1} - The result of the move
   */
  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3; // Game ended
    let pos = 0;
    if (y == null) {
      if (x < 0 || x > 8) return -1; // Invalid position
      pos = 1 << x;
    } else {
      if (x < 0 || x > 2 || y < 0 || y > 2) return -1; // Invalid position
      pos = TicTacToe.toBinary(x, y);
    }
    if (this._currentTurn ^ player) return -2; // Invalid turn
    if (this.board & pos) return 0; // Position occupied
    this[this._currentTurn ? '_o' : '_x'] |= pos;
    this._currentTurn = !this._currentTurn;
    this.turns++;
    return 1; // Success
  }

  /**
   * Render the board state as an array of 'X', 'O', and position numbers
   * @param {number} [boardX=0] - The board state for player X
   * @param {number} [boardO=0] - The board state for player O
   * @returns {Array} - The rendered board
   */
  static render(boardX = 0, boardO = 0) {
    let x = parseInt(boardX.toString(2), 4);
    let y = parseInt(boardO.toString(2), 4) * 2;
    return [...(x + y).toString(4).padStart(9, '0')]
      .reverse()
      .map((value, index) => (value == 1 ? 'X' : value == 2 ? 'O' : ++index));
  }

  /**
   * Render the current board state
   * @returns {Array} - The rendered board
   */
  render() {
    return TicTacToe.render(this._x, this._o);
  }

  /**
   * Get the winner of the game if there is one
   * @returns {string|boolean} - The name of the winner or false if no winner
   */
  get winner() {
    let xWins = TicTacToe.check(this._x);
    let oWins = TicTacToe.check(this._o);
    return xWins ? this.playerX : oWins ? this.playerO : false;
  }
}

export default TicTacToe;
