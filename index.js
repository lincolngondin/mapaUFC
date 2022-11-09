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
    ]
}
const map = L.map('map', mapOptions)
map.setView([-3.6932203,-40.3543455], 18);

/* Adiciona a escala */
const scale = L.control.scale({
    metric: true,
    maxWidth: 100,
    imperial: false
}).addTo(map);

function styleMap(feature){
    //console.log(feature)
    let opcao = {

    }
    opcao.fillOpacity = 0;
    if(feature.properties.indoor === 'room'){
        opcao.fill = true
        opcao.fillColor = '#9fc9f7'
        opcao.fillOpacity = 1;
        opcao.stroke = true;
    }
    return opcao;
}

/* Adiciona as informações do campus mucabinho no mapa */
const geo = L.geoJSON(blocoEngenharia, {
    style: styleMap,
    filter: function(feature){
        return feature.properties.level === levelSelecionado  && feature.geometry.type !== "Point";
    },
    pointToLayer: function(geoJsonPoint, latlng) {
        return L.marker(latlng);
    }
}).addTo(map);

/* Adiciona as informações da famed no mapa */
const famedGeojson = L.geoJson(famed, {
    style: styleMap,
    filter: function(feature){
        return feature.properties.level === levelSelecionado  && feature.geometry.type !== "Point";
    },
    
}).addTo(map);

const cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';





const LayerButton = L.Control.extend({
    onAdd: function(){
        let buttonContainer = L.DomUtil.create("div", "levelButtonContainer");
        let levels = ObterNiveis(blocoEngenharia.features);
        for(let i = 0; i < levels.length; i++){
            let bt = L.DomUtil.create("div", "levelButton", buttonContainer);
            L.DomEvent.on(bt, "click", ()=>{
                levelSelecionado = levels[i]
                fn();
            })
            
            let p = L.DomUtil.create("p", "", bt);
            if(levels[i] === levelSelecionado){
                L.DomUtil.addClass(bt, "levelButtonSelecionado")
            }
            p.innerText = levels[i];
        }
        return buttonContainer;
    }
});
const myL = new LayerButton({
    position: "bottomright"
});
map.addControl(myL);

const niveisMucab = ObterNiveis(blocoEngenharia.features);
const andares = {};
for(let i = 0; i < niveisMucab.length; i++){
    andares[niveisMucab[i]] = L.layerGroup();
}
console.log(andares)
for(let feature of blocoEngenharia.features){
    
    if(feature.properties.name !== undefined && feature.properties.indoor === "room" && feature.geometry.type === "LineString" && feature.properties.level !== undefined){
        let a = L.latLng(feature.geometry.coordinates[0]);
        let c = CentroGeometrico(feature.geometry.coordinates);
        //console.log(feature)
        let icon = L.divIcon({
            html: `<p>${feature.properties.name}</p>`,
            className: "names"
        });
        let mrr = L.marker([c.lng, c.lat], {
            icon:icon,
            interactive: false
        });
        andares[feature.properties.level].addLayer(mrr);
    }
}

map.on("zoom", function(evento){
    let zoom = evento.target._zoom;
    console.log(zoom)
    if(zoom < 19){
        for(nivel of niveisMucab){
            andares[nivel].remove();
        }
    }
    else{
        for(nivel of niveisMucab){
            andares[nivel].remove();
        }
        andares[levelSelecionado].addTo(map);
    }
});

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
    andares[levelSelecionado].addTo(map);
}

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution
});

const stamenLayer = L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",{
    attribution: "STAMEN"
})

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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

//const toolTip = L.tooltip([-3.6942203,-40.3543455], {content: '<h1>Lincoln</h1>', className: "test"}).addTo(map);



document.querySelector(".button_mucab").onclick = ()=>{
    map.flyTo([-3.693466, -40.354933], 17.97);
}
document.querySelector(".button_famed").onclick = ()=>{
    map.flyTo([-3.68137, -40.336832], 18.29);
}