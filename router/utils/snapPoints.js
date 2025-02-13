import fetch from 'node-fetch';

export default async function snapPoints(pointsReq, radius) {
    let points = [];
    pointsReq.forEach(element => {
        points.push([element[1], element[0]]);
    });

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/snap/driving-car', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `${process.env.OPEN_ROUTE_SERVICE_API_KEY}`
            },
            body: JSON.stringify({
                "locations": points,
                "radius": radius
            })
        });

        const data = await response.json();

        return data;
    } catch (error) {
        throw new Error('Error snapping points');
    }
}