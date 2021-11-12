const CLEAR = "Cc";
const DECIMAL = ".";
const ENTER = "Enter";
const ESCAPE = "Escape";
const BACKSPACE = "Backspace";
const NEGATIVE = "-";
const NUMBERS = "0123456789";
const OPERATORS = ["+", "-", "*", "/", "sqr", "lcd", "avg"];

const CONTENT = document.querySelector("body > section");
const IOSTREAM = document.querySelectorAll("main h1");
const LISTS = document.querySelectorAll("section section ul");
const TIME = document.querySelector("section header h2 div");
const STATUS = document.querySelector("section footer h4");

const I = IOSTREAM[1];
const O = IOSTREAM[0];
const CORRECT = LISTS[0];
const INCORRECT = LISTS[1];

const AFFIRMATIONS = [
	["You're on a roll!", "correct answers!"],
	["Keep it going!", "correct answers!"],
	["Unreal!", "correct answers! You're doing great!"],
	["You've got", "correct answers and counting!"],
	["So far, sooo good!", "more correct answers to your name!"],
	["You won't believe this...", "correct answers so far!"],
	["Phenomenal!", "correct answers!!"],
];

const game = {
	min: null, // Min operand
	max: 0, // Max operand
	ops: [], // Allowable operators
	neg: false, // Allow negative numbers
	float: false, // Allow decimal numbers
	playing: false, // Loop handle
	score: {
		aem: 0, // Average expressions per minute
		correct: 0, // Number correct
		incorrect: 0, // Number incorrect
	},
	problem: {
		result: 0, // Result of expression
		generate: function () {
			if (game.max < 1) game.init();
			let x = Math.floor(Math.random() * (game.max - game.min + 1) + game.min);
			let y = Math.floor(Math.random() * (game.max - game.min + 1) + game.min);
			let z = game.ops[Math.floor(Math.random() * game.ops.length)];
			if (z === "+") this.result = x + y;
			else if (z === "-") {
				if (!game.neg && x < y) [x, y] = [y, x];
				this.result = x - y;
			} else if (z === "*") this.result = x * y;
			else if (z === "/") this.result = x / y;
			else throw "Unknown operator encountered: " + z;
			O.innerText = `${x} ${z} ${y}`;
		},
		test: function () {
			let res = I.innerText;
			I.innerText = "";
			if (res.charAt(res.length - 1) === DECIMAL) res += "0";
			if (res.indexOf(DECIMAL) >= 0) res = Number.parseFloat(res);
			else res = Number.parseInt(res);
			if (res === this.result) game.oncorrect(O.innerText);
			else game.onwrong(O.innerText);
		},
	},
	stopwatch: {
		tick: 0, // Time Keeper
		limit: 0, // Time limit
		active: false, // Closeout
		handle: null, // Timer handle
		start: function (limit) {
			this.tick = 0;
			this.active = true;
			this.limit = limit ? limit : 0;
			this.handle = setTimeout(() => {
				this.callback();
			}, 1000);
		},
		stop: function () {
			this.active = false;
			clearTimeout(this.handle);
		},
		callback: function () {
			this.tick++;
			let minutes = this.tick >= 60 ? Math.floor(this.tick / 60) : 0;
			let seconds = minutes > 0 ? this.tick - minutes * 60 : this.tick;
			if (minutes < 1) minutes = "00";
			else if (minutes < 10) minutes = "0" + minutes;
			else minutes = "" + minutes;
			if (seconds < 1) seconds = "00";
			else if (seconds < 10) seconds = "0" + seconds;
			else seconds = "" + seconds;
			TIME.innerText = `${minutes}:${seconds}`;
			if (this.limit && this.tick === this.limit) game.finish();
			if (!this.active) return;
			this.handle = setTimeout(() => {
				this.callback();
			}, 1000);
		},
	},
	finish: function () {
		this.stopwatch.stop();
		this.playing = false;
	},
	init: function (vars) {
		if (!vars || typeof vars !== "object") {
			vars = {
				min: 0,
				max: 10,
				ops: ["+", "-"],
				neg: false,
				float: false,
				limit: 0,
			};
		}

		this.min = "min" in vars ? vars.min : 0;
		this.max = "max" in vars ? vars.max : 10;
		this.ops = "ops" in vars ? vars.ops : ["+", "-"];
		this.neg = "neg" in vars ? vars.neg : false;
		this.float = "float" in vars ? vars.float : false;
		this.stopwatch.limit = "limit" in vars ? vars.limit : 0;

		I.innerText = "";
		O.innerText = "";

		document.onkeydown = (e) => {
			this.keypress(e.key);
		};
	},
	keypress: function (key) {
		if (CLEAR.indexOf(key) >= 0) I.innerText = "";
		else if (NUMBERS.indexOf(key) >= 0) I.innerText += key;
		else if (key === ESCAPE) this.finish();
		else if (key === DECIMAL)
			if (this.float && I.innerText.indexOf(DECIMAL) < 0)
				I.innerText += DECIMAL;
			else console.error("Decimal number not allowed");
		else if (key === NEGATIVE)
			if (this.neg && I.innerText.indexOf(NEGATIVE) < 0)
				I.innerText = NEGATIVE += I.innerText;
			else console.error("Negative number not allowed");
		else if (key === BACKSPACE)
			I.innerText = I.innerText.substr(0, I.innerText.length - 1);
		else if (key === ENTER) this.problem.test();
	},
	oncorrect: function (exp) {
		this.score.correct++;
		let li = document.createElement("li");
		li.innerText = exp;
		CORRECT.prepend(li);
		if (this.playing) this.problem.generate();
	},
	onwrong: function (exp) {
		this.score.incorrect++;
		let li = document.createElement("li");
		li.innerText = exp;
		INCORRECT.prepend(li);
		if (this.playing) this.problem.generate();
	},
	start: function () {
		this.playing = true;
		this.problem.generate();
		this.stopwatch.start();
	},
};

game.init();
game.start();
