import {BaseClass, ISvgDefsCreator} from "yfiles";
const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Manages the arrow markers as svg definitions.
 */
export class MarkerDefsSupport extends BaseClass(ISvgDefsCreator) {
    cssClass: string;

    constructor() {
        super();
        this.cssClass = ""
    }

    /**
     * Creates a defs-element.
     * @param {ICanvasContext} context
     * @return {SVGElement}
     */
    createDefsElement(context) {
        const markerElement = document.createElementNS(SVG_NS, "marker");
        markerElement.setAttribute("viewBox", "0 0 15 10");
        markerElement.setAttribute("refX", "2");
        markerElement.setAttribute("refY", "5");
        markerElement.setAttribute("markerWidth", "7");
        markerElement.setAttribute("markerHeight", "7");
        markerElement.setAttribute("orient", "auto");

        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", "M 0 0 L 15 5 L 0 10 z");
        path.setAttribute("fill", "#336699");

        if (this.cssClass) {
            path.setAttribute("class", this.cssClass + "-arrow")
        }

        markerElement.appendChild(path);
        return markerElement
    }

    /**
     * Checks if the specified node references the element represented by this object.
     * @param {ICanvasContext} context
     * @param {Node} node
     * @param {string} id
     * @return {boolean}
     **/
    accept(context, node, id) {
        if (node.nodeType !== 1) {
            return false
        }
        return ISvgDefsCreator.isAttributeReference(node, "marker-end", id)
    }

    /**
     * Updates the defs element with the current gradient data.
     * @param {ICanvasContext} context
     * @param {SVGElement} oldElement
     */
    updateDefsElement(context, oldElement) {
        // Nothing to do here
    }
}
