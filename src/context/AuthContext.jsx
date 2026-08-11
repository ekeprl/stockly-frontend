import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

    const login = (token) => {
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{ accessToken, isAuthenticated: !!accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}