import {Visual, IInputModeContext,IEdge, INode, IRenderContext, Arrow, ArrowType, Rect,BridgeManager, EdgeStyleBase, GeneralPath, IArrow, IObstacleProvider, Point, SvgVisual} from "yfiles";
import {CssArrow} from "./cssArrow";
import {BasicEdgeObstacleProvider} from "./basicEdgeObstacleProvider";
import {isBrowserWithBadMarkerSupport} from "./utils";
import {MarkerDefsSupport} from "./markerDefsSupport";

const SVG_NS = "http://www.w3.org/2000/svg";

export class CssEdgeStyle extends EdgeStyleBase {
    cssClass: string;
    private readonly $fallbackArrow: IArrow;
    private $markerDefsSupport: MarkerDefsSupport;
    showTargetArrows: boolean;
    private readonly useMarkerArrows: boolean;
    private readonly $hiddenArrow: Arrow;

    constructor() {
        super();
        this.cssClass = "";

        this.$hiddenArrow = new Arrow({
            type: ArrowType.NONE,
            cropLength: 6,
            scale: 1
        });
        this.$fallbackArrow = new CssArrow() as any;
        this.$markerDefsSupport = null;
        this.showTargetArrows = true;
        this.useMarkerArrows = false

    }

    /**
     * Helper function to crop a {@link GeneralPath} by the length of the used arrow.
     * @param {IEdge} edge
     * @param {GeneralPath} gp
     * @return {GeneralPath}
     * @private
     */
    $cropRenderedPath(edge, gp) {
        if (this.showTargetArrows) {
            const dummyArrow: IArrow =
                !isBrowserWithBadMarkerSupport && this.useMarkerArrows
                    ? this.$hiddenArrow
                    : this.$fallbackArrow;
            return this.cropPath(edge, IArrow.NONE, dummyArrow, gp)
        } else {
            return this.cropPath(edge, IArrow.NONE, IArrow.NONE, gp)
        }
    }

