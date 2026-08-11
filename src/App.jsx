import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WatchlistPage from './pages/WatchlistPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<WatchlistPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;