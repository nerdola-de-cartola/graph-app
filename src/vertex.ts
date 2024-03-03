import Edge from "./edge"
import { Colors } from "./graph"

export default class Vertex {
    name: string
    edges: Edge[]
    textColor: Colors
    used?: boolean
    component?: Vertex
    distance?: number
    previousVertex?: Vertex | null

    constructor(name: string) {
        this.name = name
        this.edges = []
        this.textColor = Colors.standard
    }

    degree(): number {
        return this.edges.length;
    }

    printVertex() {
        console.log(`${this.textColor}${this.name}${Colors.standard} => [`)
    
        this.edges.forEach((edge, edgeIndex) => {
            if (edgeIndex === 0) {
                process.stdout.write("   ");
            }
            else if (edgeIndex < this.edges.length) {
                process.stdout.write(", ");
            }
    
            process.stdout.write(`${edge.vertex.textColor}${edge.vertex.name}(${edge.weight})${Colors.standard}`);
        })
    
        console.log("")
        console.log("]")
    }
}