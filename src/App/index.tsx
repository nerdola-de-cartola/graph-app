import './index.css';
import { useEffect, useRef, useState } from 'react';
import Graph from '../graph/graph.ts';
import Line from '../view/line.ts';
import Circle from '../view/circle.ts';
import { linePointNearestPoint, distance, Point, drawPerimeter } from '../view/geometry.ts';
import VisualGraph from '../view/visual-graph.ts';
import Vertex from '../graph/vertex.ts';
import { bfs, dfs, search } from '../graph/graph-algorithms.ts';
import useWindowSize from '../hooks/useWindowSize.ts';

enum Modes {
  moveVertex,
  newVertex,
  newEdge,
  deleteVertex,
  deleteEdge,
  connectedComponents,
  dfs,
  bfs,
  bipartiteGraph
}

const nameModes = [
  "Move vertex",
  "Add vertex",
  "Add edge",
  "Delete vertex",
  "Delete edge",
  "Highlight connected components",
  "Highlight dfs",
  "Highlight bfs",
  "Bipartite graph?"
]

const g = new VisualGraph();
const animationList: any = [];

function randomHexadecimalColor() {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return `#${color}`
}

function drawConnectedComponents(ctx: any, components: Graph[]) {
  components.forEach(component =>
    drawPerimeter(ctx, component.vertices as Circle[], randomHexadecimalColor())
  );
}

export default function App() {
  const canvas = useRef<any>(null);
  const context = useRef<any>(null);
  const mouse = useRef<Point>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const touchVertex = useRef<Circle | undefined>(undefined);
  const touchEdge = useRef<Line | undefined>(undefined);
  const selectedVertex1 = useRef<Circle | undefined>(undefined);
  const autoName = useRef(0);
  const [width, height] = useWindowSize();
  const [mode, setMode] = useState(Modes.moveVertex);
  const [text, setText] = useState("");
  const [cursor, setCursor] = useState('default');

  let startTime = useRef(performance.now());
  let currentDuration = useRef(0);

  const update = () => {
    const now = performance.now();
    const elapsedTime = now - startTime.current;

    if (elapsedTime >= currentDuration.current) {
      const item = animationList.shift();

      if (!item) return;

      const { obj, animation, params, duration } = item;
      obj.animation = animation;
      obj.animation(...params);
      startTime.current = performance.now();
      currentDuration.current = duration;
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update)

  useEffect(() => {
    if (!context.current) return;

    if (selectedVertex1.current) {
      selectedVertex1.current.changeColor(context.current);
      selectedVertex1.current = undefined;
    }

    reDraw();

    switch (mode) {
      case Modes.moveVertex:
        setText("CLICK AND DRAG THE DESIRED VERTEX");
        break;

      case Modes.newVertex:
        setText("CLICK TO ADD NEW VERTEX");
        break;

      case Modes.newEdge:
        setText("SELECT FIRST VERTEX");
        break;

      case Modes.deleteVertex:
        setText("SELECT VERTEX TO REMOVE");
        break;

      case Modes.deleteEdge:
        setText("SELECT EDGE TO REMOVE");
        break;

      case Modes.connectedComponents:
        setText("EACH COLORED SQUARE REPRESENTS A CONNECTED COMPONENT");
        drawConnectedComponents(context.current, g.connectedComponents());
        break;

      case Modes.dfs:
        setText("SELECT START VERTEX");
        break;

      case Modes.bfs:
        setText("SELECT START VERTEX");
        break;

      case Modes.bipartiteGraph:
        setText(g.bipartiteGraph() ? "TRUE" : "FALSE");
        break;
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
    if (!canvas.current || !context.current) return;

    context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    g.draw();
  }

  const drawPath = (ctx: any, f: any, startVertex: Vertex) => {
    reDraw();

    const r = search({
      graph: g,
      startVertex,
      searchAlgorithm: f
    });

    const path = r as Circle[];
    path.forEach((vertex: Circle, index: number) => {
      let animation = vertex.outline;

      if (index === path.length - 1) { //last animation
        animation = (ctx) => {
          setText("SELECT START VERTEX");
          vertex.outline(ctx);
        }
      }

      animationList.push({
        obj: vertex,
        animation,
        params: [ctx],
        duration: 1000
      })
    })
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
          setText("SELECT SECOND VERTEX");
        } else {
          g.addEdge(new Line(selectedVertex1.current, touchVertex.current));
          selectedVertex1.current.changeColor(context.current);
          selectedVertex1.current = undefined;
          setText("SELECT FIRST VERTEX");
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

      case Modes.dfs:
        if (!touchVertex.current) return;

        setText("RUNNING DFS");
        drawPath(context.current, dfs, touchVertex.current);
        break;

      case Modes.bfs:
        if (!touchVertex.current) return;

        setText("RUNNING BFS");
        drawPath(context.current, bfs, touchVertex.current);
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
      {text && <div className='textContainer'>{text}</div>}
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
