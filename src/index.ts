import GraphApp, { Modes } from "./view/app";

const nameModes = [
  "Move vertex",
  "Add vertex",
  "Add edge",
  "Delete vertex",
  "Delete edge",
  "Highlight connected components",
  "Highlight dfs",
  "Highlight bfs",
  "Bipartite graph?",
  "Highlight Dijkstra",
  "Highlight Kruskal",
  "Highlight Prim",
]

function main() {
  const canvas: HTMLCanvasElement | null = document.querySelector('.mainCanvas');
  const textEl = document.querySelector(`.textContainer`);

  if (!canvas || !textEl) throw new Error('No html elements for app');

  const app = new GraphApp(canvas, textEl as HTMLElement);

  interface AddButtonsType {
    name: string,
    id: number,
    onClick: (e: MouseEvent) => unknown,
    backgroundColor: string
  }

  const addButtons = (functionality: AddButtonsType) => {
    const button = document.createElement("button");
    button.textContent = functionality.name;
    button.className = "modeButton";
    button.id = 'b' + functionality.id;
    button.style.backgroundColor = functionality.backgroundColor;
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
    onClick: () => app.setMode(index),
    backgroundColor: index === 0 ? 'green' : ''
  }))

  app.canvas.addEventListener("onModeChange", (e) => {
    //@ts-ignore
    const oldButton: HTMLElement | null = document.querySelector(`.modeButton#b${e.detail.oldMode}`)
    //@ts-ignore
    const newButton: HTMLElement | null = document.querySelector(`.modeButton#b${e.detail.newMode}`)

    if (oldButton && newButton) {
      newButton.style.backgroundColor = 'green';
      oldButton.style.backgroundColor = '';
    }

  })
}

main();
