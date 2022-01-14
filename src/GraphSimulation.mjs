import Vect2 from "./Vect2.mjs";

class Range{
	constructor(min, max){
		this.min = min;
		this.max = max;
	}
	
	get span(){
		return this.max - this.min;
	}

	/**
	 * Map a number from a range to another
	 * @param {number} value - The value to get in the new range
	 * @param {Range} from - The range in which the value is currently
	 * @param {Range} to - The range in which to convert the value
	 * @returns {number}
	 */
	static map(value, from, to){
		const proportion = (value - from.min) / from.span;
		const mapped = proportion * to.span + to.min;
		return mapped;
	}
}

/**
 * A class representing a force-driven graph simulation
 * @property {Node[]} nodes - The graph nodes
 * @property {SimpleLink[]} links - The links between nodes
 * @property {Vect2} size - The simulation display size
 * @emits ticked - After a simulation tick
 */
export default class GraphSimulation{
	
	#lastTickTime = undefined;
	#radiusRange = new Range(4, 15);
	#linksRange = new Range(+Infinity, 0);
	#isNewClick = true;
	
	nodes = [];
	links = [];
	userController = undefined;
	
	center = new Vect2(0, 0);
	grabbedIndex = -1;

	repulsionFactor = 2;
	centerFactor = -0.00002;
	dragFactor = 1.05;
	linkLengthSq = 90;
	linkFactor = 0.0001;

	/**
	 * Create a graph simulation
	 * @param {Nodes[]} nodes - The nodes to use for the simulation
	 * @param {SimpleLink[]} links - The links between the nodes
	 * @param {GraphUserController} userController - The user controller for interactivity
	 */
	constructor(nodes, links, userController = undefined){
		this.nodes = nodes;
		this.links = links;
		this.userController = userController;
		function salt(){
			return Math.random() / 1000;
		}
		
		// Set additional data for each node
		for (const node of this.nodes) {
			node.pos = new Vect2(salt(), salt());
			node.vel = new Vect2();
			node.grabbed = false;
			node.nlinks = 0;
			node.radius = 1;
		}

		// Get number of links per node 
		for (const link of this.links){
			this.nodes[link.source].nlinks++;
			this.nodes[link.target].nlinks++;
		}

		// Get the links range
		for (const node of this.nodes){
			if (node.nlinks < this.#linksRange.min){
				this.#linksRange.min = node.nlinks; 
			}
			if (node.nlinks > this.#linksRange.max){
				this.#linksRange.max = node.nlinks; 
			}
		}

		// Set radius for every node
		for (const node of this.nodes){
			node.radius = Range.map(
				node.nlinks, 
				this.#linksRange, 
				this.#radiusRange
			);
		}

	}

