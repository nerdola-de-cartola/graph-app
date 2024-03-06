import Circle from "./circle";
import Line from "./line";

export class Point {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export function distance(a: Point, b: Point) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
}

export function lerpNumbers(x1: number, x2: number, t: number): number {
    return x1 * (1 - t) + x2 * t;
}

export function lerpPoints(a: Point, b: Point, t: number): Point {
    return {
        x: lerpNumbers(a.x, b.x, t),
        y: lerpNumbers(a.y, b.y, t),
    };
}

export function linePointNearestPoint(line: Line, a: Point): Point | undefined {
    const dx = line.vertex2.x - line.vertex1.x;
    const dy = line.vertex2.y - line.vertex1.y;

    const t = ((a.x - line.vertex1.x) * dx + (a.y - line.vertex1.y) * dy) / (dx * dx + dy * dy);

    if (t < 0 || t > 1) return undefined;

    return lerpPoints(line.vertex1, line.vertex2, t);
}

export function drawPerimeter(ctx: any, dots: Circle[], color: string) {
    const thickness = 3;
    // const color = randomHexadecimalColor();
  
    if (dots.length === 0) return;
  
    const minX = Math.min(...dots.map(dot => dot.x));
    const minY = Math.min(...dots.map(dot => dot.y));
    const maxX = Math.max(...dots.map(dot => dot.x));
    const maxY = Math.max(...dots.map(dot => dot.y));
  
    const radius = Math.max(...dots.map(dot => dot.radius)) + 10;
  
    const lt = new Circle('lt', minX - radius, minY - radius, 1);
    const rt = new Circle('rt', maxX + radius, minY - radius, 1);
    const rb = new Circle('rb', maxX + radius, maxY + radius, 1);
    const lb = new Circle('lb', minX - radius, maxY + radius, 1);
  
    const perimeterLines = [
      new Line(lt, rt, thickness, color),
      new Line(rt, rb, thickness, color),
      new Line(rb, lb, thickness, color),
      new Line(lb, lt, thickness, color),
    ]
  
    perimeterLines.forEach(line => line.draw(ctx));
  }