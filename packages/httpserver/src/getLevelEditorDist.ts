import path from "path";
import { createRequire } from "module";

export function getLevelEditorDist(): string {
    const require = createRequire(import.meta.url);

    const editorRoot = path.dirname(
        require.resolve("@jbwg/leveleditor/package.json")
    );

    const editorDist = path.join(editorRoot, "dist");

    return editorDist;
}