    /**
     * Creates the visual for an edge.
     * @param {IEdge} edge
     * @param {IRenderContext} renderContext
     * @return {Visual}
     */
    createVisual(renderContext, edge) {
        let renderPath = this.$createPath(edge);
        // crop the path such that the arrow tip is at the end of the edge
        renderPath = this.$cropRenderedPath(edge, renderPath);

        if (renderPath.length === 0) {
            return null
        }

        const gp = this.createPathWithBridges(renderPath, renderContext);

        const path = document.createElementNS(SVG_NS, "path");
        const pathData = gp.size === 0 ? "" : gp.createSvgPathData();
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#336699");

        if (this.cssClass) {
            path.setAttribute("class", this.cssClass);
            this.$fallbackArrow["cssClass"] = this.cssClass + "-arrow"
        }

        if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
            this.showTargetArrows &&
            path.setAttribute(
                "marker-end",
                "url(#" + renderContext.getDefsId(this.$createMarker()) + ")"
            );

            path["data-renderDataCache"] = {
                path: renderPath,
                obstacleHash: this.getObstacleHash(renderContext)
            };
            return new SvgVisual(path)
        } else {
            // use yfiles arrows instead of markers
            const container = document.createElementNS(SVG_NS, "g");
            container.appendChild(path);
            this.showTargetArrows &&
            super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.$fallbackArrow);
            container["data-renderDataCache"] = {
                path: renderPath,
                obstacleHash: this.getObstacleHash(renderContext)
            };
            return new SvgVisual(container)
        }
    }

    /**
     * Re-renders the edge by updating the old visual for improved performance.
     * @param {IEdge} edge
     * @param {IRenderContext} renderContext
     * @param {Visual} oldVisual
     * @return {Visual}
     */
    updateVisual(renderContext, oldVisual, edge) {
        if (oldVisual === null) {
            return this.createVisual(renderContext, edge)
        }

        let renderPath = this.$createPath(edge);
        if (renderPath.length === 0) {
            return null
        }
        // crop the path such that the arrow tip is at the end of the edge
        renderPath = this.$cropRenderedPath(edge, renderPath);
        const newObstacleHash = this.getObstacleHash(renderContext);

        let path = oldVisual.svgElement;
        const cache = path["data-renderDataCache"];
        if (!renderPath.hasSameValue(cache["path"]) || cache["obstacleHash"] !== newObstacleHash) {
            cache["path"] = renderPath;
            cache["obstacleHash"] = newObstacleHash;
            const gp = this.createPathWithBridges(renderPath, renderContext);
            const pathData = gp.size === 0 ? "" : gp.createSvgPathData();
            if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
                // update code for marker arrows
                path.setAttribute("d", pathData);
                return oldVisual
            } else {
                // update code for yfiles arrows
                const container = oldVisual.svgElement;
                path = container.childNodes.item(0);
                path.setAttribute("d", pathData);
                while (container.childElementCount > 1) {
                    container.removeChild(container.lastChild)
                }
                this.showTargetArrows &&
                super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.$fallbackArrow)
            }
        }
        return oldVisual
    }

    /**
     * Creates the path of an edge.
     * @param {IEdge} edge
     * @return {GeneralPath}
     * @private
     */
    $createPath(edge) {
        let path;
        // build path
        if (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) {
            // pretty self loops
            let outerX, outerY;
            if (edge.bends.size === 1) {
                const bendLocation = edge.bends.get(0).location;
                outerX = bendLocation.x;
                outerY = bendLocation.y
            } else {
                if (INode.isInstance(edge.sourcePort.owner)) {
                    outerX = edge.sourcePort.owner.layout.x - 20;
                    outerY = edge.sourcePort.owner.layout.y - 20
                } else {
                    const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
                        edge.sourcePort,
                        edge.sourcePort.locationParameter
                    );
                    outerX = sourcePortLocation.x - 20;
                    outerY = sourcePortLocation.y - 20
                }
            }
            path = new GeneralPath(4);
            let lastPoint = edge.sourcePort.locationParameter.model.getLocation(
                edge.sourcePort,
                edge.sourcePort.locationParameter
            );
            path.moveTo(lastPoint);
            path.lineTo(outerX, lastPoint.y);
            path.lineTo(outerX, outerY);
            lastPoint = edge.targetPort.locationParameter.model.getLocation(
                edge.targetPort,
                edge.targetPort.locationParameter
            );
            path.lineTo(lastPoint.x, outerY);
            path.lineTo(lastPoint)
        } else {
            path = super.getPath(edge)
            path = path.createSmoothedPath(200)
        }
        return path
    }

    /**
     * Gets the path of the edge cropped at the node border.
     * @param {IEdge} edge
     * @return {GeneralPath}
     */
    getPath(edge) {
        const path = this.$createPath(edge);
        // crop path at node border
        return this.cropPath(edge, IArrow.NONE, IArrow.NONE, path)
    }

    /**
     * Decorates a given path with bridges.
     * All work is delegated to the BridgeManager's addBridges() method.
     * @param {GeneralPath} path The path to decorate.
     * @param {IRenderContext} context The render context.
     * @return {GeneralPath} A copy of the given path with bridges.
     */
    createPathWithBridges(path, context) {
        const manager = this.getBridgeManager(context);
        // if there is a bridge manager registered: use it to add the bridges to the path
        return manager === null ? path : manager.addBridges(context, path, null)
    }

    /**
     * Gets an obstacle hash from the context.
     * The obstacle hash changes if any obstacle has changed on the entire graph.
     * The hash is used to avoid re-rendering the edge if nothing has changed.
     * This method gets the obstacle hash from the BridgeManager.
     * @param {IRenderContext} context The context to get the obstacle hash for.
     * @return {number} A hash value which represents the state of the obstacles.
     */
    getObstacleHash(context) {
        const manager = this.getBridgeManager(context);
        // get the BridgeManager from the context's lookup. If there is one
        // get a hash value which represents the current state of the obstacles.
        return manager === null ? 42 : manager.getObstacleHash(context)
    }

    /**
     * Queries the context's lookup for a BridgeManager instance.
     * @param {IRenderContext} context The context to get the BridgeManager from.
     * @return {BridgeManager} The BridgeManager for the given context instance or null
     */
    getBridgeManager(context) {
        if (!context) {
            return null
        }
        const bm = context.lookup(BridgeManager.$class);
        return bm instanceof BridgeManager ? bm : null
    }

    /**
     * Determines whether the visual representation of the edge has been hit at the given location.
     * @param {IEdge} edge
     * @param {Point} p
     * @param {IInputModeContext} inputModeContext
     * @return {boolean}
     */
    isHit(inputModeContext, p, edge) {
        if (
            (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) ||
            super.isHit(inputModeContext, p, edge)
        ) {
            const path = this.getPath(edge);
            return path && path.pathContains(p, inputModeContext.hitTestRadius + 1)
        } else {
            return false
        }
    }

    /**
     * Determines whether the edge visual is visible or not.
     * @param {IEdge} edge
     * @param {Rect} clip
     * @param {ICanvasContext} canvasContext
     * @return {boolean}
     */
    isVisible(canvasContext, clip, edge) {
        if (edge.sourcePort.owner === edge.targetPort.owner && edge.bends.size < 2) {
            // handle self-loops
            const spl = edge.sourcePort.locationParameter.model.getLocation(
                edge.sourcePort,
                edge.sourcePort.locationParameter
            );
            const tpl = edge.targetPort.locationParameter.model.getLocation(
                edge.targetPort,
                edge.targetPort.locationParameter
            );
            if (clip.contains(spl)) {
                return true
            }

            let outerX, outerY;
            if (edge.bends.size === 1) {
                const bendLocation = edge.bends.get(0).location;
                outerX = bendLocation.x;
                outerY = bendLocation.y
            } else {
                if (INode.isInstance(edge.sourcePort.owner)) {
                    outerX = edge.sourcePort.owner.layout.x - 20;
                    outerY = edge.sourcePort.owner.layout.y - 20
                } else {
                    const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
                        edge.sourcePort,
                        edge.sourcePort.locationParameter
                    );
                    outerX = sourcePortLocation.x - 20;
                    outerY = sourcePortLocation.y - 20
                }
            }

            // intersect the self-loop lines with the clip
            return (
                clip.intersectsLine(spl, new Point(outerX, spl.y)) ||
                clip.intersectsLine(new Point(outerX, spl.y), new Point(outerX, outerY)) ||
                clip.intersectsLine(new Point(outerX, outerY), new Point(tpl.x, outerY)) ||
                clip.intersectsLine(new Point(tpl.x, outerY), tpl)
            )
        }

        return super.isVisible(canvasContext, clip, edge)
    }

    /**
     * Helper method to let the svg marker be created by the {@link ISvgDefsCreator} implementation.
     * @return {ISvgDefsCreator}
     * @private
     */
    $createMarker() {
        if (this.$markerDefsSupport === null) {
            this.$markerDefsSupport = new MarkerDefsSupport();
            this.$markerDefsSupport.cssClass = this.cssClass;
        }
        return this.$markerDefsSupport
    }

    /**
     * This implementation of the look up provides a custom implementation of the
     * {@link IObstacleProvider} to support bridges.
     * @see Overrides {@link EdgeStyleBase#lookup}
     * @param {IEdge} edge
     * @param {Class} type
     * @return {Object}
     */
    lookup(edge, type) {
        if (type === IObstacleProvider.$class) {
            // Provide the own IObstacleProvider implementation
            return new BasicEdgeObstacleProvider(edge)
        } else {
            return super.lookup(edge, type)
        }
    }
}
