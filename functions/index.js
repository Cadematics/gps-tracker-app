// ------------------------------------------------------------
// Cloud Function: ingestPosition
// ------------------------------------------------------------

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
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
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  // Use 'let' to allow modification
  let { deviceId, points, ...singlePoint } = req.body;

  // 1. Validation & Sanitization
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).send({ error: "Missing or invalid required field: deviceId" });
  }
  
  // Trim whitespace from deviceId to prevent errors
  deviceId = deviceId.trim();

  const isBatch = points && Array.isArray(points);
  let payload = [];

  if (isBatch) {
    if (points.length === 0) {
      return res.status(400).send({ error: "Batch payload cannot have an empty 'points' array." });
    }
    payload = points;
  } else if (singlePoint.lat && singlePoint.lng && singlePoint.timestamp) {
    payload = [singlePoint];
  } else {
    return res.status(400).send({ error: "Payload must be a single point with lat/lng/timestamp or a batch with a 'points' array." });
  }

  for (const point of payload) {
    if (point.lat == null || point.lng == null || !point.timestamp) {
      return res.status(400).send({ error: "All points must include lat, lng, and timestamp." });
    }
  }

  logger.info(`Ingesting ${payload.length} points for device ID '${deviceId}'`, { structuredData: true });

  try {
    // 2. Find Firestore device (Resilient Method)
    const devicesCollection = db.collection("devices");
    let deviceDoc;

    const deviceQuery = await devicesCollection.where("deviceId", "==", deviceId).limit(1).get();
    
    if (!deviceQuery.empty) {
        deviceDoc = deviceQuery.docs[0];
    } else {
        logger.warn(`Could not find device by field 'deviceId'. Falling back to lookup by document ID: ${deviceId}`);
        const docRef = devicesCollection.doc(deviceId);
        deviceDoc = await docRef.get();
    }

    if (!deviceDoc || !deviceDoc.exists) {
        logger.info(`Device lookup failed for deviceId='${deviceId}'`, { structuredData: true });
        logger.error(`Device not found for ID: '${deviceId}'. Check for typos or registration issues.`);
        return res.status(404).send({ error: "Device not registered" });
    }

    const deviceRef = deviceDoc.ref;
    const companyId = deviceDoc.data().companyId;

    if (!companyId) {
      logger.error(`Device ${deviceDoc.id} is missing companyId.`);
      return res.status(500).send({ error: "Configuration error: Device is missing companyId" });
    }

    // 3. Bulk insert all points into Supabase
    const client = await pool.connect();
    try {
      const values = [];
      const valuePlaceholders = [];
      let paramCounter = 1;

      for (const point of payload) {
        valuePlaceholders.push(
          `($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`
        );
        values.push(
          companyId,
          deviceId,
          point.lat,
          point.lng,
          point.speed ?? null,
          point.battery ?? null,
          point.ignition ?? false,
          new Date(point.timestamp)
        );
      }

      const insertQuery = `
          INSERT INTO positions (
              company_id, device_id, lat, lng, speed, battery, ignition, "timestamp"
          ) VALUES ${valuePlaceholders.join(", ")}
      `;
      
      await client.query(insertQuery, values);
    } finally {
      client.release();
    }

    // 4. Update Firestore device with the most recent position
    const latestPoint = payload.reduce((latest, current) => 
      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
    );

    await deviceRef.update({
      lastPosition: {
        lat: latestPoint.lat,
        lng: latestPoint.lng,
        speed: latestPoint.speed || 0,
        battery: latestPoint.battery ?? null,
        ignition: latestPoint.ignition ?? false,
        timestamp: new Date(latestPoint.timestamp),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. Respond with success
    return res.status(200).json({ inserted: payload.length });

  } catch (err) {
    logger.error("Internal ingestion error", { error: err.message, stack: err.stack });
    return res.status(500).json({
      error: "Internal database or processing error",
      details: err.message,
    });
  }
});

// ------------------------------------------------------------
// Debug Function
// ------------------------------------------------------------

exports.debugDevice = onRequest(async (req, res) => {
  if (req.method !== "GET") {
      return res.status(405).send({ error: "Method Not Allowed" });
  }

  const receivedDeviceId = req.query.deviceId;

  if (!receivedDeviceId) {
      return res.status(400).send({ error: "Missing required query parameter: deviceId" });
  }

  try {
      const devicesCollection = db.collection("devices");
      const snapshot = await devicesCollection.where("deviceId", "==", receivedDeviceId).get();

      const docIds = snapshot.docs.map(doc => doc.id);
      let firstDocData = null;

      if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0].data();
          // Sanitize the output to only include safe fields
          firstDocData = {
              deviceId: firstDoc.deviceId,
              companyId: firstDoc.companyId,
              name: firstDoc.name,
              createdAt: firstDoc.createdAt,
              updatedAt: firstDoc.updatedAt
          };
      }

      return res.status(200).json({
          receivedDeviceId: receivedDeviceId,
          matches: snapshot.size,
          docIds: docIds,
          firstDoc: firstDocData
      });

  } catch (err) {
      logger.error("Error in debugDevice function", { error: err.message, stack: err.stack });
      return res.status(500).json({
          error: "Internal server error during debug",
          details: err.message
      });
  }
});
