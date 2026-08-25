import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getLatestNews, getTrendingStocks } from '../api/newsApi';
import './NewsPage.css';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [trending, setTrending] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { logout } = useAuth();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [newsRes, trendingRes] = await Promise.all([getLatestNews(), getTrendingStocks()]);
                setNews(newsRes.data.data ?? []);
                setTrending(trendingRes.data.data ?? []);
            } catch (err) {
                setError('데이터를 불러오지 못했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="news-page">
            <header className="news-header">
                <Link to="/" className="back-link">← 관심종목으로</Link>
                <h1>Stockly</h1>
                <button className="logout-btn" onClick={logout}>로그아웃</button>
            </header>

            {error && <p className="news-error">{error}</p>}

            {isLoading ? (
                <p className="news-empty">불러오는 중...</p>
            ) : (
                <>
                    {trending.length > 0 && (
                        <section className="trending-section">
                            <h2 className="trending-title">📈 주목할 만한 종목</h2>
                            <ul className="trending-list">
                                {trending.map((stock) => (
                                    <li key={stock.id} className="trending-item">
                                        <span className="trending-name">{stock.name}</span>
                                        <span className="trending-reason">{stock.reason}</span>
                                        {stock.price != null && (
                                            <span className="trending-price">{stock.price.toFixed(2)}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {news.length === 0 ? (
                        <p className="news-empty">표시할 뉴스가 없습니다.</p>
                    ) : (
                        <ul className="news-list">
                            {news.map((item) => (
                                <li key={item.newsId} className="news-item">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-title">
                                        {item.title}
                                    </a>
                                    {item.summary && <p className="news-summary">{item.summary}</p>}
                                    {item.publishedAt && (
                                        <span className="news-date">{item.publishedAt.split('T')[0]}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}