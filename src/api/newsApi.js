import axiosInstance from './axiosInstance';

//최근 뉴스 조회
export const getLatestNews = () => axiosInstance.get('/ai/news/latest');

//뉴스 종목 추천
export const getTrendingStocks = () => axiosInstance.get('/ai/news/trending');