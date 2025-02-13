
// Initialisation de la carte
const coordX = 45.66567774521499;
const coordY = 5.83827524602418;
const zoom = 13;

const trajet = L.layerGroup();
trajet

const my_api_url = 'https://info802rest-f4fdhuheexacgzbs.francecentral-01.azurewebsites.net/api';


const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 3
});

var map = L.map('map', {
    center: [coordX, coordY],
    zoom: zoom,
    layers: [osm]
});

const layerControl = L.control.layers({}, { 'Trajet': trajet }).addTo(map);
layerControl.addBaseLayer(osm, 'Open Street Map');

const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});
layerControl.addBaseLayer(osmHOT, 'Hot Open Street Map');

// const lh = L.tileLayer('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', { 
//     attribution: 'Map tiles from Mapzen API', 
//     maxZoom: 19,
//     minZoom: 6 
// });
// layerControl.addBaseLayer(lh, 'Topography');

const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 19,
    minZoom: 5
});
layerControl.addBaseLayer(openTopoMap, 'OpenTopoMap');

const popup = L.popup();

function onMapClick(e) {
    popup.setLatLng(e.latlng).setContent(`${e.latlng.lat}, ${e.latlng.lng}`).openOn(map);
}
map.on('click', onMapClick);

async function calcRoute(start, end, autonomy) {
    clearTrajetLayer()
    const startPoint = await convertAddressToCoords(start);
    const endPoint = await convertAddressToCoords(end);
    mapTraceRouteEV(map, trajet, [startPoint, endPoint], autonomy);
}

function clearTrajetLayer() {
    // trajet.clearLayers();
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
           layer.remove();
        }
      });
}

var startPoint = document.getElementById('startPoint');
var destinationPoint = document.getElementById('destinationPoint');
var carsList = document.getElementById('carsList');

var currentCar = null;
init_carsSelect(carsList);


document.getElementById('calcRoute').addEventListener('click', () => {
    if(currentCar != null && startPoint.value != '' && destinationPoint.value != '') {
        calcRoute(startPoint.value, destinationPoint.value, currentCar.range.chargetrip_range.worst*1000);
    }
    else {
        console.error('Please select a car');
    }
});
document.getElementById('clearRoute').addEventListener('click', () => clearTrajetLayer());
