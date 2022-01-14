import Vect2 from "./Vect2.mjs";

export default class GraphUserController{

	pos = new Vect2(0,0);
	click = false;
	scrollPos = new Vect2(0,0);

	#element = undefined;

	constructor(element){
		this.#element = element;

		// Handle mouse movements and clicks
		const mouseEvents = [
			"mouseeenter", 
			"mousemove", 
			"mouseleave", 
			"mousedown", 
			"mouseup"
		];
		const mouseEventsHandler = this.#handleMouseEvent.bind(this);
		for (const event of mouseEvents){
			this.#element.addEventListener(event, mouseEventsHandler);
		}
		
		// Handle scrolling
		const wheelEventsHandler = this.#handleWheelEvent.bind(this);
		this.#element.addEventListener("wheel", wheelEventsHandler);

	}

	#handleMouseEvent(event){
		this.pos.x = event.offsetX;
		this.pos.y = event.offsetY;
		this.click = event.buttons & 1;
	}

	#handleWheelEvent(event){
		this.scrollPos.add(new Vect2(event.deltaX, event.deltaY));
	}

}