import { Line } from "./line"
import { Vertex } from "./vertex"

const DEFAULT_COLOR = 'green';

export class Circle extends Vertex {
    x: number
    y: number
    radius: number
    fillColor: string
    lines: Line[]
  
    constructor(name: string, x: number, y: number, radius: number, fillColor: string = DEFAULT_COLOR) {
      super(name)
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.fillColor = fillColor;
      this.lines = [];
    }
  
    draw(ctx: any) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.fillColor;
      ctx.fill();
      ctx.closePath();
  
      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.textBaseline = 'middle';
      ctx.textAlign = "center";
      ctx.fillText(this.name, this.x, this.y + 2);
    }
  
    changeColor(ctx: any, color: string = DEFAULT_COLOR) {
      this.fillColor = color;
      this.draw(ctx)
    }
  
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    addLine(l: Line) {
      this.lines.push(l);
    }
  
    drawLines(ctx: any) {
      this.lines.forEach(line => line.draw(ctx));
    }
  
    deleteLine(lineToBeRemoved: Line) {
      this.lines = this.lines.filter(line => line !== lineToBeRemoved);
    }
  }