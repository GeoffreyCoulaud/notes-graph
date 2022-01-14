import Vect2 from "./Vect2.mjs";
import faker from "@faker-js/faker";

// Change this to true to generate random names to display under the nodes
const ANON_TITLES = false;

class DisplayData{
	pos = new Vect2();
	title = undefined;
}

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
	nodeFillColor = "#37A737";
	nodeStrokeWidth = 2;
	nodeTitleColor = "#e0e0e0";
	nodeTitleFontSize = 16;
	nodeTitleFontFamily = "sans-serif";
	linkStrokeColor = "#abd8ab";
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
		this.userController = userController;
		this.#simulation = simulation;
		this.#canvas = canvas;
		this.#ctx = canvas.getContext("2d");
		for (const node of this.#simulation.nodes){
			node.dispdata = new DisplayData();
			node.dispdata.title = ANON_TITLES ? faker.internet.userName() : node.title;
		}
	}
	
	/**
	 * Draw the graph simulation on the canvas
	 */
	draw(){

		// Update nodes displayed position
		// TODO more robust scrolling to scale conversion
		const scale = 3 + this.userController.scrollPos.y / 300; 
		for (const node of this.#simulation.nodes){
			node.dispdata.pos = node.simdata.pos.clone().scale(scale);
		}
		
		// Update simulation viewport size
		const { width, height } = this.#canvas.getBoundingClientRect();
		this.#simulation.size = new Vect2(width, height);
		this.#canvas.height = height;
		this.#canvas.width = width;
		this.#ctx.translate(width / 2, height / 2);
		
		// Clear canvas
		this.#ctx.fillStyle = this.backgroundColor;
		this.#ctx.fillRect(-width/2, -height/2, width, height);
		
		// Display links
		this.#ctx.strokeStyle = this.linkStrokeColor;
		this.#ctx.lineWidth = this.linkStrokeWidth;
		for (const link of this.#simulation.links){

			// Line between nodes
			const start = this.#simulation.nodes[link.source].dispdata.pos;
			const end = this.#simulation.nodes[link.target].dispdata.pos;
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
			const radius = node.simdata.radius;
			const pos = node.dispdata.pos;

			this.#ctx.beginPath();
			this.#ctx.fillStyle = this.nodeFillColor;
			this.#ctx.ellipse(pos.x, pos.y, radius, radius, 0, 0, Math.PI*2);
			this.#ctx.stroke();
			this.#ctx.fill();
			
			// Text
			this.#ctx.font = `${this.nodeTitleFontFamily} ${this.nodeTitleFontSize.toFixed(2)}px`;
			this.#ctx.fillStyle = this.nodeTitleColor;
			this.#ctx.textBaseline = "top";
			this.#ctx.textAlign = "center";
			const y = pos.y + radius + this.nodeTitleFontSize;
			this.#ctx.fillText(node.dispdata.title, pos.x, y);

		}

	}

}