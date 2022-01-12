import { promises as fsp } from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import Wikilinks from "markdown-it-wikilinks";
import MarkdownIt from "markdown-it";

import NotesSource from "./NotesSource.mjs";
import Note from "./Note.mjs";

const nop = (x)=>x;
const wikilinks = Wikilinks({
	"uriSuffix": "", 
	"postProcessPageName": nop, 
	"postProcessLabel": nop
});
const md = new MarkdownIt().use(wikilinks);

export default class NotesFsSource extends NotesSource {

	dir = undefined;
	dirents = undefined;

	constructor(dir) {
		super();
		this.dir = dir;
	}

	/**
	 * Get a note's reald name from its filename
	 * @param {string} filename - A note's filename
	 * @returns {string} The real note name
	 * @private
	 */
	#getNoteTitleFromFilename(filename) {
		const noteExt = path.extname(filename);
		const noteName = path.basename(filename, noteExt);
		return noteName;
	}

	/**
	 * Read a note as a DOM object
	 * @param {string} filePath - Path to the note to read
	 * @returns {*} - A JSDOM object representing the note
	 * @private
	 */
	async #readNote(filePath) {
		const title = this.#getNoteTitleFromFilename(filePath);
		let dom = await fsp.readFile(filePath, "utf-8");
		dom = md.render(dom);
		dom = new JSDOM(dom);
		const note = new Note(title, dom.window.document);
		return note;
	}

	/**
	 * Get notes dirents from the notes' directory
	 * @param {string} notesDir - Path to the notes' directory
	 */
	async #readDir() {
		this.dirents = await fsp.readdir(this.dir, { withFileTypes: true });
		this.dirents = this.dirents.filter(d => d.isFile());
	}

	async #getDirents(){
		if (typeof this.dirents === "undefined"){
			await this.#readDir();
		}
		return this.dirents;
	}

	/**
	 * Async iterator to get notes titles
	 */
	async * titlesIterator(){
		let index = 0;
		for (const dirent of (await this.#getDirents())){
			yield Promise.all([index, this.#getNoteTitleFromFilename(dirent.name)]);
			index++;
		}
	}

	/**
	 * Async iterator to read notes from
	 */
	async * notesIterator() {
		let index = 0;
		for (const dirent of (await this.#getDirents())){
			const filePath = path.resolve(path.join(this.dir, dirent.name));
			yield Promise.all([index, this.#readNote(filePath)]);
			index++;
		}
	}
}
