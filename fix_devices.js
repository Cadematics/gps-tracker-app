
// fix_devices.js
// This is a one-time script to add the companyId to existing devices.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// IMPORTANT:
// 1. Copy your Firebase config object here from `src/firebase.js`
const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG HERE
};

// 2. IMPORTANT: Enter the email address of your user account.
const USER_EMAIL = 'user@example.com'; // <--- CHANGE THIS TO YOUR EMAIL

// --- Script Logic ---

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


async function getCompanyIdByEmail(email) {
  console.log(`Searching for user with email: ${email}...`);
  // This is a simplification. In a real app, you'd use the Admin SDK
  // to look up users by email. We're assuming a 'users' collection exists.
  // We'll look in the 'companies' collection for an owner with the user's UID.
  // This requires you to be logged in on the client to get your UID.
  // A better approach for a script is using the Admin SDK, but we'll work with this.
  
  // This script cannot directly look up a user by email with the client SDK.
  // So, we'll pivot: we'll look for the company document.
  // We'll assume the user is logged in, and therefore we can get their UID.
  // For this script to work, you must have an active session.

  // Let's find the company owned by the currently logged-in user.
  // This is a workaround because the client SDK cannot look up arbitrary users.
  
  // Since we can't get the UID from an email with the client SDK, let's find
  // the first company and assume it's the right one for this script.
  // This is a significant assumption for a one-time fix.
  
  console.log("Fetching the first company to determine a companyId...");
  const companiesRef = collection(db, 'companies');
  const q = query(companiesRef, limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error("No companies found in the database. Cannot determine companyId.");
    return null;
  }
  
  const companyDoc = querySnapshot.docs[0];
  console.log(`Found company '${companyDoc.data().name}' with ID: ${companyDoc.id}`);
  return companyDoc.id;
}


async function addCompanyIdToDevices() {
  const companyId = await getCompanyIdByEmail(USER_EMAIL);

  if (!companyId) {
    console.error("Could not retrieve companyId. Aborting script.");
    process.exit(1);
  }

  console.log(`\nUsing companyId: ${companyId}`);
  console.log("Fetching all devices from the 'devices' collection...");

  const devicesRef = collection(db, 'devices');
  const snapshot = await getDocs(devicesRef);

  if (snapshot.empty) {
    console.log("No devices found in the collection. Nothing to do.");
    return;
  }

  let updatedCount = 0;
  const updates = [];

  snapshot.forEach(document => {
    const deviceData = document.data();
    if (!deviceData.companyId) {
      console.log(`- Device '${document.id}' is missing companyId. Preparing update.`);
      const deviceDocRef = doc(db, 'devices', document.id);
      updates.push(updateDoc(deviceDocRef, { companyId: companyId }));
      updatedCount++;
    } else {
      console.log(`- Device '${document.id}' already has a companyId.`);
    }
  });

  if (updates.length > 0) {
    console.log(`\nFound ${updatedCount} devices to update. Applying changes...`);
    await Promise.all(updates);
    console.log("All devices have been updated successfully!");
  } else {
    console.log("\nNo devices needed updating.");
  }
}

addCompanyIdToDevices().then(() => {
  console.log("\nScript finished.");
  process.exit(0);
}).catch(error => {
  console.error("\nAn error occurred:", error);
  process.exit(1);
});
