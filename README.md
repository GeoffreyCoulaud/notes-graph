# Notes graph
A simple visualization tool for your linked markdown notes

https://user-images.githubusercontent.com/20744730/149183853-f5b46959-f789-483f-b50b-16c80bdc788e.mp4

## Dependencies
* NodeJS

## Usage
* Clone this repo and open a terminal
* `npm install`
* Copy `.env.example` to `.env` and replace `NOTES_DIR` with the absolute path to your note's directory 
* `npm run build`
* `npm run serve`
* Open [localhost:8003](http://localhost:8003) in your web browser to see the graph

The web server watches changes in the notes directory and will rebuild the notes graph data on the next API query.   
This means you can edit notes and just refresh the page to see the changes.

## How to use it with my notes
The links between notes are built from wikilinks in mardown notes, add some and you will see the graph reflect this linkage.

You can also use an extracted export of your notes from [Notabase](https://notabase.io/) as the notes directory since it uses wikilinks for its linked references.  
However, you will lose your unliked references since they are not exported.

## How to hack

### I don't like how the graph looks
Edit `src/GraphSimulationDisplayer.mjs` to reflect your preferences. You can change colors, radius, stroke width, scale... If it has to do with displaying, you can do it here.

### I don't like how the graph behaves
Edit `src/GraphSimulation.mjs` to change the force simulation parameters, add forces, change the equations used or do whatever you want.

### I want to read notes from somewhere else
You can write a new class inheriting from `NotesSource` and use it instead of `NotesFsSource` in `main.mjs`. I suppose it would be quite easy to read notes from a web server, a database or some sort of cloud storage.  
This class implements reading notes from a custom async iterator. The same goes for notes names only.  
