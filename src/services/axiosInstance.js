import axios from 'axios';

import { apiUrl } from '../apiUrl';


const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});


export default axiosInstance;
