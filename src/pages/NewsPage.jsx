import { useEffect, useState } from 'react';
import { getLatestNews } from '../api/newsApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './NewsPage.css';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { logout } = useAuth();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await getLatestNews();
                setNews(response.data.data ?? []);
            } catch (err) {
                setError('뉴스를 불러오지 못했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
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
            ) : news.length === 0 ? (
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
        </div>
    );
}