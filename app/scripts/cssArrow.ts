import {BaseClass, GeneralPath, IArrow, IBoundsProvider, IVisualCreator, Point, Rect, SvgVisual} from "yfiles";

export class CssArrow extends BaseClass(IArrow, IVisualCreator, IBoundsProvider) {
    cssClass: string;
    private $anchor: null;
    private $direction: null;
    private $arrowFigure: GeneralPath;

    constructor() {
        super();

        this.cssClass = "css-arrow";

        this.$anchor = null;
        this.$direction = null;
        this.$arrowFigure = null
    }

    /**
     * Returns the length of the arrow, i.e. the distance from the arrow's tip to
     * the position where the visual representation of the edge's path should begin.
     * @see Specified by {@link IArrow#length}.
     * @return {number}
     */
    get length() {
        return 5.5
    }

    /**
     * Gets the cropping length associated with this instance.
     * This value is used by edge styles to let the
     * edge appear to end shortly before its actual target.
     * @see Specified by {@link IArrow#cropLength}.
     * @return {number}
     */
    get cropLength() {
        return 1
    }

    /**
     * Returns a configured visual creator.
     * @param {IEdge} edge
     * @param {boolean} atSource
     * @param {Point} anchor
     * @param {Point} direction
     * @return {CssArrow}
     */
    getVisualCreator(edge, atSource, anchor, direction) {
        this.$anchor = anchor;
        this.$direction = direction;
        return this
    }

    /**
     * Gets an {@link IBoundsProvider} implementation that can yield
     * this arrow's bounds if painted at the given location using the
     * given direction for the given edge.
     * @param {IEdge} edge the edge this arrow belongs to
     * @param {boolean} atSource whether this will be the source arrow
     * @param {Point} anchor the anchor point for the tip of the arrow
     * @param {Point} direction the direction the arrow is pointing in
     * @return {CssArrow}
     * an implementation of the {@link IBoundsProvider} interface that can
     * subsequently be used to query the bounds. Clients will always call
     * this method before using the implementation and may not cache the instance returned.
     * This allows for applying the flyweight design pattern to implementations.
     * @see Specified by {@link IArrow#getBoundsProvider}.
     */
    getBoundsProvider(edge, atSource, anchor, direction) {
        this.$anchor = anchor;
        this.$direction = direction;
        return this
    }

    /**
     * This method is called by the framework to create a visual
     * that will be included into the {@link IRenderContext}.
     * @param {IRenderContext} ctx The context that describes where the visual will be used.
     * @return {Visual}
     * The arrow visual to include in the canvas object visual tree./>.
     * @see {@link DemoArrow#updateVisual}
     * @see Specified by {@link IVisualCreator#createVisual}.
     */
    createVisual(ctx) {
        // Create a new path to draw the arrow
        if (this.$arrowFigure === null) {
            this.$arrowFigure = new GeneralPath();
            this.$arrowFigure.moveTo(new Point(-7.5, -2.5));
            this.$arrowFigure.lineTo(new Point(0, 0));
            this.$arrowFigure.lineTo(new Point(-7.5, 2.5));
            this.$arrowFigure.close()
        }

        const path = window.document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", this.$arrowFigure.createSvgPathData());
        path.setAttribute("fill", "#336699");
        if (this.cssClass) {
            path.setAttribute("class", this.cssClass)
        }

        // Rotate arrow and move it to correct position
        path.setAttribute(
            "transform",
            // @ts-ignore
            `matrix(${this.$direction.x} ${this.$direction.y} ${-this.$direction.y} ${this.$direction.x} ${this.$anchor.x} ${this.$anchor.y})`
        );

        path["data-renderDataCache"] = {
            direction: this.$direction,
            anchor: this.$anchor
        };

        return new SvgVisual(path)
    }

    /**
     * This method updates or replaces a previously created visual for inclusion
     * in the {@link IRenderContext}.
     * The {@link CanvasComponent} uses this method to give implementations a chance to
     * update an existing Visual that has previously been created by the same instance during a call
     * to {@link CssArrow#createVisual}. Implementations may update the <code>oldVisual</code>
     * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
     * @param {IRenderContext} ctx The context that describes where the visual will be used in.
     * @param {Visual} oldVisual The visual instance that had been returned the last time the
     *   {@link CssArrow#createVisual} method was called on this instance.
     * @return {Visual}
     *  <code>oldVisual</code>, if this instance modified the visual, or a new visual that should replace the
     * existing one in the canvas object visual tree.
     * @see {@link DemoArrow#createVisual}
     * @see {@link ICanvasObjectDescriptor}
     * @see {@link CanvasComponent}
     * @see Specified by {@link IVisualCreator#updateVisual}.
     */
    updateVisual(ctx, oldVisual) {
        const path = oldVisual.svgElement;
        const cache = path["data-renderDataCache"];

        if (this.$direction !== cache.direction || this.$anchor !== cache.anchor) {
            path.setAttribute(
                "transform",
                // @ts-ignore
                `matrix(${this.$direction.x} ${this.$direction.y} ${-this.$direction.y} ${this.$direction.x} ${this.$anchor.x} ${this.$anchor.y})`
            )
        }

        return oldVisual
    }

    /**
     * Returns the bounds of the arrow for the current flyweight configuration.
     * @see Specified by {@link IBoundsProvider#getBounds}.
     * @param {IRenderContext} ctx
     * @return {Rect}
     */
    getBounds(ctx) {
        // @ts-ignore
        return new Rect(this.$anchor.x - 8, this.$anchor.y - 8, 32, 32)
    }
}
