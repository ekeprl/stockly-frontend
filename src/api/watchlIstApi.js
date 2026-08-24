import axiosInstance from './axiosInstance';

export const getWatchlist = () => axiosInstance.get('/watchlist');

export const addWatchlist = (symbol, name, targetPrice) =>
    axiosInstance.post('/watchlist', { symbol, name, targetPrice });

export const deleteWatchlist = (id) => axiosInstance.delete(`/watchlist/${id}`);

export const updateTargetPrice = (id, targetPrice) =>
    axiosInstance.put(`/watchlist/${id}`, { targetPrice });