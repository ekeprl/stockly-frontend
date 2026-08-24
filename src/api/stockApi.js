import axiosInstance from './axiosInstance';

export const getStockPrices = (symbols) =>
    axiosInstance.get('/stock', {
        params: { symbols: symbols.join(',') },
    });