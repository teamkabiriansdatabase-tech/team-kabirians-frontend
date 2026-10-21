import api from './api';

export interface UploadOptions {
  file: File;
  uploadType?: 'Payment' | 'Video' | 'Cover' | 'RuleBook' | string;
  eventId?: string;
  categoryId?: string;
  teamId?: string;
  onProgress?: (percent: number) => void;
}

export async function uploadDirectToCloudinary(options: UploadOptions) {
  const { file, uploadType = 'Payment', eventId = 'general', categoryId = 'general', teamId = 'general', onProgress } = options;

  const sigRes = await api.post('/upload/signature', { uploadType, eventId, categoryId, teamId });
  const data = sigRes.data?.data || sigRes.data;
  const { signature, timestamp, apiKey, cloudName, folder } = data;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  let resourceType = 'image';
  if (uploadType === 'Video') resourceType = 'video';
  else if (uploadType === 'RuleBook' || isPdf) resourceType = 'raw';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  if (folder) formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Cloudinary Network Connection Failed'));
    xhr.send(formData);
  });
}