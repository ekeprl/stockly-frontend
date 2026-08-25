import axiosInstance from './axiosInstance';

//종목 가격 갖고오기
export const getStockPrices = (symbols) =>
    axiosInstance.get('/stock', {
        params: { symbols: symbols.join(',') },
    });

//종목 비교 그래프
export const getStockHistory = (symbol, range = '1mo', interval = '1d') =>
    axiosInstance.get(`/stock/${symbol}/history`, { params: { range, interval } });