import { Tetromino } from "./tetromino.js";
import { BGsound, soundFX } from "./sound.js";
import { LEVEL_SPEEDS } from "./gameLevelSpeeds.js";
const GRID_ROWS    = 18;
const GRID_COLUMNS = 10;

const SCORE_BOX_HEIGHT = 30;

const FULL_ROWS_SCORING = {
	1: 40,
	2: 100,
	3: 300,
	4: 1200,
};

const MAX_LEVEL = 20;

const MAX_TETROMINO_SIZE = 4;

export class gameBoard {

	constructor() {

		// Game Board Elements:
		this.gameBoard = document.getElementById("game-board");

		this.gameScoreBox = document.getElementById("game-score-box");
		this.gameLinesBox = document.getElementById("game-lines-box");
		this.gameLevelBox = document.getElementById("game-level-box");

		this.nextTetrominoBox = document.getElementById("next-tetromino-box");

		// Stats
		this.gameOver = false;

		this.lines = 0;
		this.score = 0;
		this.level = 0;
		
		this.pause = false;

		this.initLockedPieces();

		// Game Board Size
		this.resizeGameBoard();

		window.addEventListener("resize", () => {
			this.resizeGameBoard();
		});

		// Music & Sound Effects
		this.bgMusic     = new BGsound();
		this.gameSoundFX = new soundFX();

		// Init Tetromino
		this.currentTetromino = new Tetromino();
		this.nextTetromino    = new Tetromino();
		
		this.lastTetrominoType = this.currentTetromino.getType();;

		this.lastRenderTime = 0;

		this.initControls();

		this.nextGameFrame();
	}

	static getGridColumns() {
		return GRID_COLUMNS;
	}

	static getGridRows() {
		return GRID_ROWS;
	}

	nextGameFrame() {
		window.requestAnimationFrame((currentTime) => {this.mainLoop(currentTime)});
	}

	mainLoop(currentTime) {

		if ( this.pause ) {
			return;
		}

		if ( this.gameOver ) {
			this.printMessage("GAME OVER<br><small>PRESS R<br>TO RESTART</small>");
			return;
		}
	
		const secondsSinceLastRender = ( currentTime - this.lastRenderTime ) / 1000;

		let gameSpeed = LEVEL_SPEEDS[this.level];

		if ( secondsSinceLastRender > gameSpeed ) {
			this.nextMove();
			this.lastRenderTime = currentTime;
		}
		
		this.nextGameFrame();
	}

	initControls() {
		window.addEventListener("keydown", event => {
			
			switch ( event.key ) {
				case 'P':
				case 'p':
					if ( this.gameOver ) return;
					if ( this.pause ) {
						this.resumeGame();
					} else {
						this.pauseGame();
					}
					break;
				case 'ArrowUp':
					if ( this.pause || this.gameOver ) return;
					this.currentTetromino.rotate();
					this.resetLastRenderTime();
					break;
				case 'ArrowDown':
					if ( this.pause || this.gameOver ) return;
					this.currentTetromino.moveDown();
					break;
				case 'ArrowRight':
					if ( this.pause || this.gameOver ) return;
					this.currentTetromino.moveRight();
					break;
				case 'ArrowLeft':
					if ( this.pause || this.gameOver ) return;
					this.currentTetromino.moveLeft();
					break;
				case ' ':
					if ( this.pause || this.gameOver ) return;
					this.currentTetromino.drop();
					break;
				case 'R':
				case 'r':
					window.location.reload();
					break;
			}
		});
	}

	resetLastRenderTime() {
		this.lastRenderTime = window.performance.now();
	}

	initLockedPieces() {

		this.lockedPieces = [];
	
		for ( let i = 0; i < GRID_ROWS; i++ ) {
			this.lockedPieces[i] = [];
			for ( let j = 0; j < GRID_COLUMNS; j++ ) {
				this.lockedPieces[i][j] = "";
			}
		}
	}

