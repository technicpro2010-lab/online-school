const API_URL = (
  import.meta.env.VITE_API_URL || 'https://online-school-o97t.onrender.com'
).replace(/\/+$/, '');

export const API_BASE = `${API_URL}/api`;

export const storageUrl = (path) => {
  let storagePath = path;

  if (/^https?:\/\//i.test(storagePath)) {
    const parsedUrl = new URL(storagePath);

    if (!['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
      return storagePath;
    }

    storagePath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  storagePath = storagePath.replace(/^\/+/, '').replace(/^storage\//, '');

  return `${API_URL}/storage/${storagePath}`;
};
