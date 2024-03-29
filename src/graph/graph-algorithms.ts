import Edge from "./edge";
import Graph, { Colors } from "./graph";
import type Vertex from "./vertex";

export function kruskal(graph: Graph): Graph {
    const mst = new Graph();

    const availableEdges: Edge[] = [];

    graph.vertices.forEach((vertex) => {
        mst.addVertex(vertex)

        graph.incidentEdges(vertex).forEach((edge) => {
            const otherVertex = graph.otherVertex(edge, vertex);

            if (edge.used) return;

            vertex.component = vertex;
            otherVertex.component = otherVertex;
            availableEdges.push(new Edge(vertex, otherVertex, edge.weight));
            edge.used = true;
        })
    })

    availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

    const findNextVertices = () => {
        while (availableEdges.length) {
            const explicityEdge = availableEdges[0];

            availableEdges.shift();

            if (!explicityEdge.vertex1.component || !explicityEdge.vertex2.component) {
                throw new Error("Could not find next vertices");
            }

            if (explicityEdge.vertex1.component.name !== explicityEdge.vertex2.component.name) {
                return explicityEdge;
            }
        }

        throw new Error("Could not find next vertices");
    }

    const joinComponents = (
        component1: Vertex | undefined,
        component2: Vertex | undefined
    ) => {
        if (!component1 || !component2) {
            throw new Error("Could not join components")
        }

        availableEdges.forEach(({ vertex1, vertex2 }) => {
            if (!vertex1.component || !vertex2.component) {
                throw new Error("Could not join components")
            }

            if (vertex1.component.name === component2.name) {
                vertex1.component = component1
            }

            if (vertex2.component.name === component2.name) {
                vertex2.component = component1
            }
        })
    }

    for (let i = 0; i < graph.vertices.length - 1; i++) {
        const { vertex1, vertex2, weight } = findNextVertices();

        mst.addEdge(new Edge(vertex1, vertex2, weight));

        joinComponents(vertex1.component, vertex2.component)
    }

    graph.edges.forEach((edge) => {
        delete edge.used;
    })

    return mst;
}


export function prim(graph: Graph): Graph {
    const mst = new Graph();

    const availableEdges: Edge[] = [];

    const findNextVertices = () => {
        while (availableEdges.length) {
            const explicityEdge = availableEdges[0];

            availableEdges.shift();

            if (!explicityEdge.vertex1.used || !explicityEdge.vertex2.used) {
                return explicityEdge;
            }
        }

        throw new Error("Could not find next vertices");
    }

    let currentVertex = graph.vertices[0];
    currentVertex.used = true;

    const addEdgeToAvailableEdges = (edge: Edge) => {
        if (edge.used) return;

        availableEdges.push(new Edge(edge.vertex1, edge.vertex2, edge.weight));
        edge.used;
        /*
        availableEdges.push(new ExplicityEdge(currentVertex, edge.vertex, edge.weight));
        
        const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === currentVertex.name);
        
        if (!edge2) throw new Error("Aresta inexistente");
        
        edge.used = true;
        edge2.used = true;
        */
    }

    for (let i = 0; i < graph.vertices.length - 1; i++) {

        const edges = graph.incidentEdges(currentVertex);
        for (const edge of edges) {
            addEdgeToAvailableEdges(edge);
        }

        availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

        const { vertex1, vertex2, weight } = findNextVertices();

        mst.addVertex(vertex1);
        mst.addVertex(vertex2);
        mst.addEdge(new Edge(vertex1, vertex2, weight));

        currentVertex = vertex1.used ? vertex2 : vertex1;

        vertex1.used = true;
        vertex2.used = true;
    }

    graph.vertices.forEach((vertex) => {
        delete vertex.used;
    })

    graph.edges.forEach((edge) => {
        delete edge.used;
    })

    return mst;
}

export function dijkstra(
    graph: Graph,
    startVertex: Vertex,
    visitFunction: VisitFunction = defaultVisitFunction
) {
    graph.clearColors();

    graph.vertices.forEach((vertex) => {
        vertex.distance = Infinity;
        vertex.previousVertex = null;
    })

    startVertex.distance = 0;

    const queue: Vertex[] = [startVertex];

    while (true) {
        const vertex = queue.shift();

        if (!vertex) break;

        visitFunction(vertex);

        vertex.textColor = Colors.blue;

        graph.incidentEdges(vertex).forEach(edge => {
            const nextVertex = graph.otherVertex(edge, vertex);

            if (nextVertex.textColor === Colors.blue) return;
            // console.log(nextVertex);

            if (vertex.distance === undefined || nextVertex.distance === undefined) {
                throw new Error("Could not find distance");
            }

            if (nextVertex.distance > vertex.distance + edge.weight) {
                nextVertex.distance = vertex.distance + edge.weight
                nextVertex.previousVertex = vertex;
            }

            if (nextVertex.textColor === Colors.standard) {
                nextVertex.textColor = Colors.red;
                queue.push(nextVertex);
            }
        });
    }
}


interface SearchAlgorithmType {
    graph: Graph,
    startVertex: Vertex,
    stopFunction?: StopFunction,
    visitFunction?: VisitFunction
}

interface SearchType {
    graph: Graph,
    searchAlgorithm: (s: SearchAlgorithmType) => Vertex[]
    startVertex?: Vertex,
    stopFunction?: StopFunction,
    visitFunction?: VisitFunction
}

type StopFunction = (v: Vertex) => boolean;
type VisitFunction = (v: Vertex) => unknown;

const defaultStopFunction = () => false;
const defaultVisitFunction = () => undefined;

export function search({
    graph,
    startVertex,
    searchAlgorithm,
    stopFunction = defaultStopFunction,
    visitFunction = defaultVisitFunction
}: SearchType) {
    if (!startVertex) {
        startVertex = graph.vertices[0];
    }

    graph.clearColors();
    return searchAlgorithm({ graph, startVertex, stopFunction, visitFunction });
}

export function dfs({
    graph,
    startVertex,
    stopFunction = defaultStopFunction,
    visitFunction = defaultVisitFunction
}: SearchAlgorithmType): Vertex[] {
    const path: Vertex[] = [];

    const recursiveFunction = (vertex: Vertex): Vertex | undefined => {
        visitFunction(vertex);
        path.push(vertex);
        vertex.textColor = Colors.blue

        if (stopFunction(vertex)) {
            return vertex;
        }

        const neighbors = graph.neighbors(vertex);

        let result = undefined;
        for (const nextVertex of neighbors) {
            if (nextVertex.textColor === Colors.blue) continue;

            result = recursiveFunction(nextVertex);
            if (result) return result;
        }

    }

    recursiveFunction(startVertex);

    return path;
}

export function bfs({
    graph,
    startVertex,
    stopFunction = defaultStopFunction,
    visitFunction = defaultVisitFunction
}: SearchAlgorithmType): Vertex[] {
    const queue: Vertex[] = [];
    const path: Vertex[] = [];

    const recursiveFunction = (vertex: Vertex): Vertex | undefined => {
        visitFunction(vertex);
        path.push(vertex)
        vertex.textColor = Colors.blue;

        if (stopFunction(vertex)) {
            return vertex;
        }

        graph.neighbors(vertex).forEach(neighbor => {
            if (neighbor.textColor !== Colors.standard) return;

            queue.push(neighbor);
            neighbor.textColor = Colors.red;

        });

        const nextVertex = queue.shift();
        return nextVertex ? recursiveFunction(nextVertex) : undefined;
    }

    recursiveFunction(startVertex);

    return path;
}