	logLockedPieces() {
		for ( let i = 0; i < this.lockedPieces.length; i++ ) {
			let line = i + ": ";
			for ( let j = 0; j < this.lockedPieces[i].length; j++ ) {
				line += this.lockedPieces[i][j] !== "" ? this.lockedPieces[i][j] : "-";
			}
		}
	}

	resizeGameBoard() {

		let boardWidth;
		
		let aspectRatio = GRID_ROWS / GRID_COLUMNS;
		
		boardWidth = `calc(100vmin / ${aspectRatio})`; 
		// Setup board size
		this.gameBoard.style.width                = boardWidth;
		this.gameBoard.style.gridTemplateRows     = `repeat(${GRID_ROWS}, ${aspectRatio}fr`;
		this.gameBoard.style.gridTemplateColumns  = `repeat(${GRID_COLUMNS}, 1fr`;

		this.nextTetrominoBox.style.width =  `calc(100vmin / ${aspectRatio * 2})`;
		this.nextTetrominoBox.style.height = `calc(100vmin / ${aspectRatio * 2})`;
	}
	
	isPositionOutOfBounds(x, y) {
		if ( x < 0 || x >= GRID_COLUMNS || y >= GRID_ROWS ) {
			return true;
		}
		return false;
	}

	isPositionEmpty(x, y) {
		return this.lockedPieces[y][x] === "";
	}
	
	drawSquarePiece(x, y, cssClass, container="gameBoard") {

		const squarePiece = document.createElement("div");
		
		// CSS grid starts at 1
		x += 1;
		y += 1;
		
		// We skip the pieces outside the grid to avoid strange behaviour
		if ( y < 1 ) return;

		squarePiece.style.gridColumnStart = x;
		squarePiece.style.gridRowStart    = y;
		squarePiece.classList.add("tetromino");
		squarePiece.classList.add(cssClass);
		if ( container === "gameBoard" ) {
			this.gameBoard.appendChild(squarePiece);
		} else if ( container === "nextPiece" ) {
			this.nextTetrominoBox.appendChild(squarePiece);
		}
	}

	drawLockedPieces() {
		this.lockedPieces.forEach( (row, y) => {
			row.forEach( (type, x) => {
				if ( type === "" ) return;
				this.drawSquarePiece(x, y, type);
				// if ( type === "" ) { this.drawSquarePiece(x, y, "-"); } else { this.drawSquarePiece(x, y, type); }

			});
		});
	}

	drawCurrentTetromino() {
		this.nextTetrominoBox.innerHTML = '';
		const tetrominoRotation = this.currentTetromino.getCurrentRotation();
		const tetrominoPosition = this.currentTetromino.getPosition();
		const tetrominoType     = this.currentTetromino.getType();
		
		for ( let r = 0; r < tetrominoRotation.length; r++ ) {
			for ( let c = 0; c < tetrominoRotation[r].length; c++ ) {
				if ( tetrominoRotation[r][c] == 0 ) continue;
				this.drawSquarePiece(tetrominoPosition.x + c, tetrominoPosition.y + r, tetrominoType);
			}
		}
	}

	drawNextTetromino() {
		
		const tetrominoRotation = this.nextTetromino.getCurrentRotation();
		const tetrominoType     = this.nextTetromino.getType();
		
		const xOffset = Math.floor( (MAX_TETROMINO_SIZE - tetrominoRotation[0].length) / 2 );
		const yOffset = Math.floor( (MAX_TETROMINO_SIZE - tetrominoRotation.length   ) / 2 );

		for ( let r = 0; r < tetrominoRotation.length; r++ ) {
			for ( let c = 0; c < tetrominoRotation[r].length; c++ ) {
				if ( tetrominoRotation[r][c] == 0 ) continue;
				this.drawSquarePiece(c + xOffset, r + yOffset, tetrominoType, "nextPiece");
			}
		}

		
	}
	
	render() {
		this.gameBoard.innerHTML = '';
		this.drawLockedPieces();
		this.drawCurrentTetromino();
		this.drawNextTetromino();
	}

	nextMove() {
		this.currentTetromino.moveDown();
		this.render();
	}
	
