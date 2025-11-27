import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export { db };

export const getCompanyById = async (companyId) => {
  const companyRef = doc(db, 'companies', companyId);
  const companySnap = await getDoc(companyRef);
  return companySnap.exists() ? companySnap.data() : null;
};

export const getCompanyByOwner = async (userId) => {
  const q = query(collection(db, 'companies'), where('ownerUserId', '==', userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } else {
    return null;
  }
};

export const getDevicesByCompany = async (companyId) => {
  const querySnapshot = await getDocs(getDevicesQueryByCompany(companyId));
  const devices = [];
  querySnapshot.forEach((doc) => {
    devices.push({ id: doc.id, ...doc.data() });
  });
  return devices;
};

export const getDeviceById = (deviceId) => {
  return doc(db, 'devices', deviceId);
};

export const createCompany = async (companyId, data) => {
  const companyRef = doc(db, 'companies', companyId);
  await setDoc(companyRef, data);
};

export const updateCompany = async (companyId, data) => {
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, data);
}

export const createDevice = async (deviceId, data) => {
  const deviceRef = doc(db, 'devices', deviceId);
  await setDoc(deviceRef, data);
};

export const deviceExists = async (deviceId) => {
  const deviceRef = doc(db, 'devices', deviceId);
  const deviceSnap = await getDoc(deviceRef);
  return deviceSnap.exists();
};

// Query builders for real-time hooks
export const getDevicesQueryByCompany = (companyId) => {
  const devicesRef = collection(db, 'devices');
  return query(devicesRef, where('companyId', '==', companyId));
};

export const getAlertsQueryByCompany = (companyId) => {
  const alertsRef = collection(db, 'alerts');
  return query(alertsRef, where('companyId', '==', companyId));
};
