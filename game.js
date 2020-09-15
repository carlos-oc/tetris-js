import { gameBoard } from "./gameBoard.js";

export var currentGameBoard;

function init() {
	console.log("INIT");
	currentGameBoard = new gameBoard();
}

init();