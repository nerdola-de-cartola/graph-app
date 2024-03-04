import Circle from "./circle";
import Graph from "./graph";
import Line from "./line";

export default class VisualGraph extends Graph {
  vertices: Circle[];
  edges: Line[];
  ctx: any;

  constructor(ctx: any = undefined, circles: Circle[] = []) {
    super();
    this.ctx = ctx;
    this.vertices = circles;
    this.edges = []
  }

  draw() {
    if(!this.ctx) return;

    this.vertices.forEach(v => v.draw(this.ctx));
    this.edges.forEach(e => e.draw(this.ctx));
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