const btnAddTable = document.getElementById("btnAddTable");
const btnGenerate = document.getElementById("btnGenerate");
const btnClose = document.getElementById("btnClose");
const origenID = document.getElementById("OrigenID");
const destinoID = document.getElementById("DestinoID");
const costoID = document.getElementById("CostoID");
const nuevo = { nodes: [], edges: [] };
let rutaCorta = [];
const tabla = {};
const graph = {};

btnAddTable.addEventListener("click", (event) => {
  event.preventDefault();
  añadir();
});

let añadir = () => {
  let origen = origenID.value;
  let destino = destinoID.value;
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
    nuevo.edges.push({ data: { source: origen, target: destino, value: costo } });
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
  let origen = "#" + document.getElementById("rmcOrigen").value;
  let destino = "#" + document.getElementById("rmcDestino").value;

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
          setTimeout(highlightNextEle, 500);
        }
      };
      highlightNextEle();
      renderLabels();

      document.getElementById("resultado").innerHTML = "El valor del viaje es de " + total;
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
    paging: false,
    info: false,
    scrollY: "150px",
    scrollCollapse: true,
    data: nuevo.edges,
    columns: [{ data: "data.source" }, { data: "data.target" }, { data: "data.value" }],
    select: true,
  });
});

const renderLabels = () => {
  rutaCorta.forEach(({ id, origen, destino, acumulado }, index) => {
    if (index === 0) {
      addPooper(destino, `[0,-]`);
      if (id === origen) {
        addPooper(origen, `[${acumulado},${destino}]`);
      } else {
        addPooper(destino, `[${acumulado},${origen}]`);
      }
      addPooper(origen, `[${acumulado},${destino}]`);
    } else {
      addPooper(destino, `[${acumulado},${origen}]`);
    }
  });
};

// [
//   {
//     id: "b",
//     origen: "a",
//     destino: "b",
//     peso: "1",
//     acumulado: 1,
//   },
//   {
//     id: "a",
//     origen: "a",
//     destino: "c",
//     peso: "1",
//     acumulado: 2,
//   },
// ];
