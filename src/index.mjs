import GraphSimulationDisplayer from "./GraphSimulationDisplayer.mjs";
import GraphSimulation from "./GraphSimulation.mjs";
import Vect2 from "./Vect2.mjs";

import "./index.styl";

async function main(){

	// Get data from the server
	const response = await fetch("/api/get-notes-graph", {method: "GET"});
	const data = await response.json();

	// Create simulation and its displayer
	const canvas = document.querySelector("canvas");
	const { width, height } = canvas.getBoundingClientRect();
	const simulationSize = new Vect2(width, height);
	const simulation = new GraphSimulation(data.nodes, data.links, simulationSize);
	const displayer = new GraphSimulationDisplayer(simulation, canvas);

	// Start the simulation
	simulation.on("ticked", displayer.draw.bind(displayer));
	simulation.loop();

}

document.addEventListener("DOMContentLoaded", main);