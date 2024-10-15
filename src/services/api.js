import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:44332/api',
});

export default api;
