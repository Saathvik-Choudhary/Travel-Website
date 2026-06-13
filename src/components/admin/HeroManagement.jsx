import React, { useState, useEffect } from 'react';
import { heroManager } from '../../services/firebaseDataManager';

const HeroManagement = () => {
  const [slides, setSlides] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    background: '',
    cta: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const heroSlides = await heroManager.getSlides();
      setSlides(heroSlides);
    } catch (error) {
      console.error('Error loading slides:', error);
      showMessage('error', 'Failed to load hero slides');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🎬 ADMIN: Saving hero slide...', formData);
      if (editingSlide) {
        const success = await heroManager.updateSlide(editingSlide.id, formData);
        console.log('🎬 ADMIN: Update result:', success);
        if (success) {
          showMessage('success', 'Slide updated successfully!');
          setEditingSlide(null);
        } else {
          showMessage('error', 'Failed to update slide');
        }
      } else {
        const success = await heroManager.addSlide(formData);
        console.log('🎬 ADMIN: Add result:', success);
        if (success) {
          showMessage('success', 'Slide added successfully!');
          setShowAddForm(false);
        } else {
          showMessage('error', 'Failed to add slide');
        }
      }
      
      await loadSlides();
      resetForm();
    } catch (error) {
      console.error('❌ Error managing slide:', error);
      showMessage('error', 'An error occurred while managing slide');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      background: '',
      cta: ''
    });
    setEditingSlide(null);
    setShowAddForm(false);
  };

  const handleEdit = (slide) => {
    setFormData({ ...slide });
    setEditingSlide(slide);
    setShowAddForm(true);
  };

  const handleDelete = async (slideId) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        const success = await heroManager.deleteSlide(slideId);
        if (success) {
          showMessage('success', 'Slide deleted successfully!');
          await loadSlides();
        } else {
          showMessage('error', 'Failed to delete slide');
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        showMessage('error', 'An error occurred while deleting slide');
      }
    }
  };

  const SlideCard = ({ slide }) => (
    <div className="admin-card slide-card">
      <div className="slide-preview">
        {slide.background && (
          <div 
            className="slide-background"
            style={{ backgroundImage: `url(${slide.background})` }}
          >
            <div className="slide-overlay">
              <h3>{slide.title}</h3>
              <h4>{slide.subtitle}</h4>
              <p>{slide.tagline}</p>
              <button className="slide-cta">{slide.cta}</button>
            </div>
          </div>
        )}
      </div>
      
      <div className="slide-details">
        <h4>{slide.title}</h4>
        <p><strong>Subtitle:</strong> {slide.subtitle}</p>
        <p><strong>Tagline:</strong> {slide.tagline}</p>
        <p><strong>CTA:</strong> {slide.cta}</p>
      </div>
      
      <div className="slide-actions">
        <button 
          className="btn btn-primary"
          onClick={() => handleEdit(slide)}
        >
          Edit
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => handleDelete(slide.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="hero-management">
      <div className="admin-section">
        <div className="section-header">
          <h2>Hero Section Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Slide
          </button>
        </div>
        
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="admin-card">
          <h3>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., LOSE YOURSELF"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subtitle">Subtitle *</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                required
                placeholder="e.g., DISCOVER YOURSELF"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tagline">Tagline *</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                required
                placeholder="e.g., Travel Like A Pro"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cta">Call to Action Button Text *</label>
              <input
                type="text"
                id="cta"
                name="cta"
                value={formData.cta}
                onChange={handleInputChange}
                required
                placeholder="e.g., Join Our Rides"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="background">Background Image URL *</label>
              <input
                type="url"
                id="background"
                name="background"
                value={formData.background}
                onChange={handleInputChange}
                required
                placeholder="https://images.unsplash.com/photo-..."
              />
              {formData.background && (
                <div className="image-preview">
                  <img src={formData.background} alt="Background preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                {editingSlide ? 'Update Slide' : 'Add Slide'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section">
        <h3>Current Slides ({slides.length})</h3>
        {slides.length === 0 ? (
          <div className="admin-card">
            <p>No slides found. Add your first slide to get started!</p>
          </div>
        ) : (
          <div className="admin-grid">
            {slides.map(slide => (
              <SlideCard key={slide.id} slide={slide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroManagement;
