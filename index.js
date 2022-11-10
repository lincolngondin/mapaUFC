/* Global states */
let levelSelecionado = "0";


let mapOptions = {
    zoomControl:false,
    attributionControl: true,
    minZoom:14,
    maxZoom: 24,
    maxBounds: [
        [-3.67694, -40.37051],
        [-3.70407, -40.32205]
    ],
    zoomSnap: 0.5
}
const map = L.map('map', mapOptions)
map.setView([-3.6932203,-40.3543455], 18);

/* Adiciona a escala */
const scale = L.control.scale({
    metric: true,
    maxWidth: 100,
    imperial: false,
    position: "topright"
}).addTo(map);

function styleMap(feature){

    let opcao = {

    }
    opcao.fillOpacity = 0;
    opcao.color = '#808080';
    opcao.weight = 2;
    
    if(feature.properties.indoor === 'room'){
        opcao.fill = true
        opcao.fillColor = '#FEFEE2'
        opcao.fillOpacity = 1;
        opcao.stroke = true;
        opcao.weight = 2;
        opcao.color = '#808080';
    }
    if(feature.properties.room !== undefined){
        opcao.fillColor = "#D4EDFF";
    }
    if(feature.properties.indoor !== "room"){
        opcao.fillOpacity = 1;
        opcao.weight = 1;
        opcao.fillColor = "#FDFCFA";
    }
    if(feature.properties.stairs === "yes"){
        opcao.weight = 10;
        opcao.dashArray = "4 10";
        opcao.lineCap = "miter";
    }
    if(feature.properties.indoor === "wall"){
        opcao.fillColor = "#F2EBE3";
        opcao.weight = 3;
    }
    
    return opcao;
}

/* Funcao que filtra as informações a ser exibida */
function filtrar(feature){
    return feature.properties.level === levelSelecionado  && feature.geometry.type !== "Point" && feature.properties.indoor !== undefined;
}

/* Adiciona as informações do campus mucabinho no mapa */
const geo = L.geoJSON(blocoEngenharia, {
    style: styleMap,
    filter: filtrar,
    interactive: false
}).addTo(map);

/* Adiciona as informações da famed no mapa */
const famedGeojson = L.geoJson(famed, {
    style: styleMap,
    filter: filtrar
}).addTo(map);



const fn = ()=>{
    map.removeControl(myL);
    map.addControl(myL);
    geo.clearLayers();
    geo.addData(blocoEngenharia);
    famedGeojson.clearLayers();
    famedGeojson.addData(famed);
    for(nivel of niveisMucab){
        andares[nivel].remove();
    }
    //andares[levelSelecionado].addTo(map);
}

/* Extende a classe controle para criar um controle de andar */
const LayerButton = L.Control.extend({
    onAdd: function(){
        let buttonContainer = L.DomUtil.create("div", "level-buttons");
        let levels = ObterNiveis(blocoEngenharia.features);
        for(let i = 0; i < levels.length; i++){
            let bt = L.DomUtil.create("div", "level-buttons__button", buttonContainer);
            L.DomEvent.on(bt, "click", ()=>{
                levelSelecionado = levels[i]
                fn();
            })
            
            let p = L.DomUtil.create("p", "level-buttons__text", bt);
            if(levels[i] === levelSelecionado){
                L.DomUtil.addClass(bt, "level-buttons__button--selected")
            }
            p.innerText = levels[i];
        }
        return buttonContainer;
    }
});

/* Cria uma instancia da nova classe de controle e adiciona no mapa */
const myL = new LayerButton({
    position: "bottomright"
});
map.addControl(myL);

const niveisMucab = ObterNiveis(blocoEngenharia.features);
const andares = {};
for(let i = 0; i < niveisMucab.length; i++){
    andares[niveisMucab[i]] = L.layerGroup([], {
        interactive: false
    });
}

for(let feature of blocoEngenharia.features){
    
    if(feature.properties.name !== undefined && feature.properties.indoor === "room" && feature.geometry.type === "LineString" && feature.properties.level !== undefined){
        let a = L.latLng(feature.geometry.coordinates[0]);
        let c = CentroGeometrico(feature.geometry.coordinates);
        let icon = L.divIcon({
            html: `<p>${feature.properties.name}</p>`,
            className: "names"
        });
        let mrr = L.marker([c.lng, c.lat], {
            icon:icon,
            interactive:false
        });
        andares[feature.properties.level].addLayer(mrr);
    }
}

map.on("zoom", function(evento){
    let zoom = evento.target._zoom;
    if(zoom < 21){
        for(nivel of niveisMucab){
            andares[nivel].remove();
        }
    }
    else{
        for(nivel of niveisMucab){
            andares[nivel].remove();
        }
        //andares[levelSelecionado].addTo(map);
    }
});



const cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';
var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution,
    maxZoom:24,
    maxNativeZoom: 24,
    interactive:false
}).addTo(map);

const stamenLayer = L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",{
    attribution: "STAMEN",
    maxZoom:24,
    maxNativeZoom: 17,
    interactive:false
});
const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    interactive:false,
    maxZoom:24,
    maxNativeZoom: 18,
});

var myIcon = L.icon({
    iconUrl: 'icons/a1.png',
    iconSize: [20, 20],
});

let dv = L.popup([-3.6933203,-40.3543455], {
    content: `
        <div>
            <h3>Estado de acessibilidade</h3>
            <p style="color:red">Pouco Acessível</p>
        </div>
    `
});

const mk = L.marker([-3.6932203,-40.3543455], {
    icon: myIcon,
    draggable: false
}).addTo(map);

mk.bindPopup(dv)

L.control.layers({
    "Stamem": stamenLayer,
    "CartoDB": positron,
    "OpenStreetMap": openStreetMap
}).addTo(map);

document.querySelector(".controls__button--mucab").onclick = ()=>{
    map.flyTo([-3.693466, -40.354933], 17.97);
    document.querySelector(".controls__button--mucab").classList.add("controls__button--selected");
    document.querySelector(".controls__button--famed").classList.remove("controls__button--selected");
}
document.querySelector(".controls__button--famed").onclick = ()=>{
    map.flyTo([-3.68137, -40.336832], 18.29);
    document.querySelector(".controls__button--famed").classList.add("controls__button--selected");
    document.querySelector(".controls__button--mucab").classList.remove("controls__button--selected");
}