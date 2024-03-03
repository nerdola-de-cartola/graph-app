import { Circle } from "./circle"
import { Edge } from "./graph"

const DEFAULT_COLOR = 'black';

export class Line {
    circle1: Circle
    circle2: Circle
    thickness: number
    edge: Edge
    color: string
  
    constructor(c1: Circle, c2: Circle, thickness: number, e: Edge, color: string = DEFAULT_COLOR) {
      this.circle1 = c1;
      this.circle2 = c2;
      this.thickness = thickness;
      this.edge = e;
      this.color = color;
      // console.log('new line')
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