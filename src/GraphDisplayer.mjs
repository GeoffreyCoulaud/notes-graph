import Vect2 from "./Vect2.mjs";
import faker from "@faker-js/faker";

// Change this to true to generate random names to display under the nodes
const ANON_TITLES = false;

/**
 * A class used to display a graph simulation
 * @property {Range} nodeRadiusRange - Range for node radius
 * @property {string} nodeStrokeColor - Color used to fill nodes 
 * @property {string} nodeFillColor - Color used for nodes borders
 * @property {string} nodeTitleColor - Color used for node titles 
 * @property {number} nodeTitleFontSize - Font size used for node titles
 * @property {string} nodeTitleFontFamily - Font family used for node titles
 * @property {number} nodeStrokeWidth - Width of the nodes' borders 
 * @property {string} linkStrokeColor - Color used to draw links 
 * @property {number} linkStrokeWidth - Width of the links 
 * @property {string} backgroundColor - Color used for the canvas background
 * @property {Vect2} center - The simulation's center
 */
export default class GraphDisplayer{

	nodeRadiusRange = new Range(4, 15);
	nodeStrokeColor = "#36a56e";
	nodeFillColor = "#57C757";
	nodeGrabbedFillColor = "#65ed68";
	nodeStrokeWidth = 2;
	nodeTitleColor = "#e0e0e0";
	nodeTitleOutlineColor = "#505050";
	nodeTitleFontSize = 16;
	nodeTitleFontFamily = "sans-serif";
	linkGrabbedStrokeColor = "#becebe";
	linkStrokeColor = "#5b695b";
	linkStrokeWidth = 2;
	backgroundColor = "#252525";

	#userController = undefined;
	#simulation = undefined;
	#canvas = undefined;
	#ctx = undefined;
	
	/**
	 * Create a graph simulation displayer
	 * @param {HTMLCanvasElement} canvas - The canvas to draw on 
	 * @param {GraphSimulation} simulation - The simulation to draw
	 * @param {GraphUserController} userController - The user controller for interactivity
	 */
	constructor(canvas, simulation, userController){
		this.#userController = userController;
		this.#simulation = simulation;
		this.#canvas = canvas;
		this.#ctx = canvas.getContext("2d");
		for (const node of this.#simulation.nodes){
			node.title = ANON_TITLES ? faker.internet.userName() : node.title;
		}
	}
	
	/**
	 * Draw the graph simulation on the canvas
	 */
	draw(){
		
		// Update simulation viewport size
		const { width, height } = this.#canvas.getBoundingClientRect();
		this.#simulation.size = new Vect2(width, height);
		this.#canvas.height = height;
		this.#canvas.width = width;
		this.#ctx.translate(width / 2, height / 2);

		// Update cursor depending on grab
		const isGrabbing = this.#simulation.grabbedIndex !== -1;
		const cursor = isGrabbing ? "grabbing" : "default";
		this.#canvas.style.cursor = cursor;
		
		// Clear canvas
		this.#ctx.fillStyle = this.backgroundColor;
		this.#ctx.fillRect(-width/2, -height/2, width, height);
		
		// Display links
		this.#ctx.lineWidth = this.linkStrokeWidth;
		for (const link of this.#simulation.links){
			
			// Line between nodes
			const node1 = this.#simulation.nodes[link.source];
			const node2 = this.#simulation.nodes[link.target];
			const start = node1.pos.clone().scale(this.#userController.scale);
			const end   = node2.pos.clone().scale(this.#userController.scale);
			const grabbed = node1.grabbed || node2.grabbed;
			const color = grabbed ? this.linkGrabbedStrokeColor : this.linkStrokeColor;
			this.#ctx.strokeStyle = color;
			this.#ctx.beginPath();
			this.#ctx.moveTo(start.x, start.y);
			this.#ctx.lineTo(end.x, end.y);
			this.#ctx.stroke();

		}

		// Display nodes
		this.#ctx.strokeStyle = this.nodeStrokeColor;
		this.#ctx.lineWidth = this.nodeStrokeWidth;
		for (const node of this.#simulation.nodes){
			
			// Circle
			const pos = node.pos.clone().scale(this.#userController.scale);
			const radius = node.radius;
			const grabbed = node.grabbed;
			const color = grabbed ? this.nodeGrabbedFillColor : this.nodeFillColor;
			this.#ctx.beginPath();
			this.#ctx.fillStyle = color;
			this.#ctx.ellipse(pos.x, pos.y, radius, radius, 0, 0, Math.PI*2);
			this.#ctx.stroke();
			this.#ctx.fill();
			
			// Text
			this.#ctx.font = `${this.nodeTitleFontFamily} ${this.nodeTitleFontSize.toFixed(2)}px`;
			this.#ctx.fillStyle = this.nodeTitleColor;
			this.#ctx.strokeStyle = this.nodeTitleOutlineColor;
			this.#ctx.textBaseline = "top";
			this.#ctx.textAlign = "center";
			const y = pos.y + radius + this.nodeTitleFontSize;
			this.#ctx.strokeText(node.title, pos.x, y);
			this.#ctx.fillText(node.title, pos.x, y);

		}

	}

}