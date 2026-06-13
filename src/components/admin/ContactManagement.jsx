import React, { useState, useEffect } from 'react';
import { configManager } from '../../services/firebaseDataManager';

const ContactManagement = () => {
  const [config, setConfig] = useState({
    company: {
      name: '',
      email: '',
      phone: '',
      location: '',
      businessHours: ''
    },
    socialMedia: {
      instagram: '',
      youtube: '',
      whatsapp: '',
      email: ''
    },
    googleForm: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await configManager.getConfig();
      setConfig(savedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      showMessage('error', 'Failed to load configuration');
      // Load default config as fallback
      setConfig({
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
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await configManager.updateConfig(config);
      if (success) {
        showMessage('success', 'Contact information updated successfully!');
        // Reload config to show updated values
        await loadConfig();
      } else {
        showMessage('error', 'Failed to update contact information');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      showMessage('error', 'An error occurred while updating contact information');
    }
  };

  return (
    <div className="contact-management">
      <div className="admin-section">
        <h2>Contact Information Management</h2>
        <p>Update your company contact details, social media links, and other contact-related information.</p>
        
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-card">
          <h3>Company Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                value={config.company.name}
                onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                placeholder="Travel Website"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="companyEmail">Email Address</label>
              <input
                type="email"
                id="companyEmail"
                value={config.company.email}
                onChange={(e) => handleInputChange('company', 'email', e.target.value)}
                placeholder="info@travelwebsite.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyPhone">Phone Number</label>
              <input
                type="tel"
                id="companyPhone"
                value={config.company.phone}
                onChange={(e) => handleInputChange('company', 'phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="companyLocation">Location</label>
              <input
                type="text"
                id="companyLocation"
                value={config.company.location}
                onChange={(e) => handleInputChange('company', 'location', e.target.value)}
                placeholder="Bangalore, Karnataka, India"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="businessHours">Business Hours</label>
            <input
              type="text"
              id="businessHours"
              value={config.company.businessHours}
              onChange={(e) => handleInputChange('company', 'businessHours', e.target.value)}
              placeholder="Mon-Sat, 9 AM - 6 PM"
            />
          </div>
        </div>

        <div className="admin-card">
          <h3>Social Media Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="instagram">Instagram URL</label>
              <input
                type="url"
                id="instagram"
                value={config.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                placeholder="https://instagram.com/travelwebsite"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="youtube">YouTube URL</label>
              <input
                type="url"
                id="youtube"
                value={config.socialMedia.youtube}
                onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                placeholder="https://youtube.com/@travelwebsite"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp URL</label>
              <input
                type="url"
                id="whatsapp"
                value={config.socialMedia.whatsapp}
                onChange={(e) => handleInputChange('socialMedia', 'whatsapp', e.target.value)}
                placeholder="https://wa.me/919876543210"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emailLink">Email Link</label>
              <input
                type="url"
                id="emailLink"
                value={config.socialMedia.email}
                onChange={(e) => handleInputChange('socialMedia', 'email', e.target.value)}
                placeholder="mailto:info@travelwebsite.com"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Forms & Links</h3>
          <div className="form-group">
            <label htmlFor="googleForm">Google Form URL</label>
            <input
              type="url"
              id="googleForm"
              value={config.googleForm}
              onChange={(e) => setConfig(prev => ({ ...prev, googleForm: e.target.value }))}
              placeholder="https://docs.google.com/forms/..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Contact Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactManagement;
