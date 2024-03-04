import Circle from "./circle"
import Edge from "./edge";

const DEFAULT_COLOR = 'black';

export default class Line extends Edge {
    vertex1: Circle
    vertex2: Circle
    thickness: number
    color: string
  
    constructor(c1: Circle, c2: Circle, thickness: number = 3, color: string = DEFAULT_COLOR, w: number | undefined = undefined) {
      super(c1, c2, w);
      this.vertex1 = c1;
      this.vertex2 = c2;
      this.thickness = thickness;
      this.color = color;
    }
  
    draw(ctx: any) {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.thickness;
      ctx.moveTo(this.vertex1.x, this.vertex1.y);
      ctx.lineTo(this.vertex2.x, this.vertex2.y);
      ctx.stroke();
    }
  
    changeColor(ctx: any, color: string = DEFAULT_COLOR) {
      this.color = color;
      this.draw(ctx)
    }
  }