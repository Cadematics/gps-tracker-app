// ------------------------------------------------------------
// Cloud Function: ingestPosition
// ------------------------------------------------------------

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Limit cost: max 10 concurrent containers
setGlobalOptions({ maxInstances: 10 });

// Init Firebase Admin
initializeApp();
const db = getFirestore();

// PostgreSQL Connection Pool (Supabase)
const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DATABASE,
  port: 5432,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "certs", "prod-ca-2021.crt")),
  },
});

// ------------------------------------------------------------
// Main Function
// ------------------------------------------------------------

exports.ingestPosition = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { deviceId, lat, lng, speed, battery, ignition, timestamp } = req.body;

  if (!deviceId || !lat || !lng || !timestamp) {
    return res.status(400).send("Missing required fields");
  }

  logger.info(`Received data: ${JSON.stringify(req.body)}`, {
    structuredData: true,
  });

  try {
    // ------------------------------------------------------------
    // 1. Fetch device from Firestore
    // ------------------------------------------------------------
    const deviceRef = db.collection("devices").doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists) {
      logger.error(`Device not found in Firestore: ${deviceId}`);
      return res.status(404).send("Device not registered");
    }

    const deviceData = deviceSnap.data();
    const companyId = deviceData.companyId;

    if (!companyId) {
      logger.error(`Device ${deviceId} has no companyId`);
      return res.status(500).send("Device missing companyId");
    }

    // ------------------------------------------------------------
    // 2. Update Firestore lastPosition
    // ------------------------------------------------------------
    const newPosition = {
      lat,
      lng,
      speed: speed || 0,
      battery: battery ?? null,
      ignition: ignition ?? null,
      timestamp: new Date(timestamp),
    };

    await deviceRef.update({
      lastPosition: newPosition,
      updatedAt: new Date(),
    });

    // ------------------------------------------------------------
    // 3. Insert into Supabase PostgreSQL
    // ------------------------------------------------------------
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO positions (
        company_id, device_id, lat, lng, speed, battery, ignition, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const insertValues = [
      companyId,
      deviceId,
      lat,
      lng,
      speed ?? null,
      battery ?? null,
      ignition ?? null,
      new Date(timestamp),
    ];

    await client.query(insertQuery, insertValues);
    client.release();

    // ------------------------------------------------------------
    // OK
    // ------------------------------------------------------------
    return res.status(200).send("Data ingested successfully");
  } catch (err) {
    logger.error("Internal ingestion error", err);
    return res.status(500).json({
      error: "Internal ingestion error",
      details: err.message,
    });
  }
});
