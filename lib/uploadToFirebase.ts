import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Uploads a file directly to Firebase Storage Bucket.
 * @param file The file to upload (Image, PDF, or Video)
 * @param folder Target folder inside storage (e.g. 'slips' or 'videos')
 * @param onProgress Callback returning upload % (0 to 100)
 */
export async function uploadToFirebase(
  file: File,
  folder: 'slips' | 'videos' = 'slips',
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) throw new Error('No file provided');

  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, path);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase upload error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}