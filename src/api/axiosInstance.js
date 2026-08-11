import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // 백엔드 포트/prefix에 맞게 조정
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 시 토큰 자동 첨부
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;