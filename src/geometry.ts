interface Point {
    x: number
    y: number
}

interface Line {
    circle1: Point
    circle2: Point
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

export function linePointNearestPoint(line: Line, x: number, y: number): Point | undefined {
    const dx = line.circle2.x - line.circle1.x;
    const dy = line.circle2.y - line.circle1.y;

    const t = ((x - line.circle1.x) * dx + (y - line.circle1.y) * dy) / (dx * dx + dy * dy);

    if (t < 0 || t > 1) return undefined;

    return lerpPoints(line.circle1, line.circle2, t);
}