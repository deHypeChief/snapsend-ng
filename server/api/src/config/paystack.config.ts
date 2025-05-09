import axios from 'axios'

const PAYSTACK = axios.create({
    baseURL: 'https://api.paystack.co/',
    headers: {
        'Content-Type': 'application/json', 
    },
})

PAYSTACK.interceptors.request.use(
    (config) => {
      // Append the Authorization header with the Bearer token
      config.headers.Authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
      
      return config;
    },
    (error) => {
      // Handle any error during request setup
      return Promise.reject(error);
    }
);

export default PAYSTACK