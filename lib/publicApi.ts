import axios from 'axios';

// Public requests are deliberately unauthenticated and do not share the portal
// API's local-storage token interceptor or its private-data cache.
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default publicApi;
