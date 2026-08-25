import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWatchlist } from '../api/watchlistApi';
import { getStockHistory } from '../api/stockApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './ChartPage.css';

const COLORS = ['#e8b44d', '#2ecc71', '#e74c3c', '#5dade2', '#af7ac5', '#f39c12'];

export default function ChartPage() {
    const [watchlist, setWatchlist] = useState([]);
    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { logout } = useAuth();

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const response = await getWatchlist();
                const list = response.data.data ?? [];
                setWatchlist(list);
                setSelectedSymbols(list.slice(0, 3).map((item) => item.symbol)); // 기본 3개 선택
            } catch (err) {
                setError('관심종목을 불러오지 못했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

    useEffect(() => {
        if (selectedSymbols.length === 0) {
            setChartData([]);
            return;
        }

        const fetchHistories = async () => {
            try {
                const responses = await Promise.all(
                    selectedSymbols.map((symbol) => getStockHistory(symbol))
                );

                // 날짜 기준으로 병합: { date, AAPL: 210.5, MSFT: 480.2, ... }
                const merged = {};
                responses.forEach((response, i) => {
                    const symbol = selectedSymbols[i];
                    const points = response.data.data ?? [];
                    points.forEach((point) => {
                        if (!merged[point.date]) merged[point.date] = { date: point.date };
                        merged[point.date][symbol] = point.close;
                    });
                });

                const sorted = Object.values(merged).sort((a, b) => a.date.localeCompare(b.date));
                setChartData(sorted);
            } catch (err) {
                setError('시세 데이터를 불러오지 못했습니다.');
            }
        };

        fetchHistories();
    }, [selectedSymbols]);

    const toggleSymbol = (symbol) => {
        setSelectedSymbols((prev) =>
            prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
        );
    };

    return (
        <div className="chart-page">
            <header className="chart-header">
                <Link to="/" className="back-link">← 관심종목으로</Link>
                <h1>Stockly</h1>
                <button className="logout-btn" onClick={logout}>로그아웃</button>
            </header>

            {isLoading ? (
                <p className="chart-empty">불러오는 중...</p>
            ) : watchlist.length === 0 ? (
                <p className="chart-empty">등록된 관심 종목이 없습니다.</p>
            ) : (
                <>
                    <div className="symbol-toggle-list">
                        {watchlist.map((item, i) => (
                            <button
                                key={item.symbol}
                                className={`symbol-toggle ${selectedSymbols.includes(item.symbol) ? 'active' : ''}`}
                                style={selectedSymbols.includes(item.symbol) ? { borderColor: COLORS[selectedSymbols.indexOf(item.symbol) % COLORS.length] } : {}}
                                onClick={() => toggleSymbol(item.symbol)}
                            >
                                {item.symbol}
                            </button>
                        ))}
                    </div>

                    {error && <p className="chart-error">{error}</p>}

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                                <XAxis dataKey="date" stroke="#8a92a6" fontSize={11} />
                                <YAxis stroke="#8a92a6" fontSize={11} />
                                <Tooltip
                                    contentStyle={{ background: '#1b1f27', border: '1px solid #2a2f3a', borderRadius: '3px' }}
                                    labelStyle={{ color: '#f2f3f5' }}
                                />
                                <Legend />
                                {selectedSymbols.map((symbol, i) => (
                                    <Line
                                        key={symbol}
                                        type="monotone"
                                        dataKey={symbol}
                                        stroke={COLORS[i % COLORS.length]}
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}