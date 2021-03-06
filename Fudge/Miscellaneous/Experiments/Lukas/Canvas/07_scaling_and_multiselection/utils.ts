module Utils {

	export function RandomRange(min: number, max: number): number {
		return Math.floor((Math.random() * (max - min)) + min);
	}

	export function RandomColor(includeAlpha: boolean = false): string {
		let c: string = "rgba(";
		c += RandomRange(0, 255) + ",";
		c += RandomRange(0, 255) + ",";
		c += RandomRange(0, 255) + ",";
		c += includeAlpha ? RandomRange(0, 255) + ")" : "1)";

		return c;
	}

	export class Vector2 {
		public x: number;
		public y: number;

		constructor(x: number = 0, y: number = 0) {
			this.x = x;
			this.y = y;
		}

		equals(obj: Vector2): boolean {
			if (this.x != obj.x) return false;
			if (this.y != obj.y) return false;
			return true;
		}

		magnitude(): number {
			return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		}

		sqrMagnitude(): number {
			return Math.pow(this.x, 2) + Math.pow(this.y, 2);
		}

		static dot(a: Vector2, b: Vector2) {
			return a.x * b.x + a.y * b.y;
		}

		normalize(): Vector2 {
			return new Vector2(this.x / this.magnitude(), this.y / this.magnitude());
		}

		perpendicularVector(): Vector2 {
			let v: Vector2 = this.normalize();
			return new Vector2(v.y, -v.x);
		}

		static add(...params: Vector2[]): Vector2 {
			let result: Vector2 = new Vector2();
			for (let v of params){
				result = new Vector2(result.x + v.x, result.y + v.y);
			}
			return result;
		}

		scaled(s: number){
			return new Vector2(this.x * s, this.y * s);
		}
	}

	export enum MOUSEBUTTON {
		LEFT = 0,
		MIDDLE = 1,
		RIGHT = 2
	}

	export enum KEYCODE {
		CANCEL = 3,
		HELP = 6,
		BACK_SPACE = 8,
		TAB = 9,
		CLEAR = 12,
		RETURN = 13,
		ENTER = 14,
		SHIFT = 16,
		CONTROL = 17,
		ALT = 18,
		PAUSE = 19,
		CAPS_LOCK = 20,
		ESCAPE = 27,
		SPACE = 32,
		PAGE_UP = 33,
		PAGE_DOWN = 34,
		END = 35,
		HOME = 36,
		LEFT = 37,
		UP = 38,
		RIGHT = 39,
		DOWN = 40,
		PRINTSCREEN = 44,
		INSERT = 45,
		DELETE = 46,
		NUM0 = 48,
		NUM1 = 49,
		NUM2 = 50,
		NUM3 = 51,
		NUM4 = 52,
		NUM5 = 53,
		NUM6 = 54,
		NUM7 = 55,
		NUM8 = 56,
		NUM9 = 57,
		SEMICOLON = 59,
		EQUALS = 61,
		A = 65,
		B = 66,
		C = 67,
		D = 68,
		E = 69,
		F = 70,
		G = 71,
		H = 72,
		I = 73,
		J = 74,
		K = 75,
		L = 76,
		M = 77,
		N = 78,
		O = 79,
		P = 80,
		Q = 81,
		R = 82,
		S = 83,
		T = 84,
		U = 85,
		V = 86,
		W = 87,
		X = 88,
		Y = 89,
		Z = 90,
		CONTEXT_MENU = 93,
		NUMPAD0 = 96,
		NUMPAD1 = 97,
		NUMPAD2 = 98,
		NUMPAD3 = 99,
		NUMPAD4 = 100,
		NUMPAD5 = 101,
		NUMPAD6 = 102,
		NUMPAD7 = 103,
		NUMPAD8 = 104,
		NUMPAD9 = 105,
		MULTIPLY = 106,
		ADD = 107,
		SEPARATOR = 108,
		SUBTRACT = 109,
		DECIMAL = 110,
		DIVIDE = 111,
		F1 = 112,
		F2 = 113,
		F3 = 114,
		F4 = 115,
		F5 = 116,
		F6 = 117,
		F7 = 118,
		F8 = 119,
		F9 = 120,
		F10 = 121,
		F11 = 122,
		F12 = 123,
		F13 = 124,
		F14 = 125,
		F15 = 126,
		F16 = 127,
		F17 = 128,
		F18 = 129,
		F19 = 130,
		F20 = 131,
		F21 = 132,
		F22 = 133,
		F23 = 134,
		F24 = 135,
		NUM_LOCK = 144,
		SCROLL_LOCK = 145,
		COMMA = 188,
		PERIOD = 190,
		SLASH = 191,
		BACK_QUOTE = 192,
		OPEN_BRACKET = 219,
		BACK_SLASH = 220,
		CLOSE_BRACKET = 221,
		QUOTE = 222,
		META = 224
	}
}