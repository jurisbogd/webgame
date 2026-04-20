import path from "path";
import { createRequire } from "module";

export function getClientDist(): string {
    const require = createRequire(import.meta.url)

    const clientRoot = path.dirname(
        require.resolve("@jbwg/client/package.json")
    );

    const clientDist = path.join(clientRoot, "dist");

    return clientDist;
}