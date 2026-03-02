import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Profiles from './pages/Profiles';
import SuccessStories from './pages/SuccessStories';
import Membership from './pages/Membership';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import PaymentSuccess from './pages/PaymentSuccess';
import MyProfile from './pages/MyProfile';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/stories" element={<SuccessStories />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
