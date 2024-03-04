import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Graph from './graph.ts';
import Line from './line.ts';
import Circle from './circle.ts';
import { linePointNearestPoint, distance, Point } from './geometry.ts';
import VisualGraph from './visual-graph.ts';
import { depthFirstSearch } from './graph-algorithms.ts';
import Vertex from './vertex.ts';

enum Modes {
  moveVertex,
  newVertex,
  newEdge,
  deleteVertex,
  deleteEdge,
  connectedComponents,
  dfs
}

const nameModes = [
  "Move vertex",
  "Add vertex",
  "Add edge",
  "Delete vertex",
  "Delete edge",
  "Highlight connected components",
  "Highlight dfs",
]

const g = new VisualGraph();

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
  const mouse = useRef<Point>({x: 0, y: 0});
  const isDragging = useRef(false);
  const touchVertex = useRef<Circle | undefined>(undefined);
  const touchEdge = useRef<Line | undefined>(undefined);
  const selectedVertex1 = useRef<Circle | undefined>(undefined);
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

    const vf = (v: Circle) => console.log(v.name); 
    const sf = (v: Circle) => v.name === '3'; 

    if(mode === Modes.dfs) {
      depthFirstSearch({
        graph: g,
        visitFunction: vf as (v: Vertex) => unknown,
        stopFunction: sf as (v: Vertex) => boolean
      });
    }
  }, [mode])

  useEffect(() => {
    const canvasEl: any = canvas.current;

    if (!canvasEl) return;

    const proportion = 0.95;

    canvasEl.width = proportion * width;
    canvasEl.height = proportion * height;

    context.current = canvasEl.getContext("2d");
    g.ctx = context.current;

    if (!context.current) return;
    reDraw();
  }, [width, height])

  const reDraw = () => {
    if(!canvas.current || !context.current) return;

    context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    g.draw();
  }

  const modesValues = Object.values(Modes).filter(mode => !isNaN(Number(mode)));

  const mouseMove = (e: any) => {
    // @ts-ignore 
    const canvasObj = e.target.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - canvasObj.left,
      y: e.clientY - canvasObj.top
    } 

    touchVertex.current = g.vertices.find((circle) => {
      return distance(mouse.current, circle) <= circle.radius;
    })

    touchEdge.current = g.edges.find(line => {
      const linePointNearestMouse = linePointNearestPoint(line, mouse.current);
      if (!linePointNearestMouse) return false;
      return distance(mouse.current, linePointNearestMouse) <= line.thickness;
    });

    if ((touchVertex.current || touchEdge.current)) {
      setCursor("pointer");
    } else if (cursor !== "default") {
      setCursor("default");
    }

    if (isDragging.current) {
      const vertex = selectedVertex1.current;

      if (!vertex) return;

      vertex.updatePosition(mouse.current.x, mouse.current.y);
      reDraw();
    }
  }

  const mouseClick = (e: any) => {
    // console.log(g)

    switch (mode) {
      case Modes.newVertex:
        g.addVertex(new Circle(autoName.current.toString(), mouse.current.x, mouse.current.y))
        autoName.current += 1;
        break;

      case Modes.newEdge:
        if (!touchVertex.current) return;

        if (!selectedVertex1.current) {
          selectedVertex1.current = touchVertex.current;
          selectedVertex1.current.changeColor(context.current, 'red');
        } else {
          g.addEdge(new Line(selectedVertex1.current, touchVertex.current));
          selectedVertex1.current.changeColor(context.current);
          selectedVertex1.current = undefined;
        }

        break;

      case Modes.deleteVertex:
        if (!touchVertex.current) return;

        selectedVertex1.current = touchVertex.current;
        g.deleteVertex(selectedVertex1.current);
        selectedVertex1.current = undefined;
        reDraw();
        break;

      case Modes.deleteEdge:
        if (!touchEdge.current) return;

        g.deleteEdge(touchEdge.current);
        reDraw();
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
