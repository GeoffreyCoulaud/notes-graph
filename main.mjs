import NotesFsSource from "./NotesFsSource.mjs";
import NotesGraph from "./NotesGraph.mjs";
import express from "express";
import process from "process";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Notes graph setup
const notesDir = process.env.NOTES_DIR;
const source = new NotesFsSource(notesDir);
const graph = new NotesGraph(source);
let isGraphStale = true;

// Watch for notes directory changes
const watcher = fs.watch(notesDir, {}, undefined);
watcher.on("change", (eventType, filename)=>{
	console.log("[INFO] Graph is stale");
	isGraphStale = true;
});
watcher.on("close", ()=>{
	console.warn("[WARN] Watcher closed");
});
watcher.on("error", (error)=>{
	console.error(`[ERROR] Watcher unexpectedly closed`);
	console.error(error);
})

// Express setup
const app = express();
const port = 8003;

app.use("/assets", express.static("assets")); 
app.use("/dist", express.static("dist"));
app.set("view engine", "pug");
app.set("views", "./views");

// Routing
app.get("/", (req, res)=>{
	res.render("index");
});

app.get("/api/get-notes-graph", async (req, res)=>{
	if (isGraphStale){
		console.log("[INFO] Building graph");
		await graph.build();
		isGraphStale = false;
	}
	res.json(graph);
});

// Start
app.listen(port, ()=>{
	console.log(`App listening on http://localhost:${port}`);
});