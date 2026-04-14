import { ControlSection } from "./control/ControlSection";
import { ControlButton } from "./control/ControlButton";
import { Vec2 } from "@jbwg/shared/math";
import { SpatialMap } from "@jbwg/shared/utils";
import { ViewModel } from "./ViewModel";
import { ControlText } from "./control/ControlText";

let saved: boolean = true;

const savedViewModel = new ViewModel<boolean>(
    () => saved,
    (value: boolean) => saved = value
);

let room: Room | undefined;

type Room = {
    name: string;
    chunkMap: SpatialMap<Chunk>;
};

type Chunk = {
    flatLayers: TileLayer<Tile>[];
    featureLayers: TileLayer<Feature>[];
};

type TileLayer<T> = {
    offset: Vec2;
    tiles: T[][];
};

type Tile = {
    tileset: string;
    id: string;
};

type Feature = {
    tileset: string;
    id: string;
    z: number;
};

const controlPanel = document.getElementById("control-panel");

if (!controlPanel) {
    throw new Error(`Unable to find element with id 'control-panel'`);
};

const filePanel = new ControlSection("File");
controlPanel.appendChild(filePanel.top);

let roomPanel: ControlSection | undefined;

const newFileButton = new ControlButton("New room");
newFileButton.addClickListener(() => {
    room = {
        name: "New room",
        chunkMap: new SpatialMap<Chunk>(),
    };

    if (roomPanel) {
        controlPanel.removeChild(roomPanel.top);
        roomPanel = undefined;
    };

    roomPanel = new ControlSection("Room");
    controlPanel.appendChild(roomPanel.top);

    const roomNameViewModel = ViewModel.forProperty(room, "name");
    const roomNameControl = new ControlText("Room name", roomNameViewModel);
    roomPanel.append(roomNameControl);

    savedViewModel.property = false;
});
filePanel.append(newFileButton);

const saveFileButton = new ControlButton("Save room");

savedViewModel.addChangeListener((value) => {
    saveFileButton.setDisable(value);
});

saveFileButton.setDisable(true);
filePanel.append(saveFileButton);

// const openFileButton = new Button("Open");
// filePanel.append(openFileButton);


// function getControlPanel() {
//     return document.getElementById("control-panel");
// };

// const controlPanel = getControlPanel();

// let roomDropdown = new DropdownSection("Room");

// controlPanel?.appendChild(roomDropdown.top);

// const newRoomButton = new Button("New");
// const openRoomButton = new Button("Open");

// newRoomButton.addClickListener(() => {
//     room = {
//         name: "New room",
//         chunkMap: new SpatialMap<Chunk>(),
//     };

//     const roomNameViewModel = ViewModel.forProperty(room, "name");

//     const roomNameTextInput = document.createElement("input");
//     roomNameTextInput.type = "text";
//     roomNameTextInput.value = roomNameViewModel.property;
//     roomNameTextInput.addEventListener("input", () => {
//         roomNameViewModel.property = roomNameTextInput.value;
//     });
//     roomNameViewModel.addChangeListener((value: string) => {
//         roomNameTextInput.value = value;
//     });
//     roomNameTextInput.classList.add("control");
//     roomDropdown.bottom.appendChild(roomNameTextInput);
// });

// roomDropdown.append(newRoomButton);
// roomDropdown.append(openRoomButton);

// function addFeatureLayer(chunk: Chunk) {
//     const tiles = init2dArray(16, 16, newFeature);
//     const offset = Vec2.zero;

//     const layer = {
//         offset,
//         tiles,
//     };

//     chunk.featureLayers.push(layer);
// };

// function addFlatLayer(chunk: Chunk) {
//     const tiles = init2dArray(16, 16, newTile);
//     const offset = Vec2.zero;

//     const layer = {
//         offset,
//         tiles,
//     };

//     chunk.flatLayers.push(layer);
// };


// function newFeature() {
//     return {
//         tileset: "",
//         id: "",
//         z: 0,
//     };
// };

// function newTile() {
//     return {
//         tileset: "",
//         id: "",
//     };
// };

// function init2dArray<T>(width: number, height: number, item: () => T) {
//     return Array(width).map(() => Array(height).map(item));
// };

// type Tile = {
//     tileset: string;
//     id: string;
// };

// // newRoomButton.addClickListener(() => {
// //     room = new Room();
// // });