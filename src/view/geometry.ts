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