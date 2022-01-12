/**
 * A class representing a link between two nodes
 * @property {number} source - Source of the link
 * @property {number} target - Target of the link
 */
class Link{
	/**
	 * Create a link
	 * @param {number} source - Node index for the source node
	 * @param {number} target - Node index for the target node
	 */
	constructor(source, target){
		this.source = source;
		this.target = target;
	}
	/**
	 * Check if this link is equal to another
	 * @param {Link} x - The link to compare to
	 * @returns {boolean} - True if the links share source and target, else false
	 */
	equals(x){
		return (this.source === x.source && this.target === x.target); 
	}
}

/**
 * A class representing a simpler link.
 * Source is always less than or equal to target.
 * @property {number} source - Source of the link
 * @property {number} target - Target of the link
 */
class SimpleLink extends Link{
	/**
	 * Create a simple link
	 * @param {number} a - First node index
	 * @param {number} b - Second node index
	 */
	constructor(a, b){
		if (a <= b){
			super(a, b);
		} else {
			super(b, a);
		}
	}
}

/**
 * A class representing a set of unique SimpleLink-s
 */
class UniqueSimpleLinkArray extends Array{
	/**
	 * Add a SimpleLink to the array.
	 * If it is a duplicate, nothing is done.
	 * @param {SimpleLink} link - The link to add to the set
	 */
	push(link){
		// Ensure uniqueness
		for (const elem of this){
			if (elem.equals(link)){
				return;
			}
		}
		// Push
		Array.prototype.push.call(this, link);
	}
}

/**
 * A class representing a graph node
 */
class Node{
	/**
	 * Create a Node
	 * @param {number} index - The node's index in the array of nodes
	 * @param {string} title - The node's title
	 */
	constructor(index, title){
		this.index = index;
		this.title = title;
	}
}

/**
 * A class representing a group of notes linked as a graph
 * @property {Node[]} nodes - An array of the graph's Node-s
 * @property {UniqueSimpleLinkArray} links - An array of unique SimpleLink-s in the graph
 */
export default class NotesGraph{

	#notesSource = null;

	nodes = new Array();
	links = new UniqueSimpleLinkArray();

	/**
	 * Create a notes graph
	 * @param {NotesSource} notesSource - The source from which to read notes
	 */
	constructor(notesSource){
		this.#notesSource = notesSource;
	}

	/**
	 * Read the notes' references from the source
	 */
	async build(){
		
		// Don't add data in place
		this.nodes.splice(0, this.nodes.length);
		this.links.splice(0, this.links.length);
		
		// Keep track of which title's index
		const titleIndexMap = new Map();

		// Nodes
		for await (const [index, title] of this.#notesSource.titlesIterator()){
			// Rember the index for this title
			titleIndexMap.set(title, index);
			// Create the node
			const node = new Node(index, title);
			this.nodes.push(node);
		}
		
		// Links
		for await (const [index, note] of this.#notesSource.notesIterator()){

			// Go through the note's links
			const anchors = Array.from(note.document.getElementsByTagName("a"));
			for (const anchor of anchors){
				
				// Get link href
				let href;
				href = anchor?.getAttribute("href");
				if (typeof href !== "string") continue;
				if (!href.startsWith("./")) continue;
				href = href.replace("./", "");
				
				// Add double link (if unique)
				if (!titleIndexMap.has(href)){
					console.warn(`[WARN] "${note.title}" links to missing target "${href}"`);
					continue;
				}
				const targetIndex = titleIndexMap.get(href);
				const link = new SimpleLink(index, targetIndex);
				this.links.push(link);

			}

		}

	}

	/**
	 * Print in the console the current references graph
	 */
	print(){
		for (const [key, ref] of this.references){
			console.log(key);
			const isAlone = ref.linksTo.size + ref.linkedBy.size === 0; 
			if (isAlone){
				console.log("\t---");
			}
			for (const link of ref.linksTo){
				console.log(`\t=> ${link}`);
			}
			for (const link of ref.linkedBy){
				console.log(`\t<= ${link}`);
			}
		}
	}

}