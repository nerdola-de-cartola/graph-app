import Graph, { Colors } from "./graph";
import Vertex from "./vertex";

/*
export function Kruskal(graph: Graph): Graph {
    const mst = new Graph();
    
    const availableEdges: ExplicityEdge[] = [];
    
    graph.vertices.forEach((vertex) => {
        mst.addVertex(vertex)
        
        vertex.edges.forEach((edge) => {
            
            if (edge.used) return;
            
            vertex.component = vertex;
            edge.vertex.component = edge.vertex;
            
            availableEdges.push(new ExplicityEdge(vertex, edge.vertex, edge.weight));
            
            const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === vertex.name);
            
            if (!edge2) throw new Error("Aresta inexistente");
            
            edge.used = true;
            edge2.used = true;
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
            
            mst.addEdge(vertex1, vertex2, weight);

        joinComponents(vertex1.component, vertex2.component)
    }
    
    graph.vertices.forEach((vertex) => {
        vertex.edges.forEach((edge) => {
            delete edge.used;
        })
    })
    
    return mst;
}

export function Prim(graph: Graph): Graph {
    const mst = new Graph();

    const availableEdges: ExplicityEdge[] = [];
    
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
    
    const addEdgeToAvailableEdges = (currentVertex: Vertex, edge: Edge) => {
        
        if (edge.used) return;
        
        availableEdges.push(new ExplicityEdge(currentVertex, edge.vertex, edge.weight));
        
        const edge2 = edge.vertex.edges.find((edge) => edge.vertex.name === currentVertex.name);
        
        if (!edge2) throw new Error("Aresta inexistente");
        
        edge.used = true;
        edge2.used = true;
    }
    
    for (let i = 0; i < graph.vertices.length - 1; i++) {
        // currentVertex.edges.forEach(edge => f(currentVertex, e))
        for (let edge of currentVertex.edges) {
            addEdgeToAvailableEdges(currentVertex, edge);
        }
        
        availableEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);
        
        const { vertex1, vertex2, weight } = findNextVertices();
        
        mst.addVertex(vertex1);
        mst.addVertex(vertex2);
        mst.addEdge(vertex1, vertex2, weight);
        
        currentVertex = vertex1.used ? vertex2 : vertex1;
        
        vertex1.used = true;
        vertex2.used = true;
    }
    
    graph.vertices.forEach((vertex) => {
        delete vertex.used;
        
        vertex.edges.forEach((edge) => {
            delete edge.used;
        })
    })
    
    return mst;

    export function dijkstra(graph: Graph, startVertex: Vertex) {
    graph.vertices.forEach((vertex) => {
        vertex.distance = Infinity;
        vertex.previousVertex = null;
    })

    startVertex.distance = 0;

    graph.clearColors();

    const queue: Vertex[] = [startVertex];

    while (true) {
        const vertex = queue.shift();

        if (!vertex) break;

        vertex.textColor = Colors.blue;

        vertex.edges.forEach(edge => {
            const nextVertex = edge.vertex;

            if (nextVertex.textColor === Colors.blue) return;

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
}
*/

interface SearchAlgorithmType {
    graph: Graph,
    vertex: Vertex,
    stopFunction?: StopFunction,
    visitFunction?: VisitFunction
}

interface SearchType {
    graph: Graph,
    searchAlgorithm: (s: SearchAlgorithmType) => Vertex | undefined
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
    if (graph.vertices.length === 0) return

    if (!startVertex) {
        startVertex = graph.vertices[0];
    }

    graph.clearColors();
    return searchAlgorithm({ graph, vertex: startVertex, stopFunction, visitFunction });
}

export function dfs({
    graph,
    vertex,
    stopFunction = defaultStopFunction,
    visitFunction = defaultVisitFunction
}: SearchAlgorithmType): Vertex | undefined {
    visitFunction(vertex);
    vertex.textColor = Colors.blue

    if (stopFunction(vertex)) {
        return vertex;
    }

    const edges = graph.incidentEdges(vertex);
    let result = undefined;

    for (let edge of edges) {
        const nextVertex = graph.otherVertex(edge, vertex);
        if (nextVertex.textColor === Colors.blue) continue;
        result = dfs({ graph, vertex: nextVertex, stopFunction, visitFunction });
        if (result) return result;
    }

    return;
}

export function bfs({
    graph,
    vertex,
    stopFunction = defaultStopFunction,
    visitFunction = defaultVisitFunction
}: SearchAlgorithmType): Vertex | undefined {
    const queue: Vertex[] = [];

    const recursiveFunction = (v: Vertex): Vertex | undefined => {
        visitFunction(v);
        v.textColor = Colors.blue;

        if (stopFunction(v)) {
            return v;
        }

        const edges = graph.incidentEdges(v);

        for (const edge of edges) {
            const searchVertex = graph.otherVertex(edge, v);

            if (searchVertex.textColor === Colors.standard) {
                queue.push(searchVertex);
                searchVertex.textColor = Colors.red;
            }
        }

        const nextVertex = queue.shift();

        return nextVertex ? recursiveFunction(nextVertex) : undefined;
    }

    return recursiveFunction(vertex);
}