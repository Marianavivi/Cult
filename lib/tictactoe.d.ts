export class TicTacToe {
  /* X PlayerName */
  playerX: string;
  /* Y PlayerName */
  playerY: string;
  /* X if true, Y if false */
  private _currentTurn: boolean;
  private _board: number[][];
  private _turns: number;

  constructor(playerX: string, playerY: string) {
    this.playerX = playerX;
    this.playerY = playerY;
    this._currentTurn = true; // X starts the game
    this._board = Array.from({ length: 3 }, () => Array(3).fill(0)); // 3x3 board initialized to 0
    this._turns = 0;
  }

  /**
   * Get the current state of the board.
   */
  get board(): number[][] {
    return this._board;
  }

  /**
   * Place a move on the board.
   * @param player - The player making the move (true for X, false for Y).
   * @param x - The x-coordinate of the move.
   * @param y - The y-coordinate of the move.
   * @returns {boolean} - True if the move is successful, otherwise false.
   */
  turn(player: boolean, x: number, y: number): boolean {
    if (this._board[x][y] !== 0) return false; // Cell is already occupied

    this._board[x][y] = player ? 1 : 2; // 1 for X, 2 for O
    this._turns++;
    this._currentTurn = !this._currentTurn; // Toggle the turn
    return true;
  }

  /**
   * Check if the game has been won.
   * @returns {number | null} - Returns 1 if X wins, 2 if O wins, or null if no one has won yet.
   */
  checkWin(): number | null {
    const lines = [
      // Rows
      [this._board[0][0], this._board[0][1], this._board[0][2]],
      [this._board[1][0], this._board[1][1], this._board[1][2]],
      [this._board[2][0], this._board[2][1], this._board[2][2]],
      // Columns
      [this._board[0][0], this._board[1][0], this._board[2][0]],
      [this._board[0][1], this._board[1][1], this._board[2][1]],
      [this._board[0][2], this._board[1][2], this._board[2][2]],
      // Diagonals
      [this._board[0][0], this._board[1][1], this._board[2][2]],
      [this._board[2][0], this._board[1][1], this._board[0][2]]
    ];

    for (const line of lines) {
      if (line[0] === line[1] && line[1] === line[2] && line[0] !== 0) {
        return line[0]; // Return the winner (1 for X, 2 for O)
      }
    }
    return null; // No winner yet
  }

  /**
   * Check if the game is a draw.
   * @returns {boolean} - True if the game is a draw, otherwise false.
   */
  checkDraw(): boolean {
    return this._turns >= 9 && this.checkWin() === null;
  }
}
