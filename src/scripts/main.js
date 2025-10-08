'use strict';

class Game {
  constructor(initialState = null) {
    this.board = initialState || this.generateEmptyBoard();
    this.score = 0;
    this.status = 'playing';
    this.addRandomTile();
    this.addRandomTile();
  }

  generateEmptyBoard() {
    return Array(4)
      .fill()
      .map(() => Array(4).fill(0));
  }

  getState() {
    return this.board;
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];

      this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  moveLeft() {
    let moved = false;

    for (let row = 0; row < 4; row++) {
      const newRow = this.board[row].filter((cell) => cell !== 0);
      const merged = [];
      let col = 0;

      while (col < newRow.length) {
        if (col < newRow.length - 1 && newRow[col] === newRow[col + 1]) {
          const doubled = newRow[col] * 2;

          merged.push(doubled);
          this.score += doubled;
          col += 2;
        } else {
          merged.push(newRow[col]);
          col++;
        }
      }

      while (merged.length < 4) {
        merged.push(0);
      }

      if (merged.toString() !== this.board[row].toString()) {
        this.board[row] = merged;
        moved = true;
      }
    }

    return moved;
  }

  moveRight() {
    this.board.forEach((row) => row.reverse());

    const moved = this.moveLeft();

    this.board.forEach((row) => row.reverse());

    return moved;
  }

  moveUp() {
    this.transpose();

    const moved = this.moveLeft();

    this.transpose();

    return moved;
  }

  moveDown() {
    this.transpose();

    const moved = this.moveRight();

    this.transpose();

    return moved;
  }

  transpose() {
    const newBoard = Array(4)
      .fill()
      .map(() => Array(4).fill(0));

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        newBoard[col][row] = this.board[row][col];
      }
    }
    this.board = newBoard;
  }

  isGameOver() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === 0) {
          return false;
        }

        if (col < 3 && this.board[row][col] === this.board[row][col + 1]) {
          return false;
        }

        if (row < 3 && this.board[row][col] === this.board[row + 1][col]) {
          return false;
        }
      }
    }

    return true;
  }

  start() {
    this.board = this.generateEmptyBoard();
    this.score = 0;
    this.status = 'playing';
    this.addRandomTile();
    this.addRandomTile();
  }

  restart() {
    this.start();
  }

  checkWinCondition() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] === 2048) {
          this.status = 'won';

          return;
        }
      }
    }
  }

  handleMove(direction) {
    if (this.status !== 'playing') {
      return;
    }

    let moved = false;

    switch (direction) {
      case 'left':
        moved = this.moveLeft();
        break;
      case 'right':
        moved = this.moveRight();
        break;
      case 'up':
        moved = this.moveUp();
        break;
      case 'down':
        moved = this.moveDown();
        break;
    }

    if (moved) {
      this.addRandomTile();
    }
    this.checkWinCondition();

    if (this.isGameOver()) {
      this.status = 'lost';
    }
  }
}

const game = new Game();
const gameField = document.querySelector('.game-field');
const gameScore = document.querySelector('.game-score');
const startButton = document.querySelector('.button.start');
const messageStart = document.querySelector('.message-start');
const messageWin = document.querySelector('.message-win');
const messageLose = document.querySelector('.message-lose');

function updateUI() {
  const state = game.getState();

  gameField.querySelectorAll('.field-cell').forEach((cell, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const value = state[row][col];

    cell.textContent = value === 0 ? '' : value;
    cell.className = `field-cell${value ? ` field-cell--${value}` : ''}`;
  });
  gameScore.textContent = game.getScore();
}

function handleGameOver() {
  const stat = game.getStatus();

  if (stat === 'won') {
    messageWin.classList.remove('hidden');
  } else if (stat === 'lost') {
    messageLose.classList.remove('hidden');
  }
}

function startGame() {
  game.start();
  updateUI();
  startButton.textContent = 'Restart';
  messageStart.classList.add('hidden');
  messageWin.classList.add('hidden');
  messageLose.classList.add('hidden');
}

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
  const key = event.key;

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
    e.preventDefault();
    game.handleMove(key.replace('Arrow', '').toLowerCase());
    updateUI();
    handleGameOver();
  }
});

startGame();
