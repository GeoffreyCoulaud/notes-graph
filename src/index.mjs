import GraphDisplayer from "./GraphDisplayer.mjs";
import GraphSimulation from "./GraphSimulation.mjs";
import Vect2 from "./Vect2.mjs";

import "./index.styl";
import GraphUserController from "./GraphUserController.mjs";

async function main(){

	// Get data from the server
	const response = await fetch("/api/get-notes-graph", {method: "GET"});
	const data = await response.json();

	// Create simulation and its displayer
	const canvas = document.querySelector("canvas");
	const userController = new GraphUserController(canvas);
	const simulation = new GraphSimulation(data.nodes, data.links, userController);
	const displayer = new GraphDisplayer(canvas, simulation, userController);

	// Start the simulation
	function loop(dt){
		simulation.nextTick(dt);
		displayer.draw();
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);

}


document.addEventListener("DOMContentLoaded", main);