import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { InstallBanner } from './components/InstallBanner';
import { OptimizerPage } from './pages/OptimizerPage';
import { AccountPage } from './pages/AccountPage';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Header onAuthClick={() => setAuthModalOpen(true)} />
      <InstallBanner />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<OptimizerPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AuthProvider>
  );
}

export default App;
