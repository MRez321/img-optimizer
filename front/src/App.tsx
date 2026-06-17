import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { OptimizerPage } from './pages/OptimizerPage';
import { AccountPage } from './pages/AccountPage';

import DateAndTime from "./components/DateAndTime/DateAndTime";
// import './App.css'

function App() {
    const [authModalOpen, setAuthModalOpen] = useState(false);

    return (
        <AuthProvider>
            <Header onAuthClick={() => setAuthModalOpen(true)} />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<OptimizerPage />} />
                    <Route path="/account" element={<AccountPage />} />
                </Routes>
            </main>
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </AuthProvider>
    );
}

function Rcomp() {
    return (
        <>
            <h4>From Extra Comp</h4>
            <DateAndTime />
        </>
    )
}

export default App;
export { Rcomp }