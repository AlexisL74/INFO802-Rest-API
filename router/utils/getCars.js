import fetch from 'node-fetch';
export default async function getCars() {
    try {
        const response = await fetch('https://api.chargetrip.io/graphql', {
            method: 'POST',
            headers: {
                'x-client-id': `${process.env.CHERGERTRIP_CLIENT_ID}`,
                'x-app-id': `${process.env.CHERGERTRIP_APP_ID}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    query vehicleListAll {
                        vehicleList {
                            id
                            naming {
                                make
                                model
                                version
                                edition
                                chargetrip_version
                            }
                            connectors {
                                standard
                                power
                                max_electric_power
                                time
                                speed
                            }
                            adapters {
                                standard
                                power
                                max_electric_power
                                time
                                speed
                            }
                            battery {
                                usable_kwh
                                full_kwh
                            }
                            range {
                                chargetrip_range {
                                    best
                                    worst
                                }
                            }
                            media {
                                image {
                                    id
                                    type
                                    url
                                    height
                                    width
                                }
                                brand {
                                    id
                                    type
                                    url
                                    height
                                    width
                                }
                            }
                        }
                    }
                `
            })
        });

        const data = await response.json();
        return data.data.vehicleList;
    } catch (error) {
        throw new Error('Error fetching cars');
    }
}