import { TETROMINO_DATA } from "./tetrominoData.js";
import { currentGameBoard } from "./game.js";
import { gameBoard } from "./gameBoard.js";

const tetrominoTypes = Object.keys(TETROMINO_DATA);

export class Tetromino {
	
	constructor(type=null, rotationIndex=null) {
		
		if ( type !== null && tetrominoTypes.includes(type) ) {
			this.type = type;
		} else {
			this.type = Tetromino.getRandomType();
		}

		this.rotations  = TETROMINO_DATA[this.type]["rotations"];

		this.x = Math.floor( (gameBoard.getGridColumns() - this.rotations[0].length) / 2 );
		this.y = -1;
		if ( rotationIndex === null || rotationIndex < 0 || rotationIndex >= this.rotations.length ) {
			this.currentRotationIndex = Math.floor( Math.random() * this.rotations.length );
		} else {
			this.currentRotationIndex = rotationIndex;
		}
		// this.moveDown();
	}

	static getRandomType() {
		const randomIndex         = Math.floor( Math.random() * tetrominoTypes.length) ;
		return tetrominoTypes[randomIndex];
	}

	moveDown() {
		if ( currentGameBoard.gameOver ) return;
		if ( this.willCollide(0, 1) ) {
			currentGameBoard.lockCurrentTetromino();
			currentGameBoard.gameSoundFX.play("land");
		} else {
			this.y += 1;
		}
		currentGameBoard.render();
	}

	moveRight() {
		if ( this.willCollide(1, 0) ) return;
		this.x += 1;
		currentGameBoard.render();
		currentGameBoard.gameSoundFX.play("move");
	}

	moveLeft() {
		if ( this.willCollide(-1, 0) ) return;
		this.x -= 1;
		currentGameBoard.render();
		currentGameBoard.gameSoundFX.play("move");
	} 

	rotate() {
		
		let newRotationIndex = (this.currentRotationIndex + 1 ) % this.rotations.length;

		if ( this.willCollide(0, 0, newRotationIndex) ) {
			let kick = this.x < gameBoard.getGridColumns() / 2 ? 1 : -1;
			console.log("x: " + this.x);
			console.log("cols: " + gameBoard.getGridColumns() / 2);
			console.log("kick: " + kick);
			if ( this.willCollide(kick, 0, newRotationIndex) ) return;
			this.x += kick;
		}

		this.currentRotationIndex = newRotationIndex;
		currentGameBoard.render();
		currentGameBoard.gameSoundFX.play("rotate");
	}
	drop() {
		if ( currentGameBoard.gameOver ) return;
		let dropPoints = 1;
		while ( !this.willCollide(0, 1) ) {
			this.moveDown();
			dropPoints++;
		}
		currentGameBoard.addScore(dropPoints);
		currentGameBoard.lockCurrentTetromino(); 
		currentGameBoard.gameSoundFX.play("land");
	}

	willCollide(xMovement, yMovement, rotationToCheck = null) {

		const rotation = ( rotationToCheck != null ) ? this.rotations[rotationToCheck] : this.rotations[this.currentRotationIndex];

		for ( let r = 0; r < rotation.length; r++ ) {
			for ( let c = 0; c < rotation[r].length; c++ ) {
				if ( rotation[r][c] === 0 ) continue;
				
				let newX = this.x + c + xMovement;
				let newY = this.y + r + yMovement;

				if ( currentGameBoard.isPositionOutOfBounds(newX, newY) || ( newY > 0 && !currentGameBoard.isPositionEmpty(newX, newY) ) ) {
					return true;
				}
			}
		}

		return false;
	}

	getType() {
		return this.type;
	}

	getCurrentRotation () {
		return this.rotations[this.currentRotationIndex];
	}

	getCurrentRotationIndex() {
		return this.currentRotationIndex;
	}

	getPosition() {
		return { x: this.x, y: this.y }
	}
}