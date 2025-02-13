import fetch from 'node-fetch';
import polyline from '@mapbox/polyline';
import { haversineDistance } from './utils.js';
import { response } from 'express';

const radiusConst = 350;

export async function calcRoute(pointsReq, radius) {
    let points = [];
    pointsReq.forEach(element => {
        points.push([element[1], element[0]]);
    });
    console.log("points: "+points[0]+" radius: "+radius);

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `${process.env.OPEN_ROUTE_SERVICE_API_KEY}`
            },
            body: JSON.stringify({
                "coordinates": points,
                "attributes": ["avgspeed"],
                "radiuses": radius
            })
        });

        const data = await response.json();
        // console.log(data);

        return {
            route: data.routes[0].geometry,
            path: points
        };
    } catch (error) {
        throw new Error('Error calculating route: ' + error.message);
    }
}

export async function calcRouteEV(pointsReq, radius, autonomy, safeDistance) {
    let points = [];
    pointsReq.forEach(element => {
        points.push([element[1], element[0]]);
    });
    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `${process.env.OPEN_ROUTE_SERVICE_API_KEY}`
            },
            body: JSON.stringify({
                "coordinates": points,
                "attributes": ["avgspeed"],
                "radiuses": radius
            })
        });
        const routeData = await response.json();
        if (!routeData.routes || routeData.routes.length === 0) {
            throw new Error('No routes found in the response');
        }
        const route = polyline.decode(routeData.routes[0].geometry);

        let totalDistance = 0;
        let rechargePoints = [];

        for (let i = 1; i < route.length; i++) {
            const [lat1, lon1] = route[i - 1];
            const [lat2, lon2] = route[i];
            const segmentDistance = haversineDistance(lat1, lon1, lat2, lon2);
            // console.log('segment: '+segmentDistance);
            // console.log('total: '+totalDistance);

            totalDistance += segmentDistance;

            if (totalDistance >= autonomy - safeDistance) {
                // ICI il faudrais recalculer le trajer vers la destination
                rechargePoints.push(route[i]);
                // console.log('Target point found: '+route[i]+" at "+totalDistance);
                totalDistance = 0;
            }
        }

        if (!rechargePoints.length) {
            throw new Error('Could not find a point within the given autonomy and safe distance');
        }

        let rechargeStations = [];
        let path = [];
        path.push(points[0]);
        
        for (const point of rechargePoints) {
            let stationFinded = await findNearestStation(point, safeDistance);
            if (!stationFinded) {
                console.log('No station found');
                throw new Error('No station found');
            }
            rechargeStations.push(stationFinded);
            // console.log("Station found: " + stationFinded.fields.geo_point_borne);
            path.push([stationFinded.fields.geo_point_borne[1], stationFinded.fields.geo_point_borne[0]]);
        }
        
        path.push(points[points.length - 1]);

        const response2 = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `${process.env.OPEN_ROUTE_SERVICE_API_KEY}`
            },
            body: JSON.stringify({
                "coordinates": path,
                "attributes": ["avgspeed"],
                "radiuses": radius
            })
        });
        const routeData2 = await response2.json();

        return {
            route: routeData2.routes[0].geometry,
            path: path,
            rechargeStations: rechargeStations
        };
    } catch (error) {
        throw new Error('Error calculating route: ' + error.message);
    }
}
async function getBestStationInRadius(currentPoint, destinationPoint, autonomy, safeDistance) {
    // console.log("(getBestStationInRadius) point: "+currentPoint+" destination: "+destinationPoint+" radius: "+(autonomy-safeDistance));
    let rechargeStations = await fetchRechargingStations(currentPoint[1], currentPoint[0], autonomy, safeDistance);
    let bestStation = [100000000000, null];
    for (let i = rechargeStations.length-1; i > 0; i--) {
        let point = rechargeStations[i].fields.geo_point_borne;
        // console.log("point: "+point, "destination: "+destinationPoint);
        let distance = haversineDistance(destinationPoint[0], destinationPoint[1], point[1], point[0]);
        if(distance < bestStation[0]){
            // console.log(" distance: "+distance, "current best: "+bestStation[0], "point: "+point);
            bestStation = [distance, rechargeStations[i]];
            // let inReach = await isInReachingDistance(currentPoint, [point[1], point[0]], autonomy, safeDistance);
            // if(inReach){
            //     bestStation = [distance, rechargeStations[i]];
            // }
        }
    }
    if(bestStation[1] == null){
        throw new Error('No station found in radius');
    }
    return bestStation;
}

