import Edge from "./edge";
import Vertex, { degree } from "./vertex"

export enum Colors {
    blue = "\x1b[36m",
    red = "\x1b[31m",
    standard = "\x1b[0m"
}


export default class Graph {
    vertices: Vertex[]
    edges: Edge[]

    constructor(v: Vertex[] = []) {
        this.vertices = v;
        this.edges = []
    }

    addVertex(newVertex: Vertex): boolean {
        if (this.vertices.some((vertex) =>
            vertex.name === newVertex.name
        )) {
            return false;
        }

        this.vertices.push(newVertex)

        return true;
    }

    deleteVertex(vertexToBeRemoved: Vertex) {
        this.vertices = this.vertices.filter((vertex) =>
            vertex !== vertexToBeRemoved
        )

        this.edges = this.edges.filter(edge =>
            edge.vertex1 !== vertexToBeRemoved &&
            edge.vertex2 !== vertexToBeRemoved
        );
    }

    addEdge(
        newEdge: Edge,
    ): Edge | undefined {
        if (newEdge.vertex1 === newEdge.vertex2) {
            return;
        }

        const existsFirstVertex = this.vertices.some((vertex) =>
            vertex === newEdge.vertex1
        );

        const existsSecondVertex = this.vertices.some((vertex) =>
            vertex === newEdge.vertex2
        );

        if (!existsFirstVertex || !existsSecondVertex) {
            return;
        }

        const repeatedEdge = this.edges.some(edge =>
            edge.vertex1 === newEdge.vertex1 &&
            edge.vertex2 === newEdge.vertex2
        )

        if (repeatedEdge) return;

        this.edges.push(newEdge);

        return newEdge;
    }

    deleteEdge(edgeToBeRemoved: Edge) {
        this.edges = this.edges.filter(edge =>
            edge !== edgeToBeRemoved
        );
    }

    incidentEdges(v: Vertex) {
        return this.edges.filter(e => e.vertex1 === v || e.vertex2 === v);
    }

    otherVertex(e: Edge, v: Vertex) {
        return e.vertex1 !== v ? e.vertex1 : e.vertex2;
    }

    degree(): number {
        const sum = this
            .vertices
            .reduce((accumulator, vertex) =>
                accumulator + degree(this, vertex), 0
            );

        return sum / 2;
    }

    degreeSequence(): number[] {
        return this.vertices.map(v => degree(this, v)).sort();
    }

    bipartiteGraph(): boolean {
        while (true) {
            const startVertex = this.vertices.find((vertex) => vertex.textColor === Colors.standard);

            if (!startVertex) break;

            const queue = [startVertex];

            while (queue.length > 0) {
                const vertex = queue.shift();

                if (vertex) {
                    if (vertex.textColor === Colors.standard) {
                        vertex.textColor = Colors.blue;
                    }

                    vertex.edges.forEach((edge) => {
                        if (edge.vertex.textColor !== Colors.standard)
                            return;

                        edge.vertex.textColor = vertex.textColor === Colors.blue
                            ? Colors.red
                            : Colors.blue;

                        queue.push(edge.vertex)
                    })
                }
            }
        }

        return this.vertices.every((vertex) =>
            vertex.edges.every((edge) =>
                edge.vertex.textColor !== vertex.textColor
            )
        );
    }

    connectedComponents(): Graph[] {
        this.clearColors();
        const connectedComponents: Graph[] = []

        while (true) {
            const graphComponent = new Graph();
            const startVertex = this.vertices.find((vertex) => vertex.textColor === Colors.standard);

            if (!startVertex) break;

            const queue = [startVertex];

            while (queue.length > 0) {
                const vertex = queue.shift();

                if (vertex) {
                    graphComponent.vertices.push(vertex)

                    if (vertex.textColor === Colors.standard) {
                        vertex.textColor = Colors.blue;
                    }

                    const edge = this.incidentEdges(vertex);

                    edge.forEach((edge) => {
                        const v = this.otherVertex(edge, vertex)

                        if (v.textColor !== Colors.standard)
                            return;

                        v.textColor = vertex.textColor === Colors.blue
                            ? Colors.red
                            : Colors.blue;

                        queue.push(v);
                    })
                }
            }

            connectedComponents.push(graphComponent);
        }

        return connectedComponents;
    }

    clearColors() {
        this.vertices.forEach((vertex) =>
            vertex.textColor = Colors.standard
        );
    }

    MinimalSpanningTree(algorithm: (Graph: Graph) => Graph) {
        return algorithm(this);
    }

    cleanDistances() {
        this.vertices.forEach((vertex) => {
            delete vertex.distance;
            delete vertex.previousVertex;
        });
    }
}
