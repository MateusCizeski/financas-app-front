import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.0.126:5011/',
});

export default api;
