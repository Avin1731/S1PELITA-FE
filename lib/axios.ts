import Axios from 'axios';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    // --- PENTING: MATIKAN 2 BARIS INI (KITA PAKAI TOKEN MANUAL) ---
    // withCredentials: true,
    // withXSRFToken: true,
});

export default axios;