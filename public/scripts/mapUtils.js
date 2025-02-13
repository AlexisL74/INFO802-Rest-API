function mapInit(coord, zoom) {
    return L.map('map').setView(coord, zoom);
}

function mapAddMarker(map, coord, title, options={}) {
    return L.marker(coord, options).addTo(map).bindPopup(title);
}

function mapAddLine(map, coords, options) {
    return L.polyline(coords, options).addTo(map);
}

function mapTraceRoute(map, coords) {
    fetch(my_api_url+'/getRoute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'points': coords
        })
    })
    .then(response => response.json())
    .then(response => {
        mapAddMarker(map, coords[0], 'Start', {icon: blueIcon});
        mapAddMarker(map, coords[coords.length - 1], 'End', {icon: greenIcon})
        for (let i = 1; i < response.path.length-1; i++) {
            let element = response.path[i];
            mapAddMarker(map, [element[1], element[0]], 'Waypoints', {icon: orangeIcon});
            // console.log(element);
        }
        return L.Polyline.fromEncoded(response.route).addTo(map)
    })
    .catch(error => {
        console.error('Error:', error);
        throw error;
    });
}

async function mapTraceRouteEV(map, layer, coords, autonomy) {
    fetch(my_api_url+'/getRouteEV', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'points': coords,
            'autonomy': autonomy,
            'safeDistance': 10000
        })
    })
    .then(response => response.json())
    .then(async response => {
        // console.log(response);
        layer.addLayer(mapAddMarker(map, coords[0], 'Start', {icon: blueIcon}));
        layer.addLayer(mapAddMarker(map, coords[coords.length - 1], 'End', {icon: greenIcon}))
        for (let i = 1; i < response.path.length-1; i++) {
            let element = response.path[i];
            layer.addLayer(mapAddMarker(map, [element[0], element[1]], 'Waypoints', {icon: orangeIcon}));
            // console.log(element);
        }
        let line = L.Polyline.fromEncoded(response.route).addTo(map)
        layer.addLayer(line)
        const price = await calcPrice(Math.floor(response.distance/1000));
        const duration = await calcTemp(response.distance, 1800, autonomy);
        console.log(price, duration);
        document.getElementById('trajet-distance-value').innerHTML = response.distance/1000;
        document.getElementById('trajet-price-value').innerHTML = price;
        document.getElementById('trajet-duration-value').innerHTML = duration;
        return line;
    })
    .catch(error => console.error('Error:', error));
}

function mapAddRechargingStations(map, lat, lon, radius) {
    fetch(my_api_url+'/fetchRechargingStations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'lat': lat,
            'lon': lon,
            'radius': radius
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(element => {
            let point = element.fields.geo_point_borne;
            // console.log(point);
            mapAddMarker(map, point, 'Recharging Station', {icon: orangeIcon});
        });
    })
    .catch(error => console.error('Error:', error));
}

async function convertAddressToCoords(address, limit="FR") {
    return new Promise((resolve, reject) => {
        fetch(my_api_url+'/convertAddressToCoords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'address': address,
                'limit': limit
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            resolve(data);
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error);
        });
    });
}

async function calcTemp(distance, rechargeTime, autonomy) {
    return new Promise((resolve, reject) => {
        fetch(my_api_url+'/calcTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'distance': distance,
                'rechargeTime': rechargeTime,
                'autonomy': autonomy
            })
        })
        .then(response => response.json())
        .then(data => {
            const result = data.calcTempResult;
            resolve(result / 3600);
        })
        .catch(error => {
            console.error('Erreur lors de l\'appel SOAP :', error);
            reject(error);
        });
    });
}

async function calcPrice(distance) {
    return new Promise((resolve, reject) => {
        fetch(my_api_url+'/calcPrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'distance': distance
            })
        })
        .then(response => response.json())
        .then(data => {
            const result = data.calcPriceResult;
            console.log(result);
            resolve(result);
        })
        .catch(error => {
            console.error('Erreur lors de l\'appel SOAP :', error);
            reject(error);
        });
    });
}