async function isInReachingDistance(currentPoint, targetPoint, autonomy, safeDistance) {
    try{
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `${process.env.OPEN_ROUTE_SERVICE_API_KEY}`
            },
            body: JSON.stringify({
                "coordinates": [currentPoint, targetPoint],
                "attributes": ["avgspeed"],
                "radiuses": radiusConst
            })
        });
        const routeData = await response.json();
        // console.log(routeData);
        const route = polyline.decode(routeData.routes[0].geometry);
    
        let totalDistance = 0;
    
        let reachable = false;
    
        for (let i = 1; i < route.length; i++) {
            const [lat1, lon1] = route[i - 1];
            const [lat2, lon2] = route[i];
            const segmentDistance = haversineDistance(lat1, lon1, lat2, lon2);
    
            totalDistance += segmentDistance;
        }
        if(totalDistance <= autonomy - safeDistance){
            reachable = true;
        }
        return reachable;
    }catch(error){
        console.log("Error: ", error);
        throw new Error('Error calculating distance: ' + error.message);
    }
}

function calcRouteDistance(encodedRoute) {
    // Décoder la route encodée
    const decodedRoute = polyline.decode(encodedRoute);

    let totalDistance = 0;

    for (let i = 1; i < decodedRoute.length; i++) {
        const [lat1, lon1] = decodedRoute[i - 1];
        const [lat2, lon2] = decodedRoute[i];

        const segmentDistance = haversineDistance(lat1, lon1, lat2, lon2);
        totalDistance += segmentDistance;
    }
    console.log("Total distance: " + totalDistance);
    return Math.floor(totalDistance);
}

export async function calcRouteEVSafe(pointsReq, autonomy, safeDistance) {
    let points = [];
    pointsReq.forEach(element => {
        points.push([element[1], element[0]]);
    });
    try {
        let currentPoint = points[0];
        let path = [pointsReq[0]];
        let bornes = [];

        let inReach = await isInReachingDistance(currentPoint, points[points.length - 1], autonomy, safeDistance);

        if (inReach) {
            console.log("Destination reachable without recharge");
            path.push(pointsReq[pointsReq.length - 1]);
            const calcRouteData = await calcRoute(path, radiusConst);
            let distance = calcRouteDistance(calcRouteData.route);
            return {
                route: calcRouteData.route,
                path: path,
                rechargeStations: bornes,
                distance: distance
            };
        }

        let distance = 0;
        let arrived = inReach;

        let maxIterations = 100;
        while (!arrived && maxIterations > 0) {
            let bestStation = await getBestStationInRadius(currentPoint, points[points.length - 1], autonomy, safeDistance)
            if (bestStation[1].fields.geo_point_borne[0] == currentPoint[1] && bestStation[1].fields.geo_point_borne[1] == currentPoint[0]) {
                throw new Error('Same point');
            }
            path.push(bestStation[1].fields.geo_point_borne);
            bornes.push(bestStation[1]);
            currentPoint = [bestStation[1].fields.geo_point_borne[1], bestStation[1].fields.geo_point_borne[0]];

            console.log("Station found: " + currentPoint);
            inReach = await isInReachingDistance(currentPoint, points[points.length - 1], autonomy, safeDistance);
            if (inReach) {
                console.log("Destination reached");
                path.push(pointsReq[pointsReq.length - 1]);
                break;
            }

            maxIterations--;
        }
        if (maxIterations <= 0) {
            throw new Error('Max iterations reached');
        }
        const calcRouteData = await calcRoute(path, radiusConst);
        distance = calcRouteDistance(calcRouteData.route);
        console.log("Distance: " + distance);
        return {
            route: calcRouteData.route,
            path: path,
            rechargeStations: bornes,
            distance: distance
        }

    } catch (error) {
        throw new Error('Error calculating route: ' + error.message);
    }
}

export async function fetchRechargingStations(lat, lon, radius) {
    const url = `https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve&q=&rows=1000&geofilter.distance=${lat},${lon},${radius}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // console.log("lat: "+lat+", lon: "+lon+", radius: "+radius);
        // console.log(response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data.records;
    } catch (error) {
        throw new Error('Error fetching recharging stations: ' + error.message);
    }
}

async function findNearestStation(point, safeDistance) {
    const data = await fetchRechargingStations(point[0], point[1], safeDistance)
    let nearestPoint = null;
    let nearestDistance = safeDistance;
    data.forEach(element => {
        if(element.fields.dist < nearestDistance){
            nearestDistance = element.fields.dist;
            nearestPoint = element;
            // console.log("New nearest station: "+nearestPoint.fields.geo_point_borne+" at "+nearestDistance);
        }
    });
    return nearestPoint;
}