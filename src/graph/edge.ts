import type Vertex from "./vertex"

export default class Edge {
    vertex1: Vertex
    vertex2: Vertex
    weight: number
    used?: boolean

    constructor(v1: Vertex, v2: Vertex, w: number = 1) {
        this.vertex1 = v1;
        this.vertex2 = v2;
        this.weight = w
    }
}
