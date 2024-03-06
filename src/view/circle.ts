import Line from "./line"
import Vertex from "../graph/vertex"

const DEFAULT_COLOR = 'green';

export default class Circle extends Vertex {
  x: number
  y: number
  radius: number
  fillColor: string

  constructor(name: string, x: number, y: number, radius: number = 18, fillColor: string = DEFAULT_COLOR) {
    super(name)
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;
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

  outline(ctx: any, color: string = 'red') {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius+10, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }
}