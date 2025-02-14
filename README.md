# TP INFO802

## Documentation de l'API REST

Cette API fournit diverses fonctionnalités liées à la gestion des itinéraires, des stations de recharge, et des informations sur les véhicules. Elle utilise Express.js pour définir les routes et gérer les requêtes HTTP. <br>
Cette dernière est accessible ici: [https://info802rest-f4fdhuheexacgzbs.francecentral-01.azurewebsites.net/](https://info802rest-f4fdhuheexacgzbs.francecentral-01.azurewebsites.net/)

### Routes
#### Snap Points

    Route: /snapPoints
    Méthode: POST
    Description: Ajuste les points géographiques fournis à un rayon spécifié.
    Paramètres:
        points: Liste de points géographiques au format JSON.
    Réponse:
        data: Points ajustés.

#### Get Route

    Route: /getRoute
    Méthode: POST
    Description: Calcule un itinéraire basé sur les points fournis.
    Paramètres:
        points: Liste de points géographiques.
    Réponse:
        data: Itinéraire calculé.

#### Get Route EV

    Route: /getRouteEV
    Méthode: POST
    Description: Calcule un itinéraire sécurisé pour un véhicule électrique en tenant compte de l'autonomie et de la distance de sécurité.
    Paramètres:
        points: Liste de points géographiques.
        autonomy: Autonomie du véhicule.
        safeDistance: Distance de sécurité.
    Réponse:
        data: Itinéraire calculé.

#### Fetch Recharging Stations

    Route: /fetchRechargingStations
    Méthode: POST
    Description: Récupère les stations de recharge dans un rayon spécifié autour d'un point géographique.
    Paramètres:
        radius: Rayon de recherche.
        lat: Latitude du point central.
        lon: Longitude du point central.
    Réponse:
        data: Liste des stations de recharge.

#### Convert Address to Coordinates

    Route: /convertAddressToCoords
    Méthode: POST
    Description: Convertit une adresse en coordonnées géographiques.
    Paramètres:
        address: Adresse à convertir.
        limit : Limite géographique (par défaut 'FR').
    Réponse:
        data: Coordonnées géographiques.

#### Get Cars List

    Route: /getCarsList
    Méthode: POST
    Description: Récupère la liste des véhicules disponibles.
    Réponse:
        data: Liste des véhicules.

#### Calculate Temperature

    Route: /calcTemp
    Méthode: POST
    Description: Calcule le temps en fonction de la distance, du temps de recharge et de l'autonomie.
    Paramètres:
        distance: Distance parcourue.
        rechargeTime: Temps de recharge.
        autonomy: Autonomie du véhicule.
    Réponse:
        result: Résultat du calcul de température.

#### Calculate Price

    Route: /calcPrice
    Méthode: POST
    Description: Calcule le prix en fonction de la distance.
    Paramètres:
        distance: Distance parcourue.
    Réponse:
        result: Résultat du calcul de prix.

## Documentation du service SOAP

Ce service SOAP est conçu pour effectuer des calculs spécifiques liés aux véhicules électriques. Il permet de déterminer le temps nécessaire pour effectuer un trajet en tenant compte des recharges, ainsi que le coût de la recharge en fonction de la distance parcourue.<br>
Ce dernier est accessible ici: [https://info802soap-e2aebkf9hgaag9f2.francecentral-01.azurewebsites.net/](https://info802soap-e2aebkf9hgaag9f2.francecentral-01.azurewebsites.net/)
### Méthodes
#### Calculate Temps (calcTemp)

    Méthode: calcTemp
    Description: Calcule le temps total nécessaire pour effectuer un trajet, en tenant compte des recharges.
    Paramètres:
        distance (Integer): Distance totale du trajet en kilomètres.
        rechargeTime (Integer): Temps nécessaire pour une recharge en minutes.
        autonomy (Integer): Autonomie du véhicule en kilomètres.
    Retourne:
        Float: Temps total en heures.

#### Calculate Price (calcPrice)

    Méthode: calcPrice
    Description: Calcule le coût de la recharge en fonction de la distance parcourue.
    Paramètres:
        distance (Integer): Distance totale parcourue en kilomètres.
    Retourne:
        Float: Coût total de la recharge en euros.
