import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplitCard from './components/layout/SplitCard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import RegisterPage from './components/layout/RegisterPage';
import HeroIllustration from './components/layout/HeroIllustration';
import RegisterIllustration from './components/layout/RegisterIllustration';
import ForgotPassword from "./components/auth/ForgotPassword";
import ContactPage from "./components/layout/ContactPage";
import './index.css';

import Dashboard from './components/dashboard/Dashboard';

import UserProfile from './components/profile/UserProfile';
import MessagingPage from './components/messaging/MessagingPage';
import NetworkPage from './components/network/NetworkPage';
import EventsPage from './components/events/EventsPage';
import ApplicationsPage from './components/applications/ApplicationsPage';
import OpportunityForm from './components/opportunities/OpportunityForm';

import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
        <NotificationProvider>
          <div className="app-container">
            <Routes>
            {/* Login Route */}
            <Route path="/" element={
              <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SplitCard
                  leftContent={<HeroIllustration />}
                  rightContent={<LoginForm />}
                />
              </div>
            } />
            <Route path="/forgot-password" element={
              <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ForgotPassword />
              </div>
            } />

            {/* Register Route */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Route */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Feature Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/events/create" element={<OpportunityForm />} />
            <Route path="/events/edit/:id" element={<OpportunityForm />} />
          </Routes>
        </div>
      </NotificationProvider>
    </Router>
  </ToastProvider>
  );
}

export default App;
