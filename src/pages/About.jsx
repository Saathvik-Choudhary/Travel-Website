import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components';
import bikingGroup from '../assets/biking_group.jpeg';

const About = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const icons = ['🏍️', '🚙'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Wait for exit animation to complete before changing icon
      setTimeout(() => {
        setCurrentIcon((prev) => (prev + 1) % icons.length);
        setIsAnimating(false);
      }, 1500); // Match the animation duration (1.5s)
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="about">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-title">Turn Your Weekends Into Adventures</h1>
          <p className="about-tagline">Join a community of explorers who believe life is meant to be lived, not just survived.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content-wrapper">
        {/* What We Do Section */}
        <section className="about-section">
          <div className={`section-icon ${isAnimating ? 'animate-exit' : 'animate-enter'}`}>
            {icons[currentIcon]}
          </div>
          <h2>What We Do</h2>
          <p className="about-text">
            We organize unforgettable biking adventures that transform ordinary weekends into 
            extraordinary memories. From scenic countryside trails to thrilling mountain routes, 
            every ride is carefully crafted to bring together people who share a passion for 
            exploration and adventure.
          </p>
        </section>

        {/* Experience Image Section */}
        <section className="about-image-section">
          <img src={bikingGroup} alt="Our biking community" className="about-image" />
        </section>

        {/* Why Join Us Section */}
        <section className="about-section">
          <div className="section-icon">✨</div>
          <h2>Why Join Us</h2>
          <div className="about-features">
            <div className="about-feature">
              <span className="feature-icon">🌄</span>
              <h3>Experience Adventures</h3>
              <p>Discover breathtaking routes and hidden gems that you'd never find on your own.</p>
            </div>
            <div className="about-feature">
              <span className="feature-icon">👥</span>
              <h3>Build Connections</h3>
              <p>Meet like-minded adventurers and forge friendships that last beyond the rides.</p>
            </div>
            <div className="about-feature">
              <span className="feature-icon">🎯</span>
              <h3>Create Memories</h3>
              <p>Turn every weekend into a story worth telling and moments worth remembering.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <h2>Ready to Start Your Journey?</h2>
          <p>Your next adventure is just a ride away. Join us and make your weekends meaningful.</p>
          <div className="about-cta-buttons">
            <Link to="/upcoming" className="cta-button primary">
              View Upcoming Rides
            </Link>
            <Link to="/contact" className="cta-button secondary">
              Get In Touch
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;

