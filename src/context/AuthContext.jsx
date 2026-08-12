// context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(
        () => sessionStorage.getItem('accessToken')
    );

    const login = (accessToken, refreshToken) => {
        sessionStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            sessionStorage.setItem('refreshToken', refreshToken);
        }
        setAccessToken(accessToken);
    };

    const logout = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                isAuthenticated: !!accessToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}