import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/auth/login', { id, password });
            const { accessToken, refreshToken } = response.data.data;
            login(accessToken, refreshToken);
            navigate('/');
        } catch (err) {
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <svg className="login-spark" viewBox="0 0 64 24" aria-hidden="true">
                        <path d="M2 18 L14 12 L24 16 L36 6 L48 10 L62 3" />
                    </svg>
                    <h1>Stockly</h1>
                </div>
                <p className="login-subtitle">관심 종목을 놓치지 마세요</p>

                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="id">아이디</label>
                        <input
                            id="id"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit" className="login-submit" disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <p className="login-footer">
                    아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
                </p>
            </div>
        </div>
    );
}