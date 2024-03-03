import Circle from "./circle"
import { ExplicityEdge } from "./edge";

const DEFAULT_COLOR = 'black';

export default class Line extends ExplicityEdge {
    circle1: Circle
    circle2: Circle
    thickness: number
    color: string
  
    constructor(c1: Circle, c2: Circle, thickness: number, color: string = DEFAULT_COLOR) {
      super(c1, c2);
      this.circle1 = c1;
      this.circle2 = c2;
      this.thickness = thickness;
      this.color = color;
    }
  
    draw(ctx: any) {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.thickness;
      ctx.moveTo(this.circle1.x, this.circle1.y);
      ctx.lineTo(this.circle2.x, this.circle2.y);
      ctx.stroke();
    }
  
    changeColor(ctx: any, color: string = DEFAULT_COLOR) {
      this.color = color;
      this.draw(ctx)
    }
  }