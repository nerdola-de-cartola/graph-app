import Vertex from "./vertex"

enum EdgeType {
    tree,
    direct,
    return,
    cross
}

export default class Edge {
    vertex: Vertex
    weight: number
    used?: boolean
    type?: EdgeType

    constructor(v: Vertex, w: number = 1) {
        this.vertex = v;
        this.weight = w;
    }

    relatedEdge() {
        return this.vertex.edges.find(edge =>
            edge.vertex.edges.some(edge2 =>
                edge2 === this
            )
        );

    }

    delete() {
        const relatedEdge = this.relatedEdge();

        if(!relatedEdge) throw new Error(`could't find related edge of ${this}`)

        relatedEdge.vertex.edges = relatedEdge.vertex.edges.filter((edge) => edge !== this);
        this.vertex.edges = this.vertex.edges.filter((edge) => edge !== relatedEdge);
    }
}

export class ExplicityEdge extends Edge {
    vertex1: Vertex
    vertex2: Vertex

    constructor(v1: Vertex, v2: Vertex, w: number = 1) {
        super(v1, w);
        this.vertex1 = this.vertex;
        this.vertex2 = v2;
    }

    delete() {
        throw new Error('delete not implemented yet')
    }
}
