import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import UpcomingRides from './pages/UpcomingRides';
import PreviousRides from './pages/PreviousRides';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import RideDetails from './pages/RideDetails';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <UpcomingRides />
            </main>
          </div>
        } />
        <Route path="/upcoming" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <UpcomingRides />
            </main>
          </div>
        } />
        <Route path="/previous" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <PreviousRides />
            </main>
          </div>
        } />
        <Route path="/about" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <About />
            </main>
          </div>
        } />
        <Route path="/contact" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <Contact />
            </main>
          </div>
        } />
        <Route path="/ride/:rideId" element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <RideDetails />
            </main>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
