import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Graph from './graph.ts';
import Line from './line.ts';
import Circle from './circle.ts';
import { linePointNearestPoint } from './geometry.ts';

enum Modes {
  moveVertex,
  newVertex,
  newEdge,
  deleteVertex,
  deleteEdge,
  connectedComponents
}

const nameModes = [
  "Move vertex",
  "Add vertex",
  "Add edge",
  "Delete vertex",
  "Delete edge",
  "Highlight connected components"
]

const g = new Graph();
const circles: Circle[] = [];

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

function newVertex(x: number, y: number, ctx: any, name: string = '') {
  const radius = 18;
  const circle = new Circle(name, x, y, radius);
  const newVertex = g.addVertex(circle);

  if (!newVertex) return;

  circles.push(circle);
  circle.draw(ctx);
}

function newEdge(vertex1: Circle, vertex2: Circle, ctx: any) {
  const thickness = 3;

  const edge = g.addEdge(vertex1, vertex2);

  if (!edge) return;

  const line = new Line(vertex1, vertex2, thickness);
  vertex1.addLine(line)
  vertex1.drawLines(ctx);
}

function randomHexadecimalColor() {
  const color =  Math.floor(Math.random()*16777215).toString(16);
  return `#${color}`
}

function drawPerimeter(ctx: any, dots: Circle[]) {
  const thickness = 3;
  const color = randomHexadecimalColor();

  if(dots.length === 0) return;

  const minX = Math.min(...dots.map(dot => dot.x));
  const minY = Math.min(...dots.map(dot => dot.y));
  const maxX = Math.max(...dots.map(dot => dot.x));
  const maxY = Math.max(...dots.map(dot => dot.y));

  const radius = Math.max(...dots.map(dot => dot.radius)) + 10;

  const lt = new Circle('lt', minX-radius, minY-radius, 1);
  const rt = new Circle('rt', maxX+radius, minY-radius, 1);
  const rb = new Circle('rb', maxX+radius, maxY+radius, 1);
  const lb = new Circle('lb', minX-radius, maxY+radius, 1);

  const perimeterLines = [
    new Line(lt, rt, thickness, color),
    new Line(rt, rb, thickness, color),
    new Line(rb, lb, thickness, color),
    new Line(lb, lt, thickness, color),
  ]
  
  perimeterLines.forEach(line => line.draw(ctx));
}

function drawConnectedComponents(ctx: any, components: Graph[]) {
  components.forEach(component =>
    drawPerimeter(ctx, component.vertices as Circle[])
  );
}

