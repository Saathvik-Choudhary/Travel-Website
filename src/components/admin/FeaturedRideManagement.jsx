import React, { useState, useEffect } from 'react';
import { featuredRideManager, imageManager } from '../../services/firebaseDataManager';

const FeaturedRideManagement = () => {
  const [featuredRide, setFeaturedRide] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    ctaText: 'Know More',
    ctaLink: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFeaturedRide();
  }, []);

  const loadFeaturedRide = async () => {
    try {
      setLoading(true);
      const data = await featuredRideManager.getFeaturedRide();
      setFeaturedRide(data);
    } catch (error) {
      console.error('Error loading featured ride:', error);
      setMessage('Error loading featured ride data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeaturedRide(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate image
        const validation = imageManager.validateImage(file);
        if (!validation.valid) {
          setMessage(validation.error);
          return;
        }

        setUploading(true);
        setMessage('Uploading image...');
        
        // Upload to Firebase Storage (under /images/ to match storage rules)
        const imageUrl = await imageManager.uploadImage(file, 'images/featured-rides');
        
        setFeaturedRide(prev => ({
          ...prev,
          image: imageUrl
        }));
        
        setMessage('Image uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessage('Error uploading image: ' + error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage('Saving...');
      
      console.log('🌟 ADMIN: Saving featured ride...', featuredRide);
      const success = await featuredRideManager.updateFeaturedRide(featuredRide);
      console.log('🌟 ADMIN: Save result:', success);
      
      if (success) {
        setMessage('Featured ride updated successfully!');
      } else {
        setMessage('Error saving featured ride');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error saving featured ride:', error);
      setMessage('Error saving featured ride: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=1200,height=800');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Featured Ride Preview</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .featured-ride-banner { 
            background: linear-gradient(135deg, #ffffff 0%, #E0F7FA 100%);
            margin: 2rem 0;
            padding: 3rem 1rem;
            border: 1px solid rgba(0, 188, 212, 0.2);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 188, 212, 0.3);
            max-width: 1200px;
            margin: 0 auto;
          }
          .banner-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: center;
          }
          .banner-text h2 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 0.5rem;
          }
          .banner-text h3 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 1rem;
          }
          .banner-text p {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .banner-btn {
            background: #00BCD4;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .banner-btn:hover {
            background: #FF5722;
            transform: translateY(-2px);
          }
          .banner-image img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 188, 212, 0.3);
          }
          @media (max-width: 768px) {
            .banner-content { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="featured-ride-banner">
          <div class="banner-content">
            <div class="banner-text">
              <h2>${featuredRide.title}</h2>
              <h3>${featuredRide.subtitle}</h3>
              <p>${featuredRide.description}</p>
              <button class="banner-btn">${featuredRide.ctaText}</button>
            </div>
            <div class="banner-image">
              <img src="${featuredRide.image}" alt="${featuredRide.subtitle}" />
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  };

  return (
    <div className="featured-ride-management">
      <div className="admin-section">
        <h2>Featured Ride Management</h2>
        <p>Manage the featured ride banner that appears on the upcoming rides page.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'message-error' : 'message-success'}`}>
          {message}
        </div>
      )}

      <div className="admin-card">
        <h3>Featured Ride Configuration</h3>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Banner Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={featuredRide.title}
                onChange={handleInputChange}
                placeholder="e.g., Featured Adventure"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subtitle">Ride Title</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={featuredRide.subtitle}
                onChange={handleInputChange}
                placeholder="e.g., Himalayan Spirit 2025"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={featuredRide.description}
              onChange={handleInputChange}
              placeholder="Describe the featured ride adventure..."
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ctaText">Button Text</label>
              <input
                type="text"
                id="ctaText"
                name="ctaText"
                value={featuredRide.ctaText}
                onChange={handleInputChange}
                placeholder="e.g., Know More"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ctaLink">Button Link</label>
              <input
                type="url"
                id="ctaLink"
                name="ctaLink"
                value={featuredRide.ctaLink}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Featured Image</label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff"
              onChange={handleImageChange}
              disabled={uploading}
            />
            <small className="form-hint">
              Supported formats: JPEG, JPG, PNG, WebP, GIF, BMP, TIFF (Max size: 20MB)
            </small>
            {uploading && <small>Uploading image, please wait...</small>}
          </div>

          {featuredRide.image && (
            <div className="image-preview">
              <img src={featuredRide.image} alt="Featured ride preview" />
              <p>Current featured ride image</p>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={featuredRide.isActive}
                onChange={handleInputChange}
              />
              <span>Show featured ride banner</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handlePreview} disabled={loading || uploading}>
              Preview Banner
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {loading ? 'Saving...' : uploading ? 'Uploading...' : 'Save Featured Ride'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3>Current Featured Ride</h3>
        <div className="featured-ride-preview">
          <div className="preview-banner">
            <div className="preview-content">
              <div className="preview-text">
                <h4>{featuredRide.title || 'Featured Adventure'}</h4>
                <h5>{featuredRide.subtitle || 'Himalayan Spirit 2025'}</h5>
                <p>{featuredRide.description || 'Join us for the ultimate mountain biking experience through the majestic Himalayas'}</p>
                <button className="preview-btn">{featuredRide.ctaText || 'Know More'}</button>
              </div>
              <div className="preview-image">
                {featuredRide.image ? (
                  <img src={featuredRide.image} alt="Featured ride" />
                ) : (
                  <div className="placeholder">No image selected</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedRideManagement;
