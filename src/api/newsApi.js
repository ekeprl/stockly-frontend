import axiosInstance from './axiosInstance';

export const getLatestNews = () => axiosInstance.get('/ai/news/latest');