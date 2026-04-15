import { ControlSection } from "./control/ControlSection";
import { ControlButton } from "./control/ControlButton";
import { Rect, Vec2 } from "@jbwg/shared/math";
import { init2dArray, isNotNullOrUndefined, SpatialMap } from "@jbwg/shared/utils";
import { ViewModel } from "./ViewModel";
import { ControlText } from "./control/ControlText";
import { IGraphics, ITileset, CanvasRenderingContext2dGraphics, Draw } from "@jbwg/shared/graphics";

// let saved: boolean = true;

const canvas = document.getElementById("canvas-2d") as HTMLCanvasElement;

if (!isNotNullOrUndefined(canvas)) {
    throw new Error("Unable to find canvas element");
};

const mousePosition = Vec2.zero;

const graphics = new CanvasRenderingContext2dGraphics(canvas);

document.addEventListener("mousemove", (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

window.addEventListener("keydown", (event) => {
    if (event.key in ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"]) {
        switch (event.key) {
            case "KeyA": {
                graphics.viewport.x -= 4;
                break;
            };
            case "KeyD": {
                graphics.viewport.x += 4;
                break;
            };
            case "KeyS": {
                graphics.viewport.y += 4;
                break;
            };
            case "KeyW": {
                graphics.viewport.y -= 4;
                break;
            };
        };
        event.preventDefault();
    };
});

function getCanvasLocalMousePosition(): Vec2 {
    const rect = canvas.getBoundingClientRect();
    const rectPos = new Vec2(rect.left, rect.top);
    const viewportPos = new Vec2(graphics.viewport.left, graphics.viewport.top);

    return mousePosition
        .subtract(rectPos)
        .divide(graphics.renderScale)
        .floor()
        .add(viewportPos);
};

// canvas.addEventListener("mousemove", (event) => {
//     const rect = canvas.getBoundingClientRect();

//     mousePosition.x = Math.floor((event.clientX - rect.left) / graphics.renderScale) + graphics.viewport.left;
//     mousePosition.y = Math.floor((event.clientY - rect.top) / graphics.renderScale) + graphics.viewport.top;
// });

// const savedViewModel = new ViewModel<boolean>(
//     () => saved,
//     (value: boolean) => saved = value
// );

// let room = {
//     name: "New room",
//     chunkMap: new SpatialMap<Chunk>(),
// };

// type Room = {
//     name: string;
//     chunkMap: SpatialMap<Chunk>;
// };

// type Chunk = {
//     flatLayers: TileLayer<Tile>;
//     featureLayers: TileLayer<Feature>;
// };

// type TileLayer<T> = {
//     offset: Vec2;
//     tiles: T[][];
// };

// type Tile = {
//     tileset: string;
//     id: string;
// };

// type Feature = {
//     tileset: string;
//     id: string;
//     z: number;
// };

// const controlPanel = document.getElementById("control-panel");

// if (!controlPanel) {
//     throw new Error(`Unable to find element with id 'control-panel'`);
// };

// const filePanel = new ControlSection("File");
// controlPanel.appendChild(filePanel.top);

// let roomPanel: ControlSection | undefined;

// const newFileButton = new ControlButton("New room");
// newFileButton.addClickListener(() => {
//     room = {
//         name: "New room",
//         chunkMap: new SpatialMap<Chunk>(),
//     };

//     if (roomPanel) {
//         controlPanel.removeChild(roomPanel.top);
//         roomPanel = undefined;
//     };

//     roomPanel = new ControlSection("Room");
//     controlPanel.appendChild(roomPanel.top);

//     const roomNameViewModel = ViewModel.forProperty(room, "name");
//     const roomNameControl = new ControlText("Room name", roomNameViewModel);
//     roomPanel.append(roomNameControl);

//     savedViewModel.property = false;
// });
// filePanel.append(newFileButton);

// const saveFileButton = new ControlButton("Save room");

// savedViewModel.addChangeListener((value) => {
//     saveFileButton.setDisable(value);
// });

// saveFileButton.setDisable(true);
// filePanel.append(saveFileButton);

const canvasOverlay = document.getElementById("canvas-overlay");

if (!isNotNullOrUndefined(canvasOverlay)) {
    throw new Error("Unable to find canvas overlay element");
};

enum EditMode {
    PLACE_FLOOR,
    PLACE_FEATURE,
};

let editMode = EditMode.PLACE_FLOOR;

class Tile {
    tileset?: string;
    id: number;

    constructor(tileset?: string, id: number = -1) {
        this.tileset = tileset;
        this.id = id;
    };
};

const CHUNK_SIZE = 16;
const TILE_SIZE = 16;

class Chunk {
    position: Vec2;
    tileCount = 0;

    floor: Tile[][] = init2dArray(CHUNK_SIZE, CHUNK_SIZE, () => new Tile());
    features: Tile[][] = init2dArray(CHUNK_SIZE, CHUNK_SIZE, () => new Tile());

    constructor(position: Vec2) {
        this.position = position;
    };
};

class Highlight {
    highlight: HTMLDivElement;

    constructor(color: string, panelId: string, opacity = "20") {
        this.highlight = document.createElement("div");

        this.highlight.classList.add("highlight");
        this.highlight.style.backgroundColor = color + opacity;
        this.highlight.style.outlineColor = color;

        const panel = document.getElementById(panelId);
        panel?.appendChild(this.highlight);
    }

    set position(value: Vec2) {
        const position = value
            .subtract(new Vec2(graphics.viewport.left, graphics.viewport.top))
            .multiply(graphics.renderScale);

        this.highlight.style.left = position.x + "px";
        this.highlight.style.top = position.y + "px";
    };

    set size(value: number) {
        const sizeScaled = value * graphics.renderScale;
        const sizePx = sizeScaled + "px";
        this.highlight.style.width = sizePx;
        this.highlight.style.height = sizePx;
    };
};

const tileHighlight = new Highlight("#ffff00", "canvas-overlay");
const chunkHighlight = new Highlight("#ff0000", "canvas-overlay");

function coordGlobalToChunk(coord: Vec2) {
    return coord
        .divide(CHUNK_SIZE * TILE_SIZE)
        .floor()
};

function coordGlobalToTile(coord: Vec2) {
    return coord
        .divide(TILE_SIZE)
        .floor()
        .remainder(CHUNK_SIZE)
        .apply(
            (x: number) => x < 0
                ? x + CHUNK_SIZE
                : x
        );
};

function coordTileToChunkLocal(coord: Vec2) {
    return coord
        .multiply(TILE_SIZE)
};

function coordChunkToGlobal(coord: Vec2) {
    return coord
        .multiply(CHUNK_SIZE * TILE_SIZE);
};

class Room {
    chunkMap = new SpatialMap<Chunk>();
};

const room = new Room();

type Editor = {
    canvas: HTMLCanvasElement,
    graphics: IGraphics,
    room: Room,
};

const editor: Editor = {
    canvas,
    graphics,
    room,
};

function updateHighlights() {
    const canvasLocalMousePosition = getCanvasLocalMousePosition();

    const chunk = coordGlobalToChunk(canvasLocalMousePosition);
    const tile = coordGlobalToTile(canvasLocalMousePosition);

    const chunkPosition = coordChunkToGlobal(chunk);
    const tilePosition = coordTileToChunkLocal(tile)
        .add(chunkPosition);

    chunkHighlight.position = chunkPosition;
    chunkHighlight.size = CHUNK_SIZE * TILE_SIZE;

    tileHighlight.position = tilePosition;
    tileHighlight.size = TILE_SIZE;
}

class Tileset implements ITileset {
    image: HTMLImageElement;

    constructor(image: HTMLImageElement) {
        this.image = image;
    };

    getSpriteRect(tileId: number): Rect | undefined {
        if (tileId < 0) {
            return undefined;
        };

        const tileCoord = new Vec2(
            tileId % TILE_SIZE,
            Math.floor(tileId / TILE_SIZE),
        );

        if (tileCoord.y >= Math.floor(this.image.height / TILE_SIZE)) {
            return undefined;
        };

        return new Rect(
            tileCoord.x * TILE_SIZE,
            tileCoord.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
        );
    };
};

const tilesets = new Map<string, Tileset>();

function drawFloor(chunk: Chunk) {
    const chunkPosition = coordChunkToGlobal(chunk.position);
    for (let i = 0; i < CHUNK_SIZE; ++i) {
        for (let j = 0; j < CHUNK_SIZE; ++j) {
            const tile = chunk.floor[i][j];

            const tilesetName = tile.tileset;
            const id = tile.id;

            if (!isNotNullOrUndefined(tilesetName) || id === -1) {
                continue;
            };

            const tileset = tilesets.get(tilesetName);

            if (!isNotNullOrUndefined(tileset)) {
                continue;
            };

            const position = new Vec2(i, j)
                .multiply(TILE_SIZE)
                .add(chunkPosition);

            const draw = Draw.tile(tileset, id, position);

            if (!isNotNullOrUndefined(draw)) {
                continue;
            };

            graphics.render(draw);
        };
    };
};

function drawFeatures(chunk: Chunk) {
    const chunkPosition = coordChunkToGlobal(chunk.position);
    for (let i = 0; i < CHUNK_SIZE; ++i) {
        for (let j = 0; j < CHUNK_SIZE; ++j) {
            const tile = chunk.features[i][j];

            const tilesetName = tile.tileset;
            const id = tile.id;

            if (!isNotNullOrUndefined(tilesetName) || id === -1) {
                continue;
            };

            const tileset = tilesets.get(tilesetName);

            if (!isNotNullOrUndefined(tileset)) {
                continue;
            };

            const position = new Vec2(i, j)
                .multiply(TILE_SIZE)
                .add(chunkPosition);

            const draw = Draw.tile(tileset, id, position);

            if (!isNotNullOrUndefined(draw)) {
                continue;
            };

            graphics.render(draw);
        };
    };
};

function drawRoom() {
    const viewportChunk = coordGlobalToChunk(graphics.viewport.position);
    for (let i = viewportChunk.x - 1; i < viewportChunk.x + 1; ++i) {
        for (let j = viewportChunk.y - 1; j < viewportChunk.y + 1; ++j) {
            const chunk = room.chunkMap.get(new Vec2(i, j));

            if (!isNotNullOrUndefined(chunk)) {
                continue;
            };

            drawFloor(chunk);
            drawFeatures(chunk);
        }
    }
}

function step() {
    updateHighlights();
    drawRoom();
};

function run() {
    step();
    requestAnimationFrame(run);
};

run();