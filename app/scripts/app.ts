import "yfiles/yfiles.css";

import {BalloonLayout, CircularLayout, Class, Color, DefaultLabelStyle, EdgeSegmentLabelModel, EdgeSides, Fill, GraphComponent, GraphViewerInputMode, HierarchicLayout, IGraph, INode, InteriorLabelModel, LayoutExecutor, License, RadialGradient, RadialLayout, Rect, Size, SolidColorFill, TextRenderSupport} from "yfiles"
import faker from "faker";
import RandomGraph from "./randomGraph";
import {CssNodeStyle} from "./cssNodeStyle";
import {CssEdgeStyle} from "./cssEdgeStyle";

License.value ={
    "company": "You",
    "date": "12/12/2324",
    "distribution": true,
    "domains": [
        "*"
    ],
    "fileSystemAllowed": true,
    "licensefileversion": "1.1",
    "localhost": true,
    "oobAllowed": true,
    "package": "complete",
    "product": "yFiles for HTML",
    "projectname": "My amazing stuff",
    "subscription": "12/12/2324",
    "type": "project",
    "version": "2.3",
    "key": "the-key"
};

// We need to load the yfiles/view-layout-bridge module explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for 'morphLayout' in this demo.
Class.ensure(LayoutExecutor);

class App {
    private graph: IGraph;

    initialize() {
        const graphComponent: GraphComponent = new GraphComponent("#graphComponent");

        const cssNodeStyle = new CssNodeStyle();
        cssNodeStyle.cssClass = "css-node-style";
        const cssEdgeStyle = new CssEdgeStyle();
        cssEdgeStyle.showTargetArrows = true;
        cssEdgeStyle.cssClass = "css-edge-style";
        const labelStyle = new DefaultLabelStyle({
            textFill: "white",
            insets: [3, 5, 3, 5],
            font:"Roboto",
            textSize:15
            // backgroundFill: 'rgba(60, 66, 83, 0.5)'
        });
        this.graph = graphComponent.graph;
        this.graph.nodeDefaults.style = cssNodeStyle;
        this.graph.edgeDefaults.style = cssEdgeStyle;
        this.graph.nodeDefaults.labels.style = labelStyle;
        this.graph.edgeDefaults.labels.style = labelStyle;


        graphComponent.inputMode = new GraphViewerInputMode();
        this.createRandomGraph();

        // execute a layout
        graphComponent.morphLayout(new RadialLayout());

    }

    constructor() {
        this.initialize();
    }

    createRandomGraph() {
        const raw = RandomGraph.BarabasiAlbert(50);
        const dic = {};
        for (let i = 0; i < raw.nodes.length; i++) {
            const item = raw.nodes[i];
            const node: INode = this.graph.createNode();
            dic[i] = node;
            const tag = {
                id: i,
                label: faker.name.findName(),
                sublabel: faker.address.county()
            }
            node.tag = tag;
            const size1 = TextRenderSupport.measureText(tag.label, this.graph.getLabelDefaults(node).style["font"]);
            const size2 = TextRenderSupport.measureText(tag.sublabel, this.graph.getLabelDefaults(node).style["font"]);
            this.graph.setNodeLayout(node, new Rect(node.layout.toPoint(), new Size(Math.max(size1.width, size2.width) + 10, Math.max(size1.height, size2.height) + 30)));
            this.graph.addLabel({
                owner: node,
                text: tag.label,
                style: new DefaultLabelStyle({textFill: Fill.WHITE, insets: 5}),
                layoutParameter: InteriorLabelModel.CENTER
            });
            this.graph.addLabel({
                owner: node,
                text: tag.sublabel,
                style: new DefaultLabelStyle({
                    textFill: new SolidColorFill(new Color(45, 83, 128, 250)),
                    textSize: 10, insets: [7, 0, 3, 0]
                }),
                layoutParameter: InteriorLabelModel.SOUTH
            });
        }
        for (let i = 0; i < raw.edges.length; i++) {
            const item = raw.edges[i];
            const edge = this.graph.createEdge(dic[item.source], dic[item.target]);

            // const labelModel = new EdgeSegmentLabelModel({
            //     autoRotation: false,
            //     offset: 10
            // });
            // this.graph.addLabel(edge, `${faker.random.number(100)}%`, labelModel.createParameterFromSource(0, 0.0, EdgeSides.LEFT_OF_EDGE))
        }
    }
}

new App();
