import type Graph from './graph/graph';
import Line from './view/line';
import Circle from './view/circle';
import { linePointNearestPoint, distance, Point, drawPerimeter } from './view/geometry';
import VisualGraph from './view/visual-graph';
import type Vertex from './graph/vertex';
import { bfs, dfs, search } from './graph/graph-algorithms';

interface Animation {
  obj: any
  animation: any
  params: any
  duration: number
}

class Animations {
  list: Animation[]
  startTime: number
  currentDuration: number

  constructor() {
    this.list = [];
    this.startTime = performance.now();
    this.currentDuration = 0;
  }

  addAnimation(animation: Animation) {
    this.list.push(animation)

    if(this.list.length ===  1) {
      requestAnimationFrame(() => this.animate())
    }
  }

  animate() {
    const now = performance.now();
    const elapsedTime = now - this.startTime;

    if (elapsedTime >= this.currentDuration) {
      const item = this.list.shift();

      if (!item) return;

      const { obj, animation, params, duration } = item;
      obj.animation = animation;
      obj.animation(...params);
      this.startTime = performance.now();
      this.currentDuration = duration;
    }

    requestAnimationFrame(() => this.animate());
  }
}

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

function randomHexadecimalColor() {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return `#${color}`
}

function drawConnectedComponents(ctx: CanvasRenderingContext2D, components: Graph[]) {
  components.forEach(component =>
    drawPerimeter(ctx, component.vertices as Circle[], randomHexadecimalColor())
  );
}

function main() {
  const canvas: HTMLCanvasElement | null = document.querySelector('.mainCanvas');

  if (!canvas) return;

  const proportion = 0.95;

  canvas.width = proportion * window.innerWidth;
  canvas.height = proportion * window.innerHeight;
  
  const context = canvas && canvas.getContext("2d");

  if(!context) return;

  const g = new VisualGraph(context);
  const animationList = new Animations();

  
  if (!context) return;
  
  addEventListener('resize', () => {
    canvas.width = proportion * window.innerWidth;
    canvas.height = proportion * window.innerHeight;
    reDraw();
  })

  const setMode = (newMode: number) => {
    if(newMode === mode) return;

    const oldButton: HTMLElement | null = document.querySelector(`.modeButton#b${mode}`)
    const newButton: HTMLElement | null = document.querySelector(`.modeButton#b${newMode}`)

    if(oldButton && newButton) {
      newButton.style.backgroundColor = 'green';
      oldButton.style.backgroundColor = '';
    }

    mode = newMode;

    onModeChange();
  }

  interface AddButtonsType {
    name: string,
    id: number,
    onClick: (e: MouseEvent) => unknown
  }
  
  const addButtons = (functionality: AddButtonsType) => {
    const button = document.createElement("button");
    button.textContent = functionality.name;
    button.className = "modeButton";
    button.id = 'b' + functionality.id;
    button.onclick = functionality.onClick;
    const wrapper = document.querySelector(".header");
    wrapper && wrapper.appendChild(button);
  }

  const modesValues = Object.keys(Modes)
    .filter(mode =>
      isNaN(Number(mode))
    );

  modesValues.forEach((mode, index) => addButtons({
    name: nameModes[index],
    id: index,
    onClick: () => setMode(index)
  }))

  const mouse: Point = { x: 0, y: 0 };
  let isDragging = false;
  let touchVertex: Circle | undefined = undefined;
  let touchEdge: Line | undefined = undefined;
  let selectedVertex1: Circle | undefined = undefined;
  let autoName = 0;
  let mode = Modes.moveVertex;
  let text = "";
  let cursor = "";

  const reDraw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    g.draw();
  }

  const setText = (str: string) => {
    if(str === text) return; 

    const textEl = document.querySelector(`.textContainer`)

    if(textEl) textEl.textContent = str;
  }

  const onModeChange = () => {
    if (selectedVertex1) {
      selectedVertex1.changeColor(context);
      selectedVertex1 = undefined;
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
        drawConnectedComponents(context, g.connectedComponents());
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

    const drawPath = (ctx: CanvasRenderingContext2D, f: any, startVertex: Vertex) => {
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

        animationList.addAnimation({
          obj: vertex,
          animation,
          params: [ctx],
          duration: 1000
        })
      })
    }

    const setCursor = (c: string) => {
      if(cursor === c) return;
      canvas.style.cursor = c;
    }

    const mouseMove = (e: MouseEvent) => {
      // @ts-ignore 
      const canvasObj = e.target.getBoundingClientRect();
      mouse.x = e.clientX - canvasObj.left;
      mouse.y = e.clientY - canvasObj.top;


      touchVertex = g.vertices.find((circle) => {
        return distance(mouse, circle) <= circle.radius;
      })

      touchEdge = g.edges.find(line => {
        const linePointNearestMouse = linePointNearestPoint(line, mouse);
        if (!linePointNearestMouse) return false;
        return distance(mouse, linePointNearestMouse) <= line.thickness;
      });

      if ((touchVertex || touchEdge)) {
        setCursor("pointer");
      } else {
        setCursor("default");
      }

      if (isDragging) {
        if (!selectedVertex1) return;

        selectedVertex1.updatePosition(mouse.x, mouse.y);
        reDraw();
      }
    }

    const mouseClick = (e: MouseEvent) => {
      // console.log(g)

      switch (mode) {
        case Modes.newVertex:
          g.addVertex(new Circle(autoName.toString(), mouse.x, mouse.y))
          autoName++;
          break;

        case Modes.newEdge:
          if (!touchVertex) return;

          if (!selectedVertex1) {
            selectedVertex1 = touchVertex;
            selectedVertex1.changeColor(context, 'red');
            setText("SELECT SECOND VERTEX");
          } else {
            g.addEdge(new Line(selectedVertex1, touchVertex));
            selectedVertex1.changeColor(context);
            selectedVertex1 = undefined;
            setText("SELECT FIRST VERTEX");
          }

          break;

        case Modes.deleteVertex:
          if (!touchVertex) return;

          selectedVertex1 = touchVertex;
          g.deleteVertex(selectedVertex1);
          selectedVertex1 = undefined;
          reDraw();
          break;

        case Modes.deleteEdge:
          if (!touchEdge) return;

          g.deleteEdge(touchEdge);
          reDraw();
          break;

        case Modes.dfs:
          if (!touchVertex) return;

          setText("RUNNING DFS");
          drawPath(context, dfs, touchVertex);
          break;

        case Modes.bfs:
          if (!touchVertex) return;

          setText("RUNNING BFS");
          drawPath(context, bfs, touchVertex);
          break;
      }
    }

    const mouseDown = (e: MouseEvent) => {
      switch (mode) {
        case Modes.moveVertex:
          if (!touchVertex) return;

          selectedVertex1 = touchVertex;
          selectedVertex1.changeColor(context, 'red')
          isDragging = true;
          break;
      }
    }

    const mouseUp = (e: MouseEvent) => {
      if (isDragging) {
        isDragging = false;

        if (!selectedVertex1) return;

        selectedVertex1.changeColor(context)
        selectedVertex1 = undefined;
      }
    }

    canvas.onclick = mouseClick;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
  }

}
main();
