import Graph, { Colors } from "./graph"

export default class Vertex {
    name: string
    textColor: Colors
    used?: boolean
    component?: Vertex
    distance?: number
    previousVertex?: Vertex | null

    constructor(name: string) {
        this.name = name
        this.textColor = Colors.standard
    }
}

export function degree(g: Graph, v: Vertex): number {
    let d = 0;

    for(let edge of g.edges) {
        if(
            edge.vertex1 === v ||
            edge.vertex2 === v 
        ) {
            d++;
        }
    }

    return d;
}