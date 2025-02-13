import fetch from 'node-fetch';

export default async function convertAddressToCoords(address, limit) {
    try {
        let response = null
        if(limit){
            response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.OPEN_ROUTE_SERVICE_API_KEY}&text=${address}&boundary.country=${limit}`);
        }
        else{
            response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.OPEN_ROUTE_SERVICE_API_KEY}&text=${address}`);
        }
        const data = await response.json();
        
        return [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];
    } catch (error) {
        throw new Error('Error converting address');
    }
}