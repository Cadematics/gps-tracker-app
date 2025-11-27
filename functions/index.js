/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const {initializeApp} = require("firebase-admin/app");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

initializeApp();

// Supabase connection pool
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


exports.ingestPosition = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const {deviceId, lat, lng, timestamp} = req.body;

  if (!deviceId || !lat || !lng || !timestamp) {
    res.status(400).send('Missing required fields');
    return;
  }

  logger.info(`Received data: ${JSON.stringify(req.body)}`, {structuredData: true});

  try {
    const client = await pool.connect();
    const query = 'INSERT INTO locations (device_id, lat, lng, timestamp) VALUES ($1, $2, $3, $4)';
    const values = [deviceId, lat, lng, new Date(timestamp)];
    await client.query(query, values);
    client.release();
    res.status(200).send('Data ingested successfully');
  } catch (error) {
    logger.error('Error ingesting data', error);
    res.status(500).send('Error ingesting data');
  }
});
