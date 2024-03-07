import type Circle from "./circle";
import Graph from "../graph/graph";
import type Line from "./line";

export default class VisualGraph extends Graph {
  vertices: Circle[];
  edges: Line[];
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, circles: Circle[] = []) {
    super();
    this.ctx = ctx;
    this.vertices = circles;
    this.edges = []
  }

  draw() {
    if(!this.ctx) return;

    this.edges.forEach(e => e.draw(this.ctx));
    this.vertices.forEach(v => v.draw(this.ctx));
  }

  addVertex(newVertex: Circle): boolean {
    this.ctx && newVertex.draw(this.ctx);
    return super.addVertex(newVertex);
  }

  addEdge(newEdge: Line) {
    const e = super.addEdge(newEdge) as Line;
    e && this.ctx && e.draw(this.ctx);
    return e;
  }
}