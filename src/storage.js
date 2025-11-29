import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export const uploadCompanyLogo = async (companyId, file) => {
  // Correct the path to be consistent and not include the original filename.
  const storageRef = ref(storage, `company_logos/${companyId}.png`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
