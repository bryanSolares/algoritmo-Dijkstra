const btnAddTable = document.getElementById("btnAddTable");
const btnColorGraph = document.getElementById("btnColorGraph");
const nuevo = { nodes: [], edges: [] };
const tabla = {};
const graph = {};

btnAddTable.addEventListener("click", (event) => {
  event.preventDefault();
  añadir();
});

btnColorGraph.addEventListener("click", (event) => {
  event.preventDefault();
  paintRoute();
});

let añadir = () => {
  let origen = document.getElementById("OrigenID").value;
  let destino = document.getElementById("DestinoID").value;
  let costo = document.getElementById("CostoID").value;

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
    console.log(nuevo);
    tabla.esta.clear().draw(); //Clear datatables
    tabla.esta.rows.add(nuevo.edges).draw();
    console.log("Redibujado");
  }
};
const random_hex_color_code = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return "#" + n.slice(0, 6);
};

let cargarGraficos = () => {
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
          "target-arrow-shape": "triangle",
          "transition-property": "background-color, line-color, target-arrow-color",
          "transition-duration": "0.10s",
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
  let origen = "#" + document.getElementById("rmcOrigen").value;
  let destino = "#" + document.getElementById("rmcDestino").value;

  //Validacion agregada
  if (origen == "#" || destino == "#") {
    alert("No se permite un origen o destino en blanco para encontrar la ruta mas corta");
  } else {
    console.log(origen);
    console.log(destino);
    try {
      let dijkstra = myCy.cy.elements().dijkstra(origen, function (edge) {
        return edge.data("value");
      });
      let pathTo = dijkstra.pathTo(myCy.cy.$(destino));
      console.log("Nodes Size - " + pathTo.nodes().size());
      console.log("Edges Size - " + pathTo.edges().size());
      // for (i = 0, j = 0; i < pathTo.nodes().size() + 1, j < pathTo.edges().size(); i++, j++) {
      //     console.log('Node - \t' + pathTo.nodes()[i].data('id'));
      //     let actualPath = pathTo.nodes()[i].data('id');
      //     setTimeout(myCy.cy.$('#' + actualPath).animate({ style: { backgroundColor: 'red' } }), 500);
      //     console.log('edge - \t' + pathTo.edges()[j].data('id'));
      //     console.log('value - \t' + pathTo.edges()[j].data('value'));
      // }
      let total = 0;
      for (i = 0; i < pathTo.edges().size(); i++) {
        total = total + parseInt(pathTo.edges()[i].data("value"));
      }
      for (i = 0; i < pathTo.nodes().size(); i++) {
        let actualPath = pathTo.nodes()[i].data("id");
        setTimeout(myCy.cy.$("#" + actualPath).animate({ style: { backgroundColor: "red" } }), 1500);
      }
      document.getElementById("resultado").innerHTML = "El valor del viaje es de " + total;
    } catch (error) {
      console.log(error);
    }
  }
};

document.getElementById("generar").onclick = cargarGraficos;
document.getElementById("encontraBoton").onclick = rutaMasCorta;

//Camino más corto con Dijkstra

//Funcionalidad boton agregado
let Limpiar = () => {
  /*document.getElementById("graficos").innerHTML = "";*/
  location.reload();
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
  });
});

const paintRoute = () => {
  const bfs = graph.cy.elements().bfs("#a", function () {}, true);

  let i = 0;
  const highlightNextEle = function () {
    if (i < bfs.path.length) {
      bfs.path[i].addClass("highlighted");
      i++;
      setTimeout(highlightNextEle, 1500);
    }
  };

  highlightNextEle();
};
