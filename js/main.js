const btnAddTable = document.getElementById("btnAddTable");
const btnGenerate = document.getElementById("btnGenerate");
const btnClean = document.getElementById("btnClean");
const origenID = document.getElementById("OrigenID");
const destinoID = document.getElementById("DestinoID");
const costoID = document.getElementById("CostoID");
const rmcOrigen = document.getElementById("rmcOrigen");
const rmcDestino = document.getElementById("rmcDestino");
const nuevo = { nodes: [], edges: [] };
let rutaCorta = [];
const tabla = {};
const graph = {};

btnAddTable.addEventListener("click", (event) => {
  event.preventDefault();
  añadir();
});

let añadir = () => {
  let origen = origenID.value.toUpperCase();
  let destino = destinoID.value.toUpperCase();
  let costo = costoID.value;

  //Validacion agregada
  if (origen == "" || destino == "" || costo == "") {
    alert("No se permiten la creación de un origen o destino en blanco");
  } else {
    //Si no existe el nombre de este nodo, lo añadimos
    if (!nuevo.nodes.find((element) => element.data.id == origen)) {
      nuevo.nodes.push({ data: { id: origen } });
    }
    if (!nuevo.nodes.find((element) => element.data.id == destino)) {
      nuevo.nodes.push({ data: { id: destino } });
    }
    nuevo.edges.push({ data: { source: origen, target: destino, value: costo, id: new Date().getTime() } });
    tabla.esta.clear().draw(); //Clear datatables
    tabla.esta.rows.add(nuevo.edges).draw();
    origenID.value = "";
    destinoID.value = "";
    costoID.value = "";
    origenID.focus();
  }
};
const random_hex_color_code = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return "#" + n.slice(0, 6);
};

let cargarGraficos = () => {
  clearAllTags();
  graph.cy = cytoscape({
    container: $("#graficos"),
    elements: nuevo,
    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          "background-color": random_hex_color_code(),
          label: "data(id)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 5,
          "line-color": "#ccc",
          "target-arrow-color": random_hex_color_code(),
          // 'target-arrow-shape': 'triangle',
          "curve-style": "bezier",
          label: "data(value)",
        },
      },
      {
        selector: ".highlighted",
        style: {
          "background-color": "#8DFF33",
          "line-color": "#FF5733",
          "target-arrow-color": "#FF5733",
          // "target-arrow-shape": "triangle",
          "transition-property": "background-color, line-color, target-arrow-color",
          "transition-duration": "0.20s",
        },
      },
    ],
    layout: {
      name: "circle",
      fit: true,
      avoidOverlap: true,
    },
  });
};

let rutaMasCorta = () => {
  clearAllTags();

  const elemOrigen = document.getElementById("rmcOrigen");
  const elemDestino = document.getElementById("rmcDestino");

  let origen = "#" + elemOrigen.value.toUpperCase();
  let destino = "#" + elemDestino.value.toUpperCase();

  //Validacion agregada
  if (origen == "#" || destino == "#") {
    alert("No se permite un origen o destino en blanco para encontrar la ruta mas corta");
  } else {
    try {
      let dijkstra = graph.cy.elements().dijkstra(origen, function (edge) {
        return parseInt(edge.data("value"));
      });

      let pathTo = dijkstra.pathTo(graph.cy.$(destino));

      let total = 0;
      for (i = 0; i < pathTo.edges().size(); i++) {
        const { id } = pathTo.nodes()[i].data();
        const { source, target, value } = pathTo.edges()[i].data();
        total = total + parseInt(value);
        rutaCorta.push({ id, origen: source, destino: target, peso: value, acumulado: total });
      }

      var i = 0;
      const highlightNextEle = function () {
        if (i < pathTo.nodes().size()) {
          if (pathTo.nodes()[i]) {
            pathTo.nodes()[i].addClass("highlighted");
          }

          if (pathTo.edges()[i]) {
            const { source, target, value } = pathTo.edges()[i].data();
            pathTo.edges()[i].addClass("highlighted");
          }

          i++;
          setTimeout(highlightNextEle, 2000);
        }
      };
      highlightNextEle();
      renderLabels();

      document.getElementById("resultado").innerHTML = "El valor del viaje es de " + total;
      elemOrigen.value = "";
      elemDestino.value = "";
    } catch (error) {
      console.log(error);
    }
  }
};

document.getElementById("btnGenerate").onclick = cargarGraficos;
document.getElementById("encontraBoton").onclick = rutaMasCorta;

let Limpiar = () => {
  location.reload();
};

const addPooper = (id, text) => {
  const ref = graph.cy.getElementById(id).popperRef();
  const dummyDomEle = document.createElement("div");
  tippy(dummyDomEle, {
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: "manual",
    content: function () {
      const div = document.createElement("div");
      div.innerHTML = text;
      return div;
    },
    arrow: true,
    placement: "top",
    hideOnClick: false,
    sticky: "reference",
    interactive: true,
    appendTo: document.body,
  }).show();
};

const clearAllTags = () => {
  const listaEtiquetas = document.querySelectorAll("[data-tippy-root]");
  listaEtiquetas.forEach((tag) => {
    tag.remove();
  });
  rutaCorta = [];
};

$(document).ready(function () {
  tabla.esta = $("#datos").DataTable({
    ordering: false,
    searching: false,
    paging: true,
    info: false,
    scrollY: "150px",
    scrollCollapse: true,
    data: nuevo.edges,
    columns: [
      { data: "data.id" },
      { data: "data.source" },
      { data: "data.target" },
      { data: "data.value" },
      { defaultContent: "<button class='delete btn btn-danger'>Eliminar</button>" },
    ],
    select: true,
  });
});

const renderLabels = () => {
  rutaCorta.forEach(({ id, origen, destino, acumulado }, index) => {
    if (index === 0) {
      addPooper(id, `[0,-]`);
    }
    if (id === origen) {
      addPooper(destino, `[${acumulado},${origen}]`);
    } else {
      addPooper(origen, `[${acumulado},${destino}]`);
    }
  });
};

const listenerOfDeleteRow = function (tbody, table) {
  $(tbody).on("click", "button.delete", function () {
    const {
      data: { source, target, value, id },
    } = table.esta.row($(this).parents("tr")).data();
    origenID.value = source;
    destinoID.value = target;
    costoID.value = value;
    $(this).closest("tr").remove();
    nuevo.edges = nuevo.edges.filter((node) => node.data.id !== id);
    const existenAdyacenciasOrigen = nuevo.edges.some(
      (node) => node.data.source === source || node.data.target === source
    );
    const existenAdyacenciasDestino = nuevo.edges.some(
      (node) => node.data.target === target || node.data.source === target
    );

    if (!existenAdyacenciasOrigen) {
      nuevo.nodes = nuevo.nodes.filter((node) => node.data.id !== source);
    }

    if (!existenAdyacenciasDestino) {
      nuevo.nodes = nuevo.nodes.filter((node) => node.data.id !== target);
    }
  });
};

listenerOfDeleteRow("#datos", tabla);
