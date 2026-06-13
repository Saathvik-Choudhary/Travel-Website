import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { rideManager, imageManager } from '../../services/firebaseDataManager';
import { defaultRideStructure } from '../../data/config';
import { calculateDuration, formatDuration, formatDateRange, getMinDateString } from '../../utils/dateUtils';

// Sortable Ride Card Component
const SortableRideCard = ({ ride, onEdit, onDuplicate, onDelete, onStatusChange, onViewDetails }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ride.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-card ride-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="ride-card-header">
        <div className="drag-handle" {...attributes} {...listeners}>
          <span className="drag-icon">⋮⋮</span>
        </div>
        <h3>{ride.title}</h3>
        <span className={`status-badge status-${ride.status}`}>
          {ride.status}
        </span>
      </div>
      
      {ride.image && (
        <div className="ride-image">
          <img src={ride.image} alt={ride.title} />
        </div>
      )}
      
      <div className="ride-details">
        <p><strong>ID:</strong> {ride.id || 'NO ID!'} {!ride.id && <span style={{color: 'red', fontWeight: 'bold'}}> ⚠️ Missing ID!</span>}</p>
        <p><strong>Date:</strong> {ride.startDate && ride.endDate ? formatDateRange(ride.startDate, ride.endDate) : 'Not set'}</p>
        <p><strong>Duration:</strong> {ride.duration}</p>
        <p><strong>Distance:</strong> {ride.distance}</p>
        <p><strong>Participants:</strong> {ride.participants}</p>
        <p><strong>Description:</strong> {ride.description}</p>
        <p><strong>Order:</strong> {ride.order !== undefined ? ride.order : 'Not set'}</p>
      </div>
      
      <div className="ride-actions">
        <button 
          className="btn btn-secondary"
          onClick={() => onViewDetails(ride.id)}
          title="View ride details page"
        >
          View Details
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => onDuplicate(ride)}
          title="Duplicate this ride to create a new one"
        >
          Duplicate
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => onEdit(ride)}
        >
          Edit
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => onDelete(ride.id)}
        >
          Delete
        </button>
        <select 
          value={ride.status}
          onChange={(e) => onStatusChange(ride.id, e.target.value)}
          className="status-select"
        >
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};

