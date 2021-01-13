import {BaseClass, IObstacleProvider} from "yfiles";

/**
 * A custom IObstacleProvider implementation for this style.
 */
export class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
    edge: any;

    constructor(edge) {
        super();
        this.edge = edge
    }

    /**
     * Returns this edge's path as obstacle.
     * @param {IRenderContext} canvasContext
     * @return {GeneralPath} The edge's path.
     */
    getObstacles(canvasContext) {
        return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
    }
}