	/**
	 * Apply a distance dependent force to a node.
	 * Is used for electrostatic force and spring force.
	 * @param {Node} node - The simulation Node to apply the force to
	 * @param {Vect2} target - Position of the force target
	 * @param {number} dt - Elapsed time in millis
	 * @param {function} f - Function giving the strength factor depending on the distance
	 * @param {number} factor - Repulsion or attraction factor
	 */
	#applyDistanceForce(node, target, dt, f, factor = 1) {
		const pos = node.pos;
		const distance = pos.distanceTo(target);
		const strength = factor * f.call(this, distance);
		const dv = pos.clone()
			.sub(target)
			.normalize()
			.scale(strength)
			.scale(dt);
		node.vel.add(dv);
	}

	/**
	 * Apply an electrostatic force to a node depending on
	 * an equal reacting charge's position.
	 * @param {Node} node - The simulation Node to apply the force to
	 * @param {Vect2} target - Position of the force target
	 * @param {number} dt - Elapsed time in millis
	 * @param {number} factor - Repulsion or attraction factor
	 */
	#applyElectrostaticForce(node, target, dt, factor = 1) {
		function f(distance) {
			const MIN_DISTANCE = 20; // Avoid really small distances
			return 1 / Math.pow(Math.max(distance, MIN_DISTANCE), 2);
		}
		this.#applyDistanceForce(node, target, dt, f, factor);
	}

	/**
	 * Apply a spring force to a node depending on 
	 * its distance to a target position
	 * @param {Node} node - The simulation Node to apply the force to
	 * @param {Vect2} target - Target position
	 * @param {number} dt - Elapsed time in millis
	 * @param {number} factor - Repulsion or attraction factor
	 */
	#applySpringForce(node, target, dt, factor = 1){
		function f(distance){
			return distance;
		}
		this.#applyDistanceForce(node, target, dt, f, factor);
	}

	/**
	 * Apply a gravitational force directed towards the center to all nodes
	 * @param {number} dt - Elapsed time in millis
	 */
	#applyCenterForce(dt) {
		for (const node of this.nodes) {
			if (node.grabbed) continue;
			this.#applySpringForce(node, this.center, dt, this.centerFactor);
		}
	}

	/**
	 * Apply a repulsion force to all nodes towards each other
	 * @param {number} dt - Elapsed time in millis
	 */
	#applyRepulsionForce(dt) {
		for (const node of this.nodes) {
			if (node.grabbed) continue;
			for (const target of this.nodes) {
				if (node.index === target.index) {
					continue;
				}
				const targetPos = target.pos.clone();
				this.#applyElectrostaticForce(node, targetPos, dt, this.repulsionFactor);
			}
		}
	}

	/**
	 * Apply an attraction to all linked nodes
	 * @param {number} dt - Elapsed time in millis
	 */
	#applyLinkForce(dt) {
		for (const link of this.links) {
			const node1 = this.nodes[link.source];
			const node2 = this.nodes[link.target];
			const distanceSq = node1.pos.distanceSqTo(node2.pos);
			const way = Math.sign(this.linkLengthSq - distanceSq);
			const factor = this.linkFactor * way;
			if (!node1.grabbed){
				this.#applySpringForce(node1, node2.pos, dt, factor);
			}
			if (!node2.grabbed){
				this.#applySpringForce(node2, node1.pos, dt, factor);
			}
		}
	}

	/**
	 * Apply a drag force that reduces speed
	 * @param {number} dt - Elapsed time in millis
	 */
	#applyDragFroce(dt){
		for (const node of this.nodes){
			if (node.grabbed) continue;
			const factor = 1 / (this.dragFactor ** dt); 
			node.vel.scale(factor);
		}
	}

	/**
	 * Apply velocity to each node in the simultation
	 * @param {number} dt - Elapsed time in millis
	 */
	#applyVelocity(dt) {
		for (const node of this.nodes) {
			if (node.grabbed) continue;
			const vel = node.vel;
			const dp = vel.clone().scale(dt);
			node.pos.add(dp);
		}
	}

	/**
	 * Update if a node is grabbed and which one
	 */
	#updateGrabbedNode(){
		if (!this.userController.click){
			// On declick, de-grab
			if (this.grabbedIndex !== -1){
				this.nodes[this.grabbedIndex].grabbed = false;
				this.grabbedIndex = -1;
			}
			this.#isNewClick = true;

		} else {
			// On new click, grab
			if (this.#isNewClick){
				// Find the grabbed (last to first)
				let i = this.nodes.length - 1;
				this.grabbedIndex = -1;
				do {
					const node = this.nodes[i];
					const pos = node.pos.clone().scale(this.userController.scale);
					const distanceSq = this.userController.pos.distanceSqTo(pos);
					const radiusSq = node.radius ** 2;
					if (distanceSq <= radiusSq){
						node.grabbed = true;
						this.grabbedIndex = i;
						break;
					}
					i--;
				} while (i >= 0);
				this.#isNewClick = false;
			}
		}
	}

	#moveGrabbedNode(){
		if (this.grabbedIndex === -1) return;
		const node = this.nodes[this.grabbedIndex];
		const pos = this.userController.pos.clone()
			.scale(1/this.userController.scale);
		node.pos = pos;
	}

	/**
	 * Compute the next simulation tick
	 * @param {DOMHighResTimestamp} now - Current timestamp in millis
	 */
	nextTick(now) {
		if (typeof this.#lastTickTime === "undefined") {
			this.#lastTickTime = now;
			return;
		}
		const dt = now - this.#lastTickTime;
		this.#updateGrabbedNode();
		this.#moveGrabbedNode();
		this.#applyCenterForce(dt);
		this.#applyRepulsionForce(dt);
		this.#applyLinkForce(dt);
		this.#applyDragFroce(dt);
		this.#applyVelocity(dt);
		this.#lastTickTime = now;
	}

}