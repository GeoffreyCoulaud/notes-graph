import Vect2 from "./Vect2.mjs";

export default class GraphUserController{

	scrollPos = new Vect2(0,0);
	pos = new Vect2(0,0);
	click = false;
	
	get scale(){
		return 3 + this.scrollPos.y / 300;
	}

	#canvas = undefined;

	constructor(canvas){
		this.#canvas = canvas;

		// Handle mouse movements and clicks
		const mouseEvents = [
			"mouseeenter", 
			"mousemove", 
			"mouseleave", 
			"mousedown", 
			"mouseup"
		];
		for (const event of mouseEvents){
			this.#canvas.addEventListener(event, this.#handleMouseEvent);
		}
		
		// Handle scrolling
		this.#canvas.addEventListener("wheel", this.#handleWheelEvent);

	}

	#handleMouseEvent = (e)=>{
		const rect = this.#canvas.getBoundingClientRect();
		const center = new Vect2(rect.width, rect.height).scale(0.5);
		const newPos = new Vect2(e.offsetX, e.offsetY).sub(center);
		this.pos = newPos;
		this.click = e.buttons & 1;
	}

	#handleWheelEvent = (e)=>{
		this.scrollPos.add(new Vect2(e.deltaX, e.deltaY));
	}

}