export default class NotesSource {
	/**
	 * Async iterator to loop through notes
	 * @yields {Object} - An index and a note
	 * @virtual
	 */
	async * notesIterator(){}
	
	/**
	 * Async iterator to loop through titles
	 * @yields {Object} - An index and a note title
	 * @virtual
	 */
	async * titlesIterator(){}
}
