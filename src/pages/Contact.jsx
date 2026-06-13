import React, { useState, useEffect } from 'react';
import { Footer } from '../components';
import { configManager } from '../services/firebaseDataManager';

const Contact = () => {
  const [contactConfig, setContactConfig] = useState({
    company: {
      name: "Travel Website",
      email: "info@travelwebsite.com",
      phone: "+91 98765 43210",
      location: "Bangalore, Karnataka, India",
      businessHours: "Mon-Sat, 9 AM - 6 PM"
    },
    socialMedia: {
      instagram: "https://instagram.com/travelwebsite",
      youtube: "https://youtube.com/@travelwebsite",
      whatsapp: "https://wa.me/919876543210",
      email: "mailto:info@travelwebsite.com"
    },
    googleForm: "https://docs.google.com/forms/d/1H2ZRxI1cqRVBWSbnCFSZG_gqVc2BBXQANjL3MVMBtto/viewform?edit_requested=true"
  });
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    loadContactConfig();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showFormModal) {
        closeFormModal();
      }
    };

    if (showFormModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showFormModal]);

  const loadContactConfig = async () => {
    try {
      const config = await configManager.getConfig();
      setContactConfig(config);
    } catch (error) {
      console.error('Error loading contact config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityFormClick = (e) => {
    e.preventDefault();
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
  };

  return (
    <div className="contact">
      {/* Community Form Modal */}
      {showFormModal && contactConfig.googleForm && (
        <div className="form-modal-overlay" onClick={closeFormModal}>
          <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="form-modal-close" onClick={closeFormModal}>
              ✕
            </button>
            <div className="form-modal-header">
              <h2>Join Our Community</h2>
            </div>
            <div className="form-modal-content">
              <iframe
                src={contactConfig.googleForm}
                title="Community Form"
                className="form-modal-iframe"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">Ready to join our next adventure? Have questions about our rides? We'd love to hear from you!</p>
        </div>
      </div>

      {/* Community Form Section - Prominent at top */}
      <div className="contact-cta-section">
        <div className="cta-card">
          <h2>Join Our Community</h2>
          <p>Tell us about your interest in our rides or ask any questions</p>
          <button 
            onClick={handleCommunityFormClick}
            disabled={loading}
            className="community-form-btn"
          >
            Fill Out Our Community Form
          </button>
        </div>
      </div>
      
      {/* Contact Details Grid */}
      <div className="contact-info-grid">
        <div className="info-card">
          <div className="info-icon-wrapper">
            <span className="info-icon">📧</span>
          </div>
          <h3>Email</h3>
          <p className="info-value">{loading ? '...' : contactConfig.company.email}</p>
          <span className="info-note">We'll respond within 24 hours</span>
        </div>
        
        <div className="info-card">
          <div className="info-icon-wrapper">
            <span className="info-icon">📱</span>
          </div>
          <h3>Phone</h3>
          <p className="info-value">{loading ? '...' : contactConfig.company.phone}</p>
          <span className="info-note">{loading ? '...' : `Available ${contactConfig.company.businessHours}`}</span>
        </div>
        
        <div className="info-card">
          <div className="info-icon-wrapper">
            <span className="info-icon">📍</span>
          </div>
          <h3>Location</h3>
          <p className="info-value">{loading ? '...' : contactConfig.company.location}</p>
          <span className="info-note">Visit our office for a chat</span>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="social-section">
        <h2>Follow Our Adventures</h2>
        <p className="social-subtitle">Stay updated with our latest rides and community events</p>
        <div className="social-buttons">
          <a 
            href={loading ? '#' : contactConfig.socialMedia.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-btn instagram"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="social-text">Instagram</span>
          </a>
          <a 
            href={loading ? '#' : contactConfig.socialMedia.youtube} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-btn youtube"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="social-text">YouTube</span>
          </a>
          <a 
            href={loading ? '#' : contactConfig.socialMedia.whatsapp} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-btn whatsapp"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span className="social-text">WhatsApp</span>
          </a>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