export default function App() {
  const canvas = useRef<any>(null);
  const context = useRef<any>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isDragging = useRef(false);
  const touchVertex = useRef<Circle | undefined>(undefined);
  const touchEdge = useRef<Line | undefined>(undefined);
  const selectedVertex1 = useRef<Circle | undefined>(undefined);
  const selectedVertex2 = useRef<Circle | undefined>(undefined);
  const autoName = useRef(0);
  const [width, height] = useWindowSize();
  const [mode, setMode] = useState(Modes.moveVertex);
  const [cursor, setCursor] = useState('default');

  useEffect(() => {
    if(!context.current) return;

    selectedVertex1.current &&
    selectedVertex1.current.changeColor(context.current);

    if(mode === Modes.connectedComponents) {
      reDraw();
      drawConnectedComponents(context.current, g.connectedComponents());
    }
  }, [mode])

  useEffect(() => {
    const canvasEl: any = canvas.current;

    if (!canvasEl) return;

    const proportion = 0.95;

    canvasEl.width = proportion * width;
    canvasEl.height = proportion * height;

    context.current = canvasEl.getContext("2d");

    if (!context.current) return;
    reDraw();
  }, [width, height])

  const reDraw = () => {
    if(!canvas.current || !context.current) return;

    context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    circles.forEach(circle => {
      circle.drawLines(context.current);
      circle.draw(context.current);
    })
  }

  const modesValues = Object.values(Modes).filter(mode => !isNaN(Number(mode)));

  const mouseMove = (e: any) => {
    // @ts-ignore 
    const canvasObj = e.target.getBoundingClientRect();
    mouseX.current = e.clientX - canvasObj.left;
    mouseY.current = e.clientY - canvasObj.top;

    touchVertex.current = circles.find((circle) => {
      const relativeX = circle.x - mouseX.current;
      const relativeY = circle.y - mouseY.current;
      const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
      return distance <= circle.radius;
    })

    for (const circle of circles) {
      touchEdge.current = circle.lines.find(line => {
        const linePointNearestMouse = linePointNearestPoint(line, mouseX.current, mouseY.current);

        // newVertex(linePointNearestMouse?.x, linePointNearestMouse?.y, context.current);

        if (!linePointNearestMouse) return false;

        const dx = mouseX.current - linePointNearestMouse.x;
        const dy = mouseY.current - linePointNearestMouse.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= line.thickness;
      })

      if (touchEdge.current) break;
    }

    if ((touchVertex.current || touchEdge.current)) {
      setCursor("pointer");
    } else if (cursor !== "default") {
      setCursor("default");
    }

    if (isDragging.current) {
      const vertex = selectedVertex1.current;

      if (!vertex) return;

      vertex.updatePosition(mouseX.current, mouseY.current);
      reDraw();
    }
  }

  const mouseClick = (e: any) => {
    // console.log(g)

    switch (mode) {
      case Modes.newVertex:
        newVertex(mouseX.current, mouseY.current, context.current, autoName.current.toString())
        autoName.current += 1;
        break;

      case Modes.newEdge:
        if (!touchVertex.current) return;

        if (!selectedVertex1.current) {
          selectedVertex1.current = touchVertex.current;
          selectedVertex1.current.changeColor(context.current, 'red');
        } else {
          selectedVertex2.current = touchVertex.current;
          newEdge(selectedVertex1.current, selectedVertex2.current, context.current);
          selectedVertex1.current.changeColor(context.current);
          selectedVertex1.current = undefined;
          selectedVertex2.current = undefined;
        }

        break;

      case Modes.deleteVertex:
        if (!touchVertex.current) return;

        selectedVertex1.current = touchVertex.current;
        const indexToErase = circles.indexOf(selectedVertex1.current)
        circles.splice(indexToErase, 1);
        g.deleteVertex(selectedVertex1.current.name);
        circles.forEach(circle => {
          circle.lines = circle.lines.filter(line => line.circle2 !== selectedVertex1.current);
        })
        selectedVertex1.current = undefined;
        reDraw();
        break;

      case Modes.deleteEdge:
        if (!touchEdge.current) return;

        
        touchEdge.current.delete();
        const i = circles.indexOf(touchEdge.current.circle1);
        circles[i].deleteLine(touchEdge.current);
        reDraw();

        break;

      default:
        break;
    }
  }

  const mouseDown = (e: any) => {
    switch (mode) {
      case Modes.moveVertex:
        if (!touchVertex.current) return;

        selectedVertex1.current = touchVertex.current;
        selectedVertex1.current.changeColor(context.current, 'red')
        isDragging.current = true;
        break;

      default:
        break;
    }
  }

  const mouseUp = (e: any) => {
    if (isDragging.current) {
      isDragging.current = false;

      if (!selectedVertex1.current) return;

      selectedVertex1.current.changeColor(context.current)
      selectedVertex1.current = undefined;
    }
  }

  return (
    <div className="App" style={{ cursor: cursor }}>
      <h2>Graph JS</h2>
      <div className='header'>
        {modesValues.map((currentMode, index) =>
          <button
            key={index}
            className='modeButton'
            onClick={() => setMode(index)}
            style={{ backgroundColor: mode === index ? "green" : "#f0f0f0" }}>
            {nameModes[index]}
          </button>
        )}
      </div>
      <div
        className='canvasContainer'
      >
        <canvas
          className='mainCanvas'
          ref={canvas}
          onClick={(e) => mouseClick(e)}
          onMouseMove={(e) => mouseMove(e)}
          onMouseDown={(e) => mouseDown(e)}
          onMouseUp={(e) => mouseUp(e)}
        />
      </div>
    </div>
  );
}
