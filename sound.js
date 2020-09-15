export class BGsound {

	constructor(src, loop = false) {
		this.tracks = [
			"./audio/main-theme.mp3",
			"./audio/main-theme-alt.mp3",
		];
		this.currentTrack = 0;
		this.sound = new Audio(this.tracks[this.currentTrack]);
		this.sound.play();

		this.sound.addEventListener("ended", () => {
			this.currentTrack = ( this.currentTrack + 1 ) % this.tracks.length;
			this.sound.src = this.tracks[this.currentTrack];
			this.sound.play();
		});
		/*soundElement = document.createElement("audio");
		if ( src !== "" ) {
			this.soundElement.src = src;
		}
		this.soundElement.setAttribute("preload", "auto");
		this.soundElement.setAttribute("controls", "none");
		this.setLoop(true);
		this.soundElement.style.display =  "none";
		document.body.appendChild(this.soundElement);
		*/
	}

	play() {
		this.sound.play();
	}

	stop() {
		this.sound.pause();
	}
	
	setSrc(src) {
		this.sound.src = src;
	}
}

export class soundFX {
	constructor() {
		this.sound;
	}

	play(soundEffect) {
		let src;

		switch(soundEffect) {
			case 'move':
				src = "./audio/move.mp3";
				break;
			case 'rotate':
				src = "./audio/rotate.mp3";
				break;
			case 'land':
				src = "./audio/land.mp3";
				break;
			case 'line':
				src = "./audio/line.mp3";
				break;
			case 'tetris':
				src = "./audio/tetris.mp3";
				break;
			case 'level':
				src = "./audio/level.mp3";
				break;
			case 'pause':
				src = "./audio/pause.mp3";
				break;
			case 'gameOver':
				src = "./audio/game-over.mp3";
				break;
		}

		if ( src != null ) {
			this.sound = new Audio(src);
			this.sound.play();
			this.sound = null;
		}
	}
}