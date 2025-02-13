import { Router } from 'express';
import express from 'express';
import http from 'http';
import xml2js from 'xml2js';
import snapPoints from './utils/snapPoints.js';
import { calcRoute, fetchRechargingStations, calcRouteEVSafe, calcRouteEV } from './utils/calcRoute.js';
import convertAddressToCoords from './utils/convertAddres.js';
import getCars from './utils/getCars.js';
import soap from 'soap';

const router = Router();
const radius = 350;
router.use(express.json());

router.post('/snapPoints', async (req, res) => {
    let pointsReq = JSON.parse(req.body.points);

    try {
        const data = await snapPoints(pointsReq, radius);
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/getRoute', async (req, res) => {
    let pointsReq = req.body.points;

    try {
        const data = await calcRoute(pointsReq, radius);
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/getRouteEV', async (req, res) => {
    const pointsReq = req.body.points;
    const autonomy = req.body.autonomy;
    const safeDistance = req.body.safeDistance;

    try {
        const data = await calcRouteEVSafe(pointsReq, autonomy, safeDistance);
        // console.log(data);
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/fetchRechargingStations', async (req, res) => {
    const radius = req.body.radius;
    const lat = req.body.lat;
    const lon = req.body.lon;

    try {
        const data = await fetchRechargingStations(lat, lon, radius);
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/convertAddressToCoords', async (req, res) => {
    const address = req.body.address;
    let limit = 'FR'
    if(req.body.limit){
        limit = req.body.limit;
    }

    try {
        const data = await convertAddressToCoords(address, limit);
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/getCarsList', async (req, res) => {
    try {
        const data = await getCars();
        res.json(data);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/calcTemp', (req, res) => {
    const distance = req.body.distance;
    const rechargeTime = req.body.rechargeTime;
    const autonomy = req.body.autonomy;

    const args = { distance, rechargeTime, autonomy };

    // Create the SOAP client and call the calcTemp function
    soap.createClient(process.env.SOAP_API_URL, (err, client) => {
        if (err) {
            console.error('Error creating SOAP client temp:', err);
            return res.status(500).json({ error: 'Failed to create SOAP client' });
        }

        // Call the calcTemp function from the SOAP API
        client.calcTemp(args, (err, result) => {
            if (err) {
                console.error('Error calling SOAP API:', err);
                return res.status(500).json({ error: 'Failed to call SOAP API' });
            }

            // Send the SOAP API response back to the client
            console.log("Temps: "+result.calcTempResult/3600);
            res.json(result);
        });
    });
});

router.post('/calcPrice', (req, res) => {
    const distance = req.body.distance;

    const args = { distance };

    // Create the SOAP client and call the calcPrice function
    soap.createClient(process.env.SOAP_API_URL, (err, client) => {
        if (err) {
            console.error('Error creating SOAP client:', err);
            return res.status(500).json({ error: 'Failed to create SOAP client' });
        }

        // Call the calcPrice function from the SOAP API
        client.calcPrice(args, (err, result) => {
            if (err) {
                console.error('Error calling SOAP API price:', err);
                return res.status(500).json({ error: 'Failed to call SOAP API' });
            }

            // Send the SOAP API response back to the client
            console.log("Price: "+result.calcPriceResult);
            res.json(result);
        });
    });
});


export default router;