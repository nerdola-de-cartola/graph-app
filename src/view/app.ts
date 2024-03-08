import type Vertex from "src/graph/vertex";
import Circle from "./circle";
import { distance, drawPerimeter, linePointNearestPoint } from "./geometry";
import type { Point } from "./geometry";
import Line from "./line";
import VisualGraph from "./visual-graph";
import { bfs, dfs, dijkstra, search } from "../graph/graph-algorithms";

function randomHexadecimalColor() {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return `#${color}`
}

export enum Modes {
    moveVertex,
    newVertex,
    newEdge,
    deleteVertex,
    deleteEdge,
    connectedComponents,
    dfs,
    bfs,
    bipartiteGraph,
    dijkstra
}

export default class GraphApp {
    canvas: HTMLCanvasElement
    proportion: number
    ctx: CanvasRenderingContext2D
    graph: VisualGraph
    animationList: Animations
    mouse: Point
    isDragging: boolean
    touchVertex: Circle | undefined
    touchEdge: Line | undefined
    selectedVertex: Circle | undefined
    autoName: number;
    mode = Modes.moveVertex;
    textEl: HTMLElement
    text: string;
    cursor: string;

    constructor(canvas: HTMLCanvasElement, textEl: HTMLElement, proportion: number | undefined = 0.95) {
        this.canvas = canvas;
        const tmp = canvas.getContext("2d");
        if (!tmp) throw new Error('No context 2D in canvas');
        this.ctx = tmp;
        this.proportion = proportion;
        this.graph = new VisualGraph(this.ctx);
        this.animationList = new Animations();
        this.mouse = { x: 0, y: 0 };
        this.isDragging = false;
        this.touchVertex = undefined;
        this.touchEdge = undefined;
        this.selectedVertex = undefined;
        this.autoName = 0;
        this.mode = Modes.moveVertex;
        this.textEl = textEl;
        this.text = "";
        this.cursor = "default";
        this.canvas.addEventListener('onModeChange', (e) => this.onModeChange(e));
        this.canvas.onclick = (e) => this.mouseClick(e);
        this.canvas.onmousedown = (e) => this.mouseDown(e);
        this.canvas.onmouseup = (e) => this.mouseUp(e);
        this.canvas.onmousemove = (e) => this.mouseMove(e);
        addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        this.canvas.width = this.proportion * window.innerWidth;
        this.canvas.height = this.proportion * window.innerHeight;
        this.reDraw();
    }

    reDraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.graph.draw();
    }

    setText(str: string) {
        if (str === this.text) return;
        this.textEl.textContent = str;
    }

    setMode(newMode: number) {
        if (newMode === this.mode) return;

        const oldMode = this.mode;
        this.mode = newMode;
        this.canvas.dispatchEvent(
            new CustomEvent("onModeChange", {
                detail: {
                    oldMode,
                    newMode
                }
            })
        );
    }

    setCursor = (c: string) => {
        if (this.cursor === c) return;
        this.canvas.style.cursor = c;
    }

    onModeChange(e: any) {
        if (this.selectedVertex) {
            this.selectedVertex.changeColor(this.ctx);
            this.selectedVertex = undefined;
        }

        this.reDraw();

        switch (this.mode) {
            case Modes.moveVertex:
                this.setText("CLICK AND DRAG THE DESIRED VERTEX");
                break;

            case Modes.newVertex:
                this.setText("CLICK TO ADD NEW VERTEX");
                break;

            case Modes.newEdge:
                this.setText("SELECT FIRST VERTEX");
                break;

            case Modes.deleteVertex:
                this.setText("SELECT VERTEX TO REMOVE");
                break;

            case Modes.deleteEdge:
                this.setText("SELECT EDGE TO REMOVE");
                break;

            case Modes.connectedComponents:
                this.setText("EACH COLORED SQUARE REPRESENTS A CONNECTED COMPONENT");
                this.graph.connectedComponents().forEach(component =>
                    drawPerimeter(
                        this.ctx,
                        component.vertices as Circle[],
                        randomHexadecimalColor()
                    )
                );
                break;

            case Modes.dfs:
                this.setText("SELECT START VERTEX");
                break;

            case Modes.bfs:
                this.setText("SELECT START VERTEX");
                break;

            case Modes.bipartiteGraph:
                this.setText(this.graph.bipartiteGraph() ? "TRUE" : "FALSE");
                break;

            case Modes.dijkstra:
                this.setText("SELECT START VERTEX");
                break;
        }
    }

    drawPath(ctx: CanvasRenderingContext2D, f: any, startVertex: Vertex) {
        this.reDraw();

        const r = search({
            graph: this.graph,
            startVertex,
            searchAlgorithm: f
        });

        const path = r as Circle[];
        path.forEach((vertex: Circle, index: number) => {
            let animation = vertex.outline;

            if (index === path.length - 1) { //last animation
                animation = (ctx) => {
                    this.setText("SELECT START VERTEX");
                    vertex.outline(ctx);
                }
            }

            this.animationList.addAnimation({
                obj: vertex,
                animation,
                params: [ctx],
                duration: 1000
            })
        })
    }

    mouseMove(e: MouseEvent) {
        // @ts-ignore 
        const canvasObj = e.target.getBoundingClientRect();
        this.mouse.x = e.clientX - canvasObj.left;
        this.mouse.y = e.clientY - canvasObj.top;

        this.touchVertex = this.graph.vertices.find((circle) => {
            return distance(this.mouse, circle) <= circle.radius;
        })

        this.touchEdge = this.graph.edges.find(line => {
            const linePointNearestMouse = linePointNearestPoint(line, this.mouse);
            if (!linePointNearestMouse) return false;
            return distance(this.mouse, linePointNearestMouse) <= line.thickness;
        });

        if (this.touchVertex || this.touchEdge) {
            if (this.mode === Modes.moveVertex) {
                this.setCursor("grab");
            } else {
                this.setCursor("pointer");
            }
        } else {
            this.setCursor("auto");
        }

        if (this.isDragging) {
            if (!this.selectedVertex) return;

            this.selectedVertex.updatePosition(this.mouse.x, this.mouse.y);
            this.reDraw();
        }
    }

    mouseClick(e: MouseEvent) {
        // console.log(g)

        switch (this.mode) {
            case Modes.newVertex:
                this.graph.addVertex(new Circle(this.autoName.toString(), this.mouse.x, this.mouse.y))
                this.autoName++;
                break;

            case Modes.newEdge:
                if (!this.touchVertex) return;

                if (!this.selectedVertex) {
                    this.selectedVertex = this.touchVertex;
                    this.selectedVertex.changeColor(this.ctx, 'red');
                    this.setText("SELECT SECOND VERTEX");
                } else {
                    this.graph.addEdge(new Line(this.selectedVertex, this.touchVertex));
                    this.selectedVertex.changeColor(this.ctx);
                    this.selectedVertex = undefined;
                    this.setText("SELECT FIRST VERTEX");
                }

                break;

            case Modes.deleteVertex:
                if (!this.touchVertex) return;

                this.selectedVertex = this.touchVertex;
                this.graph.deleteVertex(this.selectedVertex);
                this.selectedVertex = undefined;
                this.reDraw();
                break;

            case Modes.deleteEdge:
                if (!this.touchEdge) return;

                this.graph.deleteEdge(this.touchEdge);
                this.reDraw();
                break;

            case Modes.dfs:
                if (!this.touchVertex) return;

                this.setText("RUNNING DFS");
                this.drawPath(this.ctx, dfs, this.touchVertex);
                break;

            case Modes.bfs:
                if (!this.touchVertex) return;

                this.setText("RUNNING BFS");
                this.drawPath(this.ctx, bfs, this.touchVertex);
                break;

            case Modes.dijkstra:
                if (!this.touchVertex) return;

                this.setText("RUNNING DIJKSTRA");

                this.reDraw();

                const animation = (vertex: Circle) => {
                    vertex.outline(this.ctx);

                    if(vertex.distance !== undefined) {
                        this.ctx.font = "16px Arial";
                        this.ctx.fillStyle = "red";
                        this.ctx.textBaseline = 'middle';
                        this.ctx.textAlign = "center";
                        this.ctx.fillText(
                            `d${vertex.name}=${vertex.distance}`,
                            vertex.x + vertex.radius + 16,
                            vertex.y - vertex.radius - 16
                        );
                    }
                } 

                const vf = (vertex: Vertex) => {
                    this.animationList.addAnimation({
                        obj: vertex,
                        animation: () => animation(vertex as Circle),
                        params: [],
                        duration: 1000
                    })
                }

                dijkstra(this.graph, this.touchVertex, vf);

                break;
        }
    }

    mouseDown(e: MouseEvent) {
        switch (this.mode) {
            case Modes.moveVertex:
                if (!this.touchVertex) return;

                this.selectedVertex = this.touchVertex;
                this.selectedVertex.changeColor(this.ctx, 'red')
                this.isDragging = true;
                break;
        }
    }

    mouseUp(e: MouseEvent) {
        if (this.isDragging) {
            this.isDragging = false;

            if (!this.selectedVertex) return;

            this.selectedVertex.changeColor(this.ctx)
            this.selectedVertex = undefined;
        }
    }
}

interface Animation {
    obj: any
    animation: any
    params: any
    duration: number
}

class Animations {
    list: Animation[]
    startTime: number
    currentDuration: number

    constructor() {
        this.list = [];
        this.startTime = performance.now();
        this.currentDuration = 0;
    }

    addAnimation(animation: Animation) {
        this.list.push(animation)

        if (this.list.length === 1) {
            requestAnimationFrame(() => this.animate())
        }
    }

    animate() {
        const now = performance.now();
        const elapsedTime = now - this.startTime;

        if (elapsedTime >= this.currentDuration) {
            const item = this.list.shift();

            if (!item) return;

            const { obj, animation, params, duration } = item;
            obj.animation = animation;
            obj.animation(...params);
            this.startTime = performance.now();
            this.currentDuration = duration;
        }

        requestAnimationFrame(() => this.animate());
    }
}
