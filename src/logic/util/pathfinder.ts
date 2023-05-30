import { Vector2 } from "@babylonjs/core";
import TileMap, { TileState } from "../level/tilemap";

import {Grid,Astar} from "fast-astar";

export default class PathFinder {
    private _tileMap: TileMap;
    private _finder: Astar;

    constructor(tileMap: TileMap) {
        this._tileMap = tileMap;
        this.updateGrid();
    }

    public updateGrid(): void {
        const size = this._tileMap.size;
        const resolution = this._tileMap.resolution;
        const grid = new Grid({
            col: size.x * resolution,
            row: size.y * resolution
        });
        for (let y = 0; y < size.y * resolution; y++) {
            for (let x = 0; x < size.x * resolution; x++) {
                const tile = this._tileMap.getSubTile(x, y);
                const hasTerrain = (tile & TileState.Terrain) !== 0;
                const hasObject = (tile & TileState.Object) !== 0;

                const state = hasTerrain && !hasObject ? 1 : 0;

                grid.set([x, y], "", state);
            }
        }

        this._finder = new Astar(grid);
    }

    public findPath(start: Vector2, end: Vector2): Vector2[] {
        console.log(`Finding path from ${start} to ${end}`);
        
        const subStart = new Vector2(
            Math.floor(start.x * this._tileMap.resolution),
            Math.floor(start.y * this._tileMap.resolution)
        );
        const subEnd = new Vector2(
            Math.floor(end.x * this._tileMap.resolution),
            Math.floor(end.y * this._tileMap.resolution)
        );

        const startMS = Date.now();
        let path = this._finder.search([subStart.x, subStart.y], [subEnd.x, subEnd.y]);
        const endMS = Date.now();

        console.log(`Pathfinding took ${endMS - startMS}ms`);

        if (path.length >= 250) {
            console.warn(`Pathfinding took too long! ${path.length} steps`);
            path = path.slice(0, 250);
        }

        const resolution = this._tileMap.resolution;

        return path.map(p => new Vector2(p[0] / resolution, p[1] / resolution));
    }
}