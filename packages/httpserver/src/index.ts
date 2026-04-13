import express from "express";
import { getClientDist } from "./getClientDist.js";
import { getLevelEditorDist } from "./getLevelEditorDist.js";

const app = express();

const clientDist = getClientDist();
const levelEditorDist = getLevelEditorDist();

app.use(express.static(clientDist));
app.use("/leveleditor", express.static(levelEditorDist));
app.use("/assets", express.static("../../assets"))

const server = app.listen(8000)