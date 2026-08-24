import { useEffect, useState } from 'react';
import { getWatchlist, addWatchlist, deleteWatchlist, updateTargetPrice } from '../api/watchlistApi';
import { getStockPrices } from '../api/stockApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './WatchlistPage.css';

export default function WatchlistPage() {
    const [items, setItems] = useState([]);
    const [prices, setPrices] = useState({});
    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const { logout } = useAuth();

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const response = await getWatchlist();
            const list = response.data.data ?? [];
            setItems(list);
            if (list.length > 0) {
                fetchPrices(list.map((item) => item.symbol));
            }
        } catch (err) {
            setError('목록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrices = async (symbols) => {
        try {
            const response = await getStockPrices(symbols);
            const priceList = response.data.data ?? [];
            const priceMap = {};
            priceList.forEach((p) => {
                priceMap[p.symbol] = p;
            });
            setPrices(priceMap);
        } catch (err) {
            console.error('시세 조회 실패', err);
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
        setItems((prev) => prev.filter((item) => item.id !== id));
        try {
            await deleteWatchlist(id);
        } catch {
            fetchWatchlist();
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditValue(item.targetPrice ?? '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (id) => {
        if (editValue === '' || isNaN(Number(editValue))) {
            setError('목표가를 입력해주세요.');
            cancelEdit();
            return;
        }

        const newPrice = Number(editValue);
        const prevItems = items;

        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, targetPrice: newPrice } : item))
        );
        setEditingId(null);

        try {
            await updateTargetPrice(id, newPrice);
        } catch (err) {
            setItems(prevItems);
            setError('목표가 수정에 실패했습니다.');
        }
    };

    return (
        <div className="watchlist-page">
            <header className="watchlist-header">
                <h1>Stockly</h1>
                <nav>
                    <Link to="/news" className="nav-link">뉴스</Link>
                    <button className="logout-btn" onClick={logout}>로그아웃</button>
                </nav>
            </header>

            <form className="watchlist-form" onSubmit={handleAdd}>
                <input type="text" placeholder="종목코드 (예: AAPL)" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
                <input type="text" placeholder="종목명" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="number" placeholder="목표가 (선택)" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} step="0.01" />
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? '추가 중...' : '추가'}</button>
            </form>

            {error && <p className="watchlist-error">{error}</p>}

            {isLoading ? (
                <p className="watchlist-empty">불러오는 중...</p>
            ) : items.length === 0 ? (
                <p className="watchlist-empty">등록된 관심 종목이 없습니다.</p>
            ) : (
                <ul className="watchlist-list">
                    {items.map((item) => {
                        const price = prices[item.symbol];
                        const isUp = price && price.change > 0;
                        const isDown = price && price.change < 0;

                        return (
                            <li key={item.id} className="watchlist-item">
                                <div>
                                    <span className="watchlist-symbol">{item.symbol}</span>
                                    <span className="watchlist-name">{item.name}</span>
                                </div>

                                {price ? (
                                    <div className={`watchlist-price ${isUp ? 'up' : isDown ? 'down' : ''}`}>
                                        <span className="price-current">{price.price.toFixed(2)}</span>
                                        <span className="price-change">
                      {price.change > 0 ? '+' : ''}
                                            {price.change.toFixed(2)} ({price.changePercent.toFixed(2)}%)
                    </span>
                                    </div>
                                ) : (
                                    <span className="price-loading">시세 조회 중...</span>
                                )}

                                <div className="watchlist-target">
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            className="target-edit-input"
                                            value={editValue}
                                            step="0.01"
                                            autoFocus
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => saveEdit(item.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(item.id);
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                        />
                                    ) : (
                                        <span className="target-display" onClick={() => startEdit(item)}>
                                            {item.targetPrice != null ? `목표가 ${item.targetPrice}` : '목표가 설정'}
                                        </span>
                                    )}
                                </div>
                                <button className="delete-btn" onClick={() => handleDelete(item.id)}>삭제</button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}