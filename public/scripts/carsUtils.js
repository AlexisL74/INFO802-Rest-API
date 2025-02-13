function carCard(car){
    if(car != null){
        const card = document.createElement('div');
        card.className = "carCard";

        const carImage = document.createElement('img');
        carImage.src = car.media.image.url;
        card.appendChild(carImage);

        const carInfo = document.createElement('div');

        const carName = document.createElement('h6');
        carName.innerHTML = car.naming.make+" - "+car.naming.model+" "+car.naming.version;
        carInfo.appendChild(carName);

        const carRange = document.createElement('p');
        carRange.innerHTML = "Autonomy: "+car.range.chargetrip_range.best+" - "+car.range.chargetrip_range.worst+" km";
        carInfo.appendChild(carRange);

        card.appendChild(carInfo);
        
        // card.addEventListener('click', () => {
        //     currentCar = car;
        // });
        return card;
    }
}

function init_carsList(carsList, carsSelect) {
    if(carsList){
        fetch('http://localhost:3000/api/getCarsList', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(car => {
                const option = document.createElement('option');
                option.value = JSON.stringify(car);
                option.textContent = car.naming.make + " - " + car.naming.model + " "+car.range.chargetrip_range.worst+" km";
                carsSelect.appendChild(option);
            });
        });
    }
}

function init_carsSelect(carsList){
    const carsSelect = document.createElement('select');
    carsList.appendChild(carsSelect);
    init_carsList(carsList, carsSelect);

    carsSelect.addEventListener('change', () => {
        currentCar = JSON.parse(carsSelect.value);
    });

    const currentCarContainer = document.createElement('div');
    currentCarContainer.id = 'currentCarContainer';
    carsList.appendChild(currentCarContainer);

    carsSelect.addEventListener('change', () => {
        currentCar = JSON.parse(carsSelect.value);
        displayCurrentCar(currentCar, currentCarContainer);
    });
}

function displayCurrentCar(currentCar, container) {
    container.innerHTML = ''; // Clear previous content
    if (currentCar) {
        const card = carCard(currentCar);
        container.appendChild(card);
    }
}