const RideManagement = () => {
  const navigate = useNavigate();
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [cancelledRides, setCancelledRides] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [formData, setFormData] = useState({ ...defaultRideStructure });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      // Load ALL rides (upcoming, completed, cancelled) for admin management
      const allRides = await rideManager.getAllRides();
      console.log('Admin: Loaded rides:', allRides.length);
      
      // Check each ride for ID
      allRides.forEach((ride, index) => {
        console.log(`Ride ${index}:`, {
          id: ride.id,
          title: ride.title,
          hasId: !!ride.id,
          idType: typeof ride.id
        });
      });
      
      // Migrate any old data format
      const migratedRides = allRides.map(ride => rideManager.migrateRideData(ride));
      
      // Check migrated rides
      console.log('After migration:');
      migratedRides.forEach((ride, index) => {
        console.log(`Migrated Ride ${index}:`, {
          id: ride.id,
          title: ride.title,
          hasId: !!ride.id
        });
      });
      
      // Separate rides by status
      setUpcomingRides(migratedRides.filter(ride => ride.status === 'upcoming'));
      setCompletedRides(migratedRides.filter(ride => ride.status === 'completed'));
      setCancelledRides(migratedRides.filter(ride => ride.status === 'cancelled'));
    } catch (error) {
      console.error('Error loading rides:', error);
      showMessage('error', 'Failed to load rides');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDragEnd = async (event, status) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      let newRides;
      
      if (status === 'upcoming') {
        const oldIndex = upcomingRides.findIndex(ride => ride.id === active.id);
        const newIndex = upcomingRides.findIndex(ride => ride.id === over.id);
        newRides = arrayMove(upcomingRides, oldIndex, newIndex);
        setUpcomingRides(newRides);
      } else if (status === 'completed') {
        const oldIndex = completedRides.findIndex(ride => ride.id === active.id);
        const newIndex = completedRides.findIndex(ride => ride.id === over.id);
        newRides = arrayMove(completedRides, oldIndex, newIndex);
        setCompletedRides(newRides);
      } else if (status === 'cancelled') {
        const oldIndex = cancelledRides.findIndex(ride => ride.id === active.id);
        const newIndex = cancelledRides.findIndex(ride => ride.id === over.id);
        newRides = arrayMove(cancelledRides, oldIndex, newIndex);
        setCancelledRides(newRides);
      }

      // Update order in Firebase
      const rideIds = newRides.map(ride => ride.id);
      const success = await rideManager.reorderRides(rideIds, status);
      
      if (success) {
        showMessage('success', 'Ride order updated successfully!');
      } else {
        showMessage('error', 'Failed to update ride order');
        // Reload rides to get the correct order from Firebase
        loadRides();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate duration when start or end date changes
      if (name === 'startDate' || name === 'endDate') {
        if (newData.startDate && newData.endDate) {
          const duration = calculateDuration(newData.startDate, newData.endDate);
          newData.duration = formatDuration(duration);
          
          // Auto-generate itinerary days
          const numDays = duration; // calculateDuration already includes both start and end day
          const currentItinerary = newData.itinerary || [];
          const newItinerary = [];
          
          for (let i = 0; i < numDays; i++) {
            // Keep existing data if available, otherwise create new day
            newItinerary.push(currentItinerary[i] || {
              day: i + 1,
              title: '',
              description: ''
            });
          }
          
          newData.itinerary = newItinerary;
        }
      }
      
      return newData;
    });
  };

  const handleHighlightsChange = (index, value) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), '']
    }));
  };

  const removeHighlight = (index) => {
    const newHighlights = (formData.highlights || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...(formData.itinerary || [])];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleItineraryActivityChange = (dayIndex, activityIndex, value) => {
    const newItinerary = [...(formData.itinerary || [])];
    const activities = [...(newItinerary[dayIndex].activities || [])];
    activities[activityIndex] = value;
    newItinerary[dayIndex] = {
      ...newItinerary[dayIndex],
      activities
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addItineraryActivity = (dayIndex) => {
    const newItinerary = [...(formData.itinerary || [])];
    newItinerary[dayIndex] = {
      ...newItinerary[dayIndex],
      activities: [...(newItinerary[dayIndex].activities || []), '']
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const removeItineraryActivity = (dayIndex, activityIndex) => {
    const newItinerary = [...(formData.itinerary || [])];
    const activities = (newItinerary[dayIndex].activities || []).filter((_, i) => i !== activityIndex);
    newItinerary[dayIndex] = {
      ...newItinerary[dayIndex],
      activities
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleIncludedChange = (index, value) => {
    const newIncluded = [...(formData.included || [])];
    newIncluded[index] = value;
    setFormData(prev => ({ ...prev, included: newIncluded }));
  };

  const addIncluded = () => {
    setFormData(prev => ({
      ...prev,
      included: [...(prev.included || []), '']
    }));
  };

  const removeIncluded = (index) => {
    const newIncluded = (formData.included || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, included: newIncluded }));
  };

  const handleExcludedChange = (index, value) => {
    const newExcluded = [...(formData.excluded || [])];
    newExcluded[index] = value;
    setFormData(prev => ({ ...prev, excluded: newExcluded }));
  };

  const addExcluded = () => {
    setFormData(prev => ({
      ...prev,
      excluded: [...(prev.excluded || []), '']
    }));
  };

  const removeExcluded = (index) => {
    const newExcluded = (formData.excluded || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, excluded: newExcluded }));
  };

  const handleThingsToCarryChange = (index, value) => {
    const newThingsToCarry = [...(formData.thingsToCarry || [])];
    newThingsToCarry[index] = value;
    setFormData(prev => ({ ...prev, thingsToCarry: newThingsToCarry }));
  };

  const addThingsToCarry = () => {
    setFormData(prev => ({
      ...prev,
      thingsToCarry: [...(prev.thingsToCarry || []), '']
    }));
  };

  const removeThingsToCarry = (index) => {
    const newThingsToCarry = (formData.thingsToCarry || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, thingsToCarry: newThingsToCarry }));
  };

  // Handlers for Mandatory Things to Carry
  const handleMandatoryChange = (index, value) => {
    const newMandatory = [...(formData.thingsToCarryMandatory || [])];
    newMandatory[index] = value;
    setFormData(prev => ({ ...prev, thingsToCarryMandatory: newMandatory }));
  };

  const addMandatory = () => {
    setFormData(prev => ({
      ...prev,
      thingsToCarryMandatory: [...(prev.thingsToCarryMandatory || []), '']
    }));
  };

  const removeMandatory = (index) => {
    const newMandatory = (formData.thingsToCarryMandatory || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, thingsToCarryMandatory: newMandatory }));
  };

  // Handlers for Suggested Things to Carry
  const handleSuggestedChange = (index, value) => {
    const newSuggested = [...(formData.thingsToCarrySuggested || [])];
    newSuggested[index] = value;
    setFormData(prev => ({ ...prev, thingsToCarrySuggested: newSuggested }));
  };

  const addSuggested = () => {
    setFormData(prev => ({
      ...prev,
      thingsToCarrySuggested: [...(prev.thingsToCarrySuggested || []), '']
    }));
  };

  const removeSuggested = (index) => {
    const newSuggested = (formData.thingsToCarrySuggested || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, thingsToCarrySuggested: newSuggested }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = imageManager.validateImage(file);
    if (!validation.valid) {
      showMessage('error', validation.error);
      e.target.value = ''; // Reset file input
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting image upload...', { name: file.name, size: file.size, type: file.type });
      const imageUrl = await imageManager.uploadImage(file);
      console.log('Image uploaded successfully:', imageUrl);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      showMessage('success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload failed:', error);
      showMessage('error', `Failed to upload image: ${error.message || 'Unknown error'}`);
      e.target.value = ''; // Reset file input on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingRide) {
        // Update existing ride
        const success = await rideManager.updateRide(editingRide.id, formData);
        if (success) {
          showMessage('success', 'Ride updated successfully!');
          setEditingRide(null);
        } else {
          showMessage('error', 'Failed to update ride');
        }
      } else {
        // Add new ride
        const success = await rideManager.addRide(formData);
        if (success) {
          showMessage('success', 'Ride added successfully!');
          setShowAddForm(false);
        } else {
          showMessage('error', 'Failed to add ride');
        }
      }
      
      await loadRides();
      resetForm();
    } catch (error) {
      console.error('Error managing ride:', error);
      showMessage('error', 'An error occurred while managing ride');
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ ...defaultRideStructure });
    setEditingRide(null);
    setShowAddForm(false);
  };

  const handleEdit = (ride) => {
    setFormData({ ...ride });
    setEditingRide(ride);
    setShowAddForm(true);
  };

  const handleDuplicate = (ride) => {
    // Create a copy of the ride without the ID (so it creates a new ride)
    const { id, ...rideDataWithoutId } = ride;
    
    // Set form data with the duplicated ride data
    setFormData({ 
      ...rideDataWithoutId,
      title: `${ride.title} (Copy)`, // Add "(Copy)" to the title to distinguish it
      status: 'upcoming' // Default to upcoming status
    });
    
    // Don't set editingRide (keep it null) so it creates a new ride
    setEditingRide(null);
    setShowAddForm(true);
    
    showMessage('info', 'Ride duplicated. Modify the details and save to create a new ride.');
  };

  const handleDelete = async (rideId) => {
    console.log('handleDelete called with rideId:', rideId);
    
    if (!rideId) {
      console.error('❌ Cannot delete - rideId is invalid:', rideId);
      showMessage('error', 'Cannot delete: Invalid ride ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this ride?')) {
      try {
        console.log('Attempting to delete ride:', rideId);
        const success = await rideManager.deleteRide(rideId);
        console.log('Delete result:', success);
        
        if (success) {
          showMessage('success', 'Ride deleted successfully!');
          await loadRides();
        } else {
          showMessage('error', 'Failed to delete ride - check console for details');
        }
      } catch (error) {
        console.error('Error deleting ride:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        showMessage('error', `Error deleting ride: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleStatusChange = async (rideId, newStatus) => {
    try {
      const success = await rideManager.changeRideStatus(rideId, newStatus);
      if (success) {
        showMessage('success', 'Ride status updated successfully!');
        await loadRides();
      } else {
        showMessage('error', 'Failed to update ride status');
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      showMessage('error', 'An error occurred while updating ride status');
    }
  };

  const handleViewDetails = (rideId) => {
    console.log('handleViewDetails called with rideId:', rideId);
    console.log('rideId type:', typeof rideId);
    console.log('rideId is null:', rideId === null);
    console.log('rideId is undefined:', rideId === undefined);
    if (!rideId) {
      console.error('❌ Cannot navigate - rideId is invalid:', rideId);
      alert('Error: Ride ID is missing! Cannot view details.');
      return;
    }
    const targetPath = `/ride/${rideId}`;
    console.log('Navigating to:', targetPath);
    navigate(targetPath);
  };

  const renderRideSection = (rides, status, title) => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>{title} ({rides.length})</h3>
        <p className="section-description">
          Drag and drop rides to reorder them. The order will be reflected on the public pages.
        </p>
      </div>
      
      {rides.length === 0 ? (
        <div className="admin-card">
          <p>No {status} rides found.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, status)}
        >
          <SortableContext
            items={rides.map(ride => ride.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="admin-grid">
              {rides.map(ride => (
                <SortableRideCard
                  key={ride.id}
                  ride={ride}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );

  return (
    <div className="ride-management">
      <div className="admin-section">
        <div className="section-header">
          <h2>Ride Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFormData({ ...defaultRideStructure });
              setEditingRide(null);
              setShowAddForm(true);
            }}
          >
            Add New Ride
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
          <h3>{editingRide ? 'Edit Ride' : 'Add New Ride'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Ride Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Ride to Kolli Hills from Bangalore"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
                <small className="form-hint">You can select past dates to add completed rides</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate}
                />
                <small className="form-hint">End date must be after start date</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (Auto-calculated)</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  readOnly
                  className="readonly-field"
                  placeholder="Will be calculated automatically"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="distance">Distance *</label>
                <input
                  type="text"
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 450 km"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="participants">Participants</label>
                <input
                  type="number"
                  id="participants"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  placeholder="Number of participants"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <small className="form-hint">
                  • <strong>Upcoming:</strong> Future rides that are open for booking<br/>
                  • <strong>Completed:</strong> Past rides that have finished successfully<br/>
                  • <strong>Cancelled:</strong> Rides that were cancelled for any reason
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Describe the ride experience, highlights, and what participants can expect..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Ride Image</label>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
              <small className="form-hint">
                Supported formats: JPEG, JPG, PNG, WebP, GIF, BMP, TIFF (Max size: 20MB)
              </small>
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                  <p>Image uploaded successfully!</p>
                </div>
              )}
            </div>

            {/* Overview Details Section */}
            <div className="form-section">
              <h4>Overview Details</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehicleType">Vehicle Type</label>
                  <input
                    type="text"
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Bike/Car"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Difficult">Difficult</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Group Size</label>
                  <input
                    type="text"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 15-20"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bestSeason">Best Season</label>
                  <input
                    type="text"
                    id="bestSeason"
                    name="bestSeason"
                    value={formData.bestSeason || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., All Year"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Highlights</label>
                {(formData.highlights || []).map((highlight, index) => (
                  <div key={index} className="array-input-group">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleHighlightsChange(index, e.target.value)}
                      placeholder="e.g., Scenic routes and breathtaking views"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => removeHighlight(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addHighlight}
                >
                  + Add Highlight
                </button>
              </div>
            </div>

            {/* Itinerary Section */}
            <div className="form-section">
              <h4>Itinerary ({formData.itinerary?.length || 0} Days)</h4>
              <p className="form-hint">Auto-generated based on start and end dates. Fill in the details for each day.</p>
              
              {(formData.itinerary || []).map((day, index) => (
                <div key={index} className="itinerary-day-form">
                  <h5>Day {day.day}</h5>
                  <div className="form-group">
                    <label htmlFor={`day-${index}-title`}>Day Title</label>
                    <input
                      type="text"
                      id={`day-${index}-title`}
                      value={day.title || ''}
                      onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                      placeholder="e.g., Bangalore to Kolli Hills"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`day-${index}-description`}>Day Description</label>
                    <textarea
                      id={`day-${index}-description`}
                      value={day.description || ''}
                      onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                      rows="3"
                      placeholder="Describe the activities, route, and highlights for this day..."
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`day-${index}-distance`}>Day Distance</label>
                    <input
                      type="text"
                      id={`day-${index}-distance`}
                      value={day.distance || ''}
                      onChange={(e) => handleItineraryChange(index, 'distance', e.target.value)}
                      placeholder="e.g., 150 km"
                    />
                    <small className="form-hint">Distance covered on this day (optional)</small>
                  </div>
                  <div className="form-group">
                    <label>Activities for Day {day.day}</label>
                    {(day.activities || []).map((activity, actIndex) => (
                      <div key={actIndex} className="array-input-group">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => handleItineraryActivityChange(index, actIndex, e.target.value)}
                          placeholder="e.g., Morning ride through scenic routes"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => removeItineraryActivity(index, actIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => addItineraryActivity(index)}
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>
              ))}
              
              {(!formData.itinerary || formData.itinerary.length === 0) && (
                <p className="form-hint">Set start and end dates to auto-generate itinerary days.</p>
              )}
            </div>

            {/* Inclusions Section */}
            <div className="form-section">
              <h4>What's Included</h4>
              {(formData.included || []).map((item, index) => (
                <div key={index} className="array-input-group">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleIncludedChange(index, e.target.value)}
                    placeholder="e.g., Professional ride leader"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => removeIncluded(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addIncluded}
              >
                + Add Inclusion
              </button>
            </div>

            {/* Exclusions Section */}
            <div className="form-section">
              <h4>What's Not Included</h4>
              {(formData.excluded || []).map((item, index) => (
                <div key={index} className="array-input-group">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleExcludedChange(index, e.target.value)}
                    placeholder="e.g., Personal bike and fuel"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => removeExcluded(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addExcluded}
              >
                + Add Exclusion
              </button>
            </div>

            {/* Things to Carry Section */}
            <div className="form-section">
              <h4>Things to Carry</h4>
              
              {/* Mandatory Items */}
              <div className="form-group">
                <label style={{ color: '#ff9800', fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚠️</span> Mandatory Items
                </label>
                {(formData.thingsToCarryMandatory || []).map((item, index) => (
                  <div key={index} className="array-input-group">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleMandatoryChange(index, e.target.value)}
                      placeholder="e.g., RainCoat, Jacket/Thermal wear, Driving Licence"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => removeMandatory(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addMandatory}
                >
                  + Add Mandatory Item
                </button>
              </div>

              {/* Suggested Items */}
              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label style={{ color: '#00BCD4', fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💡</span> Suggested Items
                </label>
                {(formData.thingsToCarrySuggested || []).map((item, index) => (
                  <div key={index} className="array-input-group">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleSuggestedChange(index, e.target.value)}
                      placeholder="e.g., Power bank, Sunglasses, Camera"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => removeSuggested(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addSuggested}
                >
                  + Add Suggested Item
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="form-section">
              <h4>Pricing Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tripCost">Trip Cost</label>
                  <input
                    type="text"
                    id="tripCost"
                    name="tripCost"
                    value={formData.tripCost || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., ₹5000 per person"
                  />
                  <small className="form-hint">The total trip cost per person</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="bookingCost">Booking Cost</label>
                  <input
                    type="text"
                    id="bookingCost"
                    name="bookingCost"
                    value={formData.bookingCost || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., ₹1000 advance"
                  />
                  <small className="form-hint">The advance booking amount</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastBookingDate">Last Date for Booking</label>
                <input
                  type="date"
                  id="lastBookingDate"
                  name="lastBookingDate"
                  value={formData.lastBookingDate || ''}
                  onChange={handleInputChange}
                />
                <small className="form-hint">Last date to book this ride (optional)</small>
              </div>

              <div className="form-group">
                <label htmlFor="bookingFormUrl">Booking Form URL</label>
                <input
                  type="url"
                  id="bookingFormUrl"
                  name="bookingFormUrl"
                  value={formData.bookingFormUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform"
                />
                <small className="form-hint">Google Form URL where users can book this specific ride</small>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="form-section">
              <h4>Social Media Links</h4>
              
              <div className="form-group">
                <label htmlFor="youtubeUrl">YouTube Video URL</label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                />
                <small className="form-hint">Link to YouTube video/vlog of this ride (optional)</small>
              </div>

              <div className="form-group">
                <label htmlFor="instagramUrl">Instagram Post/Reel URL</label>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={formData.instagramUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.instagram.com/p/YOUR_POST_ID"
                />
                <small className="form-hint">Link to Instagram post, reel, or highlights of this ride (optional)</small>
              </div>
            </div>

            {/* Policy Information Section */}
            <div className="form-section">
              <h4>Policy Information</h4>
              
              <div className="form-group">
                <label htmlFor="cancellationPolicy">Cancellation Policy</label>
                <textarea
                  id="cancellationPolicy"
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy || ''}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Enter the cancellation policy details here. You can provide information about refunds, rescheduling, and cancellation deadlines."
                />
                <small className="form-hint">Describe the cancellation terms and refund policy</small>
              </div>

              <div className="form-group">
                <label htmlFor="paymentTerms">Payment Terms</label>
                <textarea
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms || ''}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Enter payment terms details such as payment schedule, accepted methods, and any payment-related policies."
                />
                <small className="form-hint">Describe the payment terms and conditions</small>
              </div>
            </div>

            {/* How to Join Section */}
            <div className="form-section">
              <h4>How to Join This Trip</h4>
              <div className="form-group">
                <textarea
                  id="howToJoin"
                  name="howToJoin"
                  value={formData.howToJoin || ''}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Explain the steps to join this trip, booking process, payment methods, and any prerequisites."
                />
                <small className="form-hint">Provide clear instructions on how participants can join this trip</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (editingRide ? 'Update Ride' : 'Add Ride')}
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

      {/* Separate sections for each ride status */}
      {renderRideSection(upcomingRides, 'upcoming', 'Upcoming Rides')}
      {renderRideSection(completedRides, 'completed', 'Completed Rides')}
      {renderRideSection(cancelledRides, 'cancelled', 'Cancelled Rides')}
    </div>
  );
};

export default RideManagement;