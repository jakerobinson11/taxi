import express from "express";
import * as mysql from "mysql2";
import http from "http";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.Server(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ["http://127.0.0.1:4000"],
    },
});

// MySQL connection setup
const connectSql = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "taxi",
});

connectSql.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
        process.exit(1);
    }
    console.log("Connected to the database.");
});

io.on("connection", (socketServer) => {
    console.log("New client connected:", socketServer.id);

    // Get all drivers
    socketServer.on("getDrivers", () => {
        const getDriversQuery = `SELECT id_conducteur AS id, nom, prenom FROM conducteur`;
        connectSql.query(getDriversQuery, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            socketServer.emit("driversList", results);
        });
    });

    // Get all vehicles
    socketServer.on("getVehicles", () => {
        const getVehiclesQuery = `SELECT id_vehicule AS id, modele, immatriculation FROM vehicule`;
        connectSql.query(getVehiclesQuery, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            socketServer.emit("vehiclesList", results);
        });
    });

    // Associate a driver and a vehicle
    socketServer.on("associateDriverVehicle", ({ driverId, vehicleId }) => {
        const associateQuery = `
            INSERT INTO association_vehicule_conducteur (id_conducteur, id_vehicule) 
            VALUES (?, ?)`;
        connectSql.query(associateQuery, [driverId, vehicleId], (err) => {
            if (err) {
                console.error(err);
                return;
            }
            socketServer.emit("associationSuccess", { driverId, vehicleId });
        });
    });

    // Get associated drivers and vehicles
    socketServer.on("getDriverVehicleAssociations", () => {
      const query = `
          SELECT c.nom AS driverName, v.immatriculation AS vehicleReg 
          FROM association_vehicule_conducteur avc
          JOIN conducteur c ON avc.id_conducteur = c.id_conducteur
          JOIN vehicule v ON avc.id_vehicule = v.id_vehicule
          ORDER BY avc.id_association DESC`; // Sort by most recent association
      connectSql.query(query, (err, results) => {
          if (err) {
              console.error("Error fetching associations:", err);
              socketServer.emit("errorFetchingAssociations", { message: "Unable to fetch associations." });
              return;
          }
          socketServer.emit("driverVehicleAssociations", results); 
      });
  });
});

app.use(express.static("./public"));

const port = 4000;
server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});