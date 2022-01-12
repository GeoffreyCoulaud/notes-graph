export default class Vect2 {

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Get a vector's length
	 * @returns {number}
	 */
	getLength(){
		return this.distanceTo(new Vect2(0, 0));
	}

	/**
	 * Clone a vector
	 * @returns {Vect2}
	 */
	clone() {
		return new Vect2(this.x, this.y);
	}

	/**
	 * Add two vectors together
	 * @param {Vect2} a
	 * @returns {Vect2}
	 */
	add(a) {
		this.x += a.x;
		this.y += a.y;
		return this;
	}

	/**
	 * Subtract a vector to this
	 * @param {Vect2} a
	 * @returns {Vect2}
	 */
	sub(a) {
		this.x -= a.x;
		this.y -= a.y;
		return this;
	}

	/**
	 * Scale a vector by a factor
	 * @param {number} factor
	 * @returns {Vect2}
	 */
	scale(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	/**
	 * Normalize a vector
	 * @returns {Vect2}
	 */
	normalize() {
		const length = this.getLength();
		if (length === 0) return this;
		return this.scale(1 / length);
	}

	/**
	 * Compute the distance squared between two vectors
	 * @param {Vect2} a
	 * @returns {number}
	 */
	distanceSqTo(a) {
		return (this.x - a.x) ** 2 + (this.y - a.y) ** 2;
	}

	/**
	 * Compute the distance between two vectors
	 * @param {Vect2} a
	 * @returns {number}
	 */
	distanceTo(a) {
		return Math.sqrt(this.distanceSqTo(a));
	}
}