	lockCurrentTetromino() {
		const tetrominoRotation = this.currentTetromino.getCurrentRotation();
		const tetrominoPosition = this.currentTetromino.getPosition();
		const tetrominoType     = this.currentTetromino.getType();
		
		let isGameOver = false;

		for ( let r = 0; r < tetrominoRotation.length; r++ ) {
			for ( let c = 0; c < tetrominoRotation[r].length; c++ ) {

				if ( tetrominoRotation[r][c] == 0 ) continue;

				if ( tetrominoPosition.y + r < 0 ) {
					isGameOver = true;
					continue;
				}
				this.lockedPieces[tetrominoPosition.y + r][tetrominoPosition.x + c] = tetrominoType;
			}
		}

		if ( isGameOver ) {
			this.setGameOver();
		} else {
			this.getNextTetromino();
			this.clearFullRows();
		}
	}

	clearFullRows() {
		let fullRows = 0;

		for ( let r = 0; r < this.lockedPieces.length; r++ ) {
			
			let isRowFull = true;
			
			if ( this.lockedPieces[r].some( (lockedPiece, index) => {
					if ( lockedPiece === "" ) return true;
					return false;
				})
			) {
				isRowFull = false;
			}
			
			if ( isRowFull ) {
				
				fullRows++;
				for ( let i = r; i > 0; i-- ) {
					for ( let c = 0; c < this.lockedPieces[i].length; c++ ) {
						this.lockedPieces[i][c] = this.lockedPieces[i - 1][c];
					}
				}

				for ( let c = 0; c < this.lockedPieces[0].length; c++ ) {
					this.lockedPieces[0][c] = "";
				}
			}
		}

		if ( fullRows > 0 ) {

			this.updateStats(fullRows);
			
			if ( fullRows === 4 ) {
				this.gameSoundFX.play("tetris");
			} else {
				this.gameSoundFX.play("line");
			}
		}
		this.render();
	}

	getNextTetromino() {
		let nextTetrominoType;
		do {
			nextTetrominoType = Tetromino.getRandomType();
		} while ( nextTetrominoType == this.lastTetrominoType);
		
		this.lastTetrominoType = this.currentTetromino.getType();
		this.currentTetromino = new Tetromino(this.nextTetromino.getType(), this.nextTetromino.getCurrentRotationIndex());
		this.nextTetromino = new Tetromino(nextTetrominoType);
		this.currentTetromino.moveDown();
		this.resetLastRenderTime();
		this.render();
	}

	updateStats(lines) {
		this.lines += lines;
		this.gameLinesBox.innerHTML = this.lines;
		
		let level = Math.floor( this.lines / 10 );

		if ( level <= MAX_LEVEL && level !== this.level ) {
			this.level = level;
			this.gameLevelBox.innerHTML = this.level;
			this.gameSoundFX.play("level");
		}
		this.addScore((this.level + 1) * FULL_ROWS_SCORING[lines]);
		
	}

	addScore(points) {
		this.score += points;
		this.gameScoreBox.innerHTML = this.score;
	}

	pauseGame() {
		this.pause = true;
		this.bgMusic.stop();
		this.gameSoundFX.play("pause");
		this.printMessage("PAUSE", true);
	}

	resumeGame() {
		this.pause = false;
		this.bgMusic.play();
		this.nextGameFrame();
		this.removeMessage();
	}

	setGameOver() {
		this.gameOver = true;
		this.bgMusic.stop();
		this.gameSoundFX.play("gameOver");
	}


	printMessage(content, hiddenBackground = false) {

		if ( hiddenBackground ) {
			for ( let i = 0; i < GRID_ROWS; i++ ) {
				for ( let j = 0; j < GRID_COLUMNS; j++ ) {
					this.drawSquarePiece(j, i, "empty" );
				}
			}
		}

		const messageElement = document.createElement("div");
		
		messageElement.id = "game-msg";

		messageElement.innerHTML = `<div>${content}</div>`;

		this.gameBoard.appendChild(messageElement);
	}

	removeMessage() {
		document.getElementById("game-msg").remove();
		this.render();
	}

}