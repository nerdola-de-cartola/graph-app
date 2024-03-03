import { Vertex } from "./vertex"

export enum Colors {
    blue = "\x1b[36m",
    red = "\x1b[31m",
    standard = "\x1b[0m"
}

enum EdgeType {
    tree,
    direct,
    return,
    cross
}

export interface Edge {
    vertex: Vertex
    weight: number
    used?: boolean
    type?: EdgeType
}

export interface ExplicityEdge {
    vertex1: Vertex
    vertex2: Vertex
    weight: number
}

export class Graph {
    vertices: Vertex[]

    constructor(v: Vertex[] = []) {
        this.vertices = v;
    }

    deleteVertex(nameToBeRemoved: string) {
        this.vertices = this.vertices.filter((vertex) =>
            vertex.name !== nameToBeRemoved
        )
    
        this.vertices.forEach((vertex) => {
            vertex.edges = vertex.edges.filter((edge) =>
                edge.vertex.name !== nameToBeRemoved
            )
        })
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

    degree(): number {
        const sum = this
            .vertices
            .reduce((accumulator, vertex) =>
                accumulator + vertex.degree(), 0
            );
    
        return sum / 2;
    }

    addEdge(
        firstVertex: string,
        secondVertex: string,
        weight: number
    ): Edge | undefined {
        if (firstVertex === secondVertex) {
            return undefined;
        }
    
        const existsFirstVertex = this.vertices.some((vertex) =>
            vertex.name === firstVertex
        );
    
        const existsSecondVertex = this.vertices.some((vertex) =>
            vertex.name === secondVertex
        );
    
        if (!existsFirstVertex || !existsSecondVertex) {
            return undefined;
        }
    
        let result = undefined;
    
        this.vertices.forEach((vertex) => {
            if (vertex.name === firstVertex) {
                const repeatedEdge = vertex.edges.some((edge) =>
                    edge.vertex.name === secondVertex
                )
    
                if (repeatedEdge) {
                    result = undefined;
                    return;
                }
    
                const target = this.vertices.find((vertex) => vertex.name === secondVertex);
    
                if (target) {
                    const edge = {
                        vertex: target,
                        weight
                    }
                    vertex.edges.push(edge)
                    result = edge;
                }
            } else if (vertex.name === secondVertex) {
                const repeatedEdge = vertex.edges.some((edge) =>
                    edge.vertex.name === firstVertex
                )
    
                if (repeatedEdge) {
                    result = undefined;
                    return;
                }
    
                const target = this.vertices.find((vertex) => vertex.name === firstVertex);
    
                if (target) {
                    const edge = {
                        vertex: target,
                        weight
                    };
    
                    vertex.edges.push(edge)
    
                    result = edge;
                }
            }
        })
    
        return result;
    }
    
    deleteEdge(edgeToBeRemoved: Edge) {
        for(const vertex of this.vertices) {
    
            for (let index = 0; index < vertex.edges.length; index++) {
                const edge = vertex.edges[index];
    
                if(edge === edgeToBeRemoved) {
                    edge.vertex.edges = edge.vertex.edges.filter(e => e.vertex !== vertex)
                    vertex.edges.splice(index, 1);
                }
            }
        }
    }

    degreeSequence(): number[] {
        return this
            .vertices
            .reduce((accumulator: number[], vertex) =>
                [...accumulator, vertex.edges.length], []
            )
            .sort();
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

    printGraph() {
        this.vertices.forEach((vertex) => vertex.printVertex())
    }

    connectedComponents(): Graph[] {
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

    totalWeight(): number {
        let sum = 0
    
        for (let v = 0; v < this.vertices.length; v++) {
            for (let e = 0; e < this.vertices[v].edges.length; e++) {
                sum += this.vertices[v].edges[e].weight;
            }
        }
    
        return sum / 2;
    }

    cleanDistances() {
        this.vertices.forEach((vertex) => {
            delete vertex.distance;
            delete vertex.previousVertex;
        });
    }
}

let stdout = '';
const process: any = {
    stdout: {}
};

process.stdout.write = function (s: string) {
    stdout += s;
    for (var i; -1 !== (i = stdout.indexOf('\n')); stdout = stdout.slice(i + 1))
        console.log(stdout.slice(0, i));
};
