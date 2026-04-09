import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import RequireAuth from './components/RequireAuth';

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
import Contact from './pages/Contact';
import AssistedServices from './pages/AssistedServices';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Matches from './pages/Matches';
import Notifications from './pages/Notifications';
import ProfileVisitors from './pages/ProfileVisitors';
import Shortlists from './pages/Shortlists';
import Suspended from './pages/Suspended';

function App() {
  return (
    <AuthProvider>
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
            <Route path="/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
            <Route path="/payment-success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/matches" element={<RequireAuth><Matches /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/visitors" element={<RequireAuth><ProfileVisitors /></RequireAuth>} />
            <Route path="/shortlists" element={<RequireAuth><Shortlists /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><MyProfile /></RequireAuth>} />
            <Route path="/profile/:uid" element={<RequireAuth><UserProfile /></RequireAuth>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/assisted-services" element={<AssistedServices />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/suspended" element={<Suspended />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
