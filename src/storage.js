import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export const uploadCompanyLogo = async (companyId, file) => {
  // Correct the path to be consistent and not include the original filename.
  const storageRef = ref(storage, `company_logos/${companyId}.png`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
