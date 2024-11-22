const socketClient = io();

// Populate the drivers dropdown
socketClient.emit("getDrivers");
socketClient.on("driversList", (drivers) => {
    const driverSelect = document.querySelector("#driverSelect");
    drivers.forEach((driver) => {
        const option = document.createElement("option");
        option.value = driver.id;
        option.textContent = `${driver.nom} ${driver.prenom}`;
        driverSelect.appendChild(option);
    });
});

// Populate the vehicles dropdown
socketClient.emit("getVehicles");
socketClient.on("vehiclesList", (vehicles) => {
    const vehicleSelect = document.querySelector("#vehicleSelect");
    vehicles.forEach((vehicle) => {
        const option = document.createElement("option");
        option.value = vehicle.id;
        option.textContent = `${vehicle.modele} - ${vehicle.immatriculation}`;
        vehicleSelect.appendChild(option);
    });
});

// Associate driver and vehicle
document.querySelector("#submitButton").addEventListener("click", () => {
    const driverId = document.querySelector("#driverSelect").value;
    const vehicleId = document.querySelector("#vehicleSelect").value;

    if (driverId && vehicleId) {
        socketClient.emit("associateDriverVehicle", { driverId, vehicleId });

        // Fetch and display updated associations
        socketClient.emit("getDriverVehicleAssociations");
    } else {
        alert("Please select both a driver and a vehicle.");
    }
});

// Listen for driver-vehicle associations and display them
socketClient.on("driverVehicleAssociations", (associations) => {
    const associationDisplay = document.querySelector("#associationDisplay");
    associationDisplay.innerHTML = ""; // Clear existing list

    // Ensure the first association is bold and displayed at the top
    associations.forEach(({ driverName, vehicleReg }, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";

        if (index === 0) {
            listItem.style.fontWeight = "bold"; // Make the most recent entry bold
        }

        listItem.textContent = `${driverName} - ${vehicleReg}`;
        associationDisplay.appendChild(listItem);
    });
});