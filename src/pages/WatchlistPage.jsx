import { useEffect, useState } from 'react';
import { getWatchlist, addWatchlist, deleteWatchlist } from '../api/watchlistApi';
import { useAuth } from '../context/AuthContext';
import './WatchlistPage.css';

export default function WatchlistPage() {
    const [items, setItems] = useState([]);
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { logout } = useAuth();

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const response = await getWatchlist();
            setItems(response.data.data ?? []);
        } catch (err) {
            setError('목록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await addWatchlist(symbol, name, targetPrice ? Number(targetPrice) : null);
            setSymbol('');
            setName('');
            setTargetPrice('');
            fetchWatchlist();
        } catch (err) {
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || '종목 추가에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));  // 먼저 UI 반영
        try {
            await deleteWatchlist(id);
        } catch {
            fetchWatchlist();  // 실패 시 롤백
        }
    };

    return (
        <div className="watchlist-page">
            <header className="watchlist-header">
                <h1>Stockly</h1>
                <button className="logout-btn" onClick={logout}>로그아웃</button>
            </header>

            <form className="watchlist-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    placeholder="종목코드 (예: AAPL)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="종목명"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="목표가 (선택)"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    step="0.01"
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '추가 중...' : '추가'}
                </button>
            </form>

            {error && <p className="watchlist-error">{error}</p>}

            {isLoading ? (
                <p className="watchlist-empty">불러오는 중...</p>
            ) : items.length === 0 ? (
                <p className="watchlist-empty">등록된 관심 종목이 없습니다.</p>
            ) : (
                <ul className="watchlist-list">
                    {items.map((item) => (
                        <li key={item.id} className="watchlist-item">
                            <div>
                                <span className="watchlist-symbol">{item.symbol}</span>
                                <span className="watchlist-name">{item.name}</span>
                            </div>
                            <div className="watchlist-target">
                                {item.targetPrice != null ? `목표가 ${item.targetPrice}` : '목표가 미설정'}
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete(item.id)}>삭제</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}