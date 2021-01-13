import {GeneralPath, NodeStyleBase, SvgVisual} from "yfiles";

export class CssNodeStyle extends NodeStyleBase {
    cssClass: string;

    constructor() {
        super();
        this.cssClass = ""
    }

    /**
     * Creates the visual for a node.
     * @param {INode} node
     * @param {IRenderContext} renderContext
     * @return {SvgVisual}
     */
    createVisual(renderContext, node) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const layout = node.layout;
        const nodeRounding = "2";
        rect.width.baseVal.value = layout.width;
        rect.height.baseVal.value = layout.height;
        rect.setAttribute("rx", nodeRounding);
        rect.setAttribute("ry", nodeRounding);
        rect.setAttribute("fill", "#FF8C00");
        rect.setAttribute("stroke", "#FFF");
        rect.setAttribute("stroke-width", "1px");

        if (this.cssClass) {
            rect.setAttribute("class", this.cssClass)
        }

        rect["data-renderDataCache"] = {
            x: layout.x,
            y: layout.y,
            width: layout.width,
            height: layout.height,
            cssClass: this.cssClass
        };

        rect.setAttribute("transform", "translate(" + layout.x + " " + layout.y + ")");

        return new SvgVisual(rect)
    }

    /**
     * Re-renders the node by updating the old visual for improved performance.
     * @param {INode} node
     * @param {IRenderContext} renderContext
     * @param {SvgVisual} oldVisual
     * @return {SvgVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
        const rect = oldVisual.svgElement;
        const cache = rect["data-renderDataCache"];
        if (!cache) {
            return this.createVisual(renderContext, node)
        }

        const layout = node.layout;
        const width = layout.width;
        const height = layout.height;

        if (cache.width !== width) {
            rect.width.baseVal.value = width;
            cache.width = width
        }
        if (cache.height !== height) {
            rect.height.baseVal.value = height;
            cache.height = height
        }
        if (cache.x !== layout.x || cache.y !== layout.y) {
            rect.transform.baseVal.getItem(0).setTranslate(layout.x, layout.y);
            cache.x = layout.x;
            cache.y = layout.y
        }

        if (cache.cssClass !== this.cssClass) {
            if (this.cssClass) {
                rect.setAttribute("class", this.cssClass)
            } else {
                rect.removeAttribute("class")
            }
            cache.cssClass = this.cssClass
        }

        return oldVisual
    }

    /**
     * Gets the outline of the node, a round rect in this case.
     * @param {INode} node
     * @return {GeneralPath}
     */
    getOutline(node) {
        const path = new GeneralPath();
        path.appendRectangle(node.layout, false);
        return path
    }

    /**
     * Hit test which considers HitTestRadius specified in CanvasContext.
     * @param {IInputModeContext} inputModeContext
     * @param {Point} p
     * @param {INode} node
     * @return {boolean} True if p is inside node.
     */
    isHit(inputModeContext, p, node) {
        return super.isHit(inputModeContext, p, node)
    }

    /**
     * Exact geometric check whether a point p lies inside the node.
     * @param {INode} node
     * @param {Point} point
     * @return {boolean}
     */
    isInside(node, point) {
        return super.isInside(node, point)
    }
}
