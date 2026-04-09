import express from "express";
import { getClientDist } from "./getClientDist.js";

const app = express();

const clientDist = getClientDist();

app.use(express.static(clientDist));
app.use("/assets", express.static("../../assets"))

const server = app.listen(8000)