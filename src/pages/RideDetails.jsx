import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Footer } from '../components';
import { rideManager } from '../services/firebaseDataManager';
import { formatDateRange } from '../utils/dateUtils';

const RideDetails = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [similarRides, setSimilarRides] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts or rideId changes
    window.scrollTo(0, 0);
    loadRideDetails();
  }, [rideId]);

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

  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'itinerary', 'includes', 'carry', 'policy'];
      const scrollPosition = window.scrollY + 200; // Offset for better UX

      for (const section of sections) {
        const element = document.getElementById(`${section}-section`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadRideDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading ride details for ID:', rideId);
      const allRides = await rideManager.getAllRides();
      console.log('All rides loaded:', allRides.length, 'rides');
      console.log('Looking for ride with ID:', rideId);
      console.log('Available ride IDs:', allRides.map(r => ({ id: r.id, title: r.title, status: r.status })));
      
      const selectedRide = allRides.find(r => r.id === rideId);
      
      if (!selectedRide) {
        console.error('❌ Ride not found with ID:', rideId);
        console.error('Available IDs:', allRides.map(r => r.id).join(', '));
        alert(`Ride not found! Looking for ID: ${rideId}\nAvailable rides: ${allRides.length}`);
        navigate('/upcoming');
        return;
      }

      console.log('✅ Found ride:', selectedRide.title, '(ID:', selectedRide.id, ')');
      // Migrate ride data if needed
      const migratedRide = rideManager.migrateRideData(selectedRide);
      setRide(migratedRide);

      // Get similar rides (exclude current ride)
      const similar = allRides
        .filter(r => r.id !== rideId && r.status === migratedRide.status)
        .slice(0, 3);
      setSimilarRides(similar);
    } catch (error) {
      console.error('Error loading ride details:', error);
      alert(`Error loading ride details: ${error.message}`);
      navigate('/upcoming');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // Use ride-specific booking form URL if available, otherwise navigate to contact page
    if (ride.bookingFormUrl) {
      setShowFormModal(true);
    } else {
      navigate('/contact');
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Fallback: Unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="ride-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (!ride) {
    return null;
  }

  return (
    <div className="ride-details-page">
      {/* Registration Form Modal */}
      {showFormModal && ride.bookingFormUrl && (
        <div className="form-modal-overlay" onClick={closeFormModal}>
          <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="form-modal-close" onClick={closeFormModal}>
              ✕
            </button>
            <div className="form-modal-header">
              <h2>Register for {ride.title}</h2>
            </div>
            <div className="form-modal-content">
              <iframe
                src={ride.bookingFormUrl}
                title="Registration Form"
                className="form-modal-iframe"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Image */}
      <div className="ride-details-hero">
        <div className="hero-image-large">
          <img src={ride.image} alt={ride.title} className="hero-ride-image" />
          <div className="hero-overlay-dark"></div>
          <div className="hero-content-details">
            {/* Breadcrumb hidden for now */}
            {/* <div className="breadcrumb">
              <Link to="/">Home</Link>
              <span className="separator">›</span>
              <Link to={ride.status === 'upcoming' ? '/upcoming' : '/previous'}>
                {ride.status === 'upcoming' ? 'Upcoming Rides' : 'Previous Rides'}
              </Link>
              <span className="separator">›</span>
              <span className="current">{ride.title}</span>
            </div> */}
            <h1 className="ride-title-hero">{ride.title}</h1>
            <div className="ride-quick-info">
              <div className="quick-info-item">
                <span className="icon">📅</span>
                <span className="text">
                  {ride.startDate && ride.endDate 
                    ? formatDateRange(ride.startDate, ride.endDate)
                    : 'Date TBD'}
                </span>
              </div>
              <div className="quick-info-item">
                <span className="icon">⏱️</span>
                <span className="text">{ride.duration || 'Duration TBD'}</span>
              </div>
              <div className="quick-info-item">
                <span className="icon">🛣️</span>
                <span className="text">{ride.distance || 'Distance TBD'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ride-details-container">
        <div className="details-main-content">
          {/* Tab Navigation */}
          <div className="details-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                document.getElementById('overview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('itinerary');
                document.getElementById('itinerary-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Itinerary
            </button>
            <button 
              className={`tab-button ${activeTab === 'includes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('includes');
                document.getElementById('includes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Inclusions
            </button>
            <button 
              className={`tab-button ${activeTab === 'carry' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('carry');
                document.getElementById('carry-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Things to Carry
            </button>
            <button 
              className={`tab-button ${activeTab === 'policy' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('policy');
                document.getElementById('policy-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Policy
            </button>
          </div>

          {/* Tab Content - All Sections Visible */}
          <div className="tab-content-all">
            {/* Overview Section */}
            <div id="overview-section" className="tab-panel overview-panel">
              <h2>About This Ride</h2>
              <p className="ride-description-full">{ride.description}</p>
              
              <div className="overview-highlights">
                <h3>Highlights</h3>
                <ul className="highlights-list">
                  {ride.highlights ? (
                    ride.highlights.map((highlight, index) => (
                      <li key={index}>
                        <span className="highlight-icon">✓</span>
                        {highlight}
                      </li>
                    ))
                  ) : (
                    <>
                      <li><span className="highlight-icon">✓</span>Scenic routes and breathtaking views</li>
                      <li><span className="highlight-icon">✓</span>Professional ride leaders</li>
                      <li><span className="highlight-icon">✓</span>Safety equipment provided</li>
                      <li><span className="highlight-icon">✓</span>Group riding experience</li>
                      <li><span className="highlight-icon">✓</span>Photo opportunities</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="overview-stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">
                    <span>🏍️</span>
                    <span className="icon-separator">/</span>
                    <span>🚗</span>
                  </div>
                  <div className="stat-label">Vehicle Type</div>
                  <div className="stat-value">{ride.vehicleType || 'Bike/Car'}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">👥</div>
                  <div className="stat-label">Group Size</div>
                  <div className="stat-value">{ride.maxParticipants || '15-20'}</div>
                </div>
              </div>
            </div>

            {/* Itinerary Section */}
            <div id="itinerary-section" className="tab-panel itinerary-panel">
              <h2>Detailed Itinerary</h2>
              <div className="itinerary-list">
                {ride.itinerary ? (
                  ride.itinerary.map((day, index) => (
                    <div key={index} className="itinerary-day">
                      <div className="day-number">Day {day.day}</div>
                      <div className="day-content">
                        <h3>{day.title}</h3>
                        <p>{day.description}</p>
                        {day.activities && (
                          <ul className="day-activities">
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        )}
                        {day.distance && (
                          <div className="day-distance">
                            <span className="distance-icon">🛣️</span>
                            Distance: {day.distance}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="itinerary-placeholder">
                    <p>Detailed itinerary will be shared upon booking confirmation.</p>
                    <p>Contact us for more information about the day-by-day schedule.</p>
                  </div>
                )}
              </div>
            </div>

            {/* What's Included Section */}
            <div id="includes-section" className="tab-panel includes-panel">
              <h2>What's Included & Excluded</h2>
              <div className="includes-grid">
                <div className="includes-section">
                  <h3 className="section-title included">
                    <span className="title-icon">✓</span>
                    What's Included
                  </h3>
                  <ul className="includes-list">
                    {ride.included ? (
                      ride.included.map((item, index) => (
                        <li key={index}>
                          <span className="list-icon included-icon">✓</span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <>
                        <li><span className="list-icon included-icon">✓</span>Professional ride leader</li>
                        <li><span className="list-icon included-icon">✓</span>Support vehicle</li>
                        <li><span className="list-icon included-icon">✓</span>First aid kit</li>
                        <li><span className="list-icon included-icon">✓</span>Basic meals during ride</li>
                        <li><span className="list-icon included-icon">✓</span>Group photos</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="includes-section">
                  <h3 className="section-title excluded">
                    <span className="title-icon">✕</span>
                    What's Not Included
                  </h3>
                  <ul className="includes-list">
                    {ride.excluded ? (
                      ride.excluded.map((item, index) => (
                        <li key={index}>
                          <span className="list-icon excluded-icon">✕</span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <>
                        <li><span className="list-icon excluded-icon">✕</span>Personal bike and fuel</li>
                        <li><span className="list-icon excluded-icon">✕</span>Accommodation (unless specified)</li>
                        <li><span className="list-icon excluded-icon">✕</span>Personal expenses</li>
                        <li><span className="list-icon excluded-icon">✕</span>Travel insurance</li>
                        <li><span className="list-icon excluded-icon">✕</span>Entry fees to monuments</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Things to Carry Section */}
            <div id="carry-section" className="tab-panel carry-panel">
              <h2>Things to Carry</h2>
              <div className="carry-content">
                {(ride.thingsToCarryMandatory && ride.thingsToCarryMandatory.length > 0) || 
                 (ride.thingsToCarrySuggested && ride.thingsToCarrySuggested.length > 0) ? (
                  <div className="carry-grid">
                    <div className="carry-column">
                      <h3 className="carry-column-title mandatory">
                        <span className="title-icon">⚠️</span>
                        Mandatory
                      </h3>
                      <ul className="carry-list">
                        {ride.thingsToCarryMandatory && ride.thingsToCarryMandatory.length > 0 ? (
                          ride.thingsToCarryMandatory.map((item, index) => (
                            <li key={index}>
                              <span className="list-icon">📌</span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <li><span className="list-icon">📌</span>No mandatory items specified</li>
                        )}
                      </ul>
                    </div>
                    <div className="carry-column">
                      <h3 className="carry-column-title suggested">
                        <span className="title-icon">💡</span>
                        Suggested
                      </h3>
                      <ul className="carry-list">
                        {ride.thingsToCarrySuggested && ride.thingsToCarrySuggested.length > 0 ? (
                          ride.thingsToCarrySuggested.map((item, index) => (
                            <li key={index}>
                              <span className="list-icon">📌</span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <li><span className="list-icon">📌</span>No suggested items specified</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : ride.thingsToCarry && ride.thingsToCarry.length > 0 ? (
                  // Legacy support for old thingsToCarry field
                  <div className="carry-grid">
                    <div className="carry-column">
                      <h3 className="carry-column-title mandatory">
                        <span className="title-icon">⚠️</span>
                        Mandatory
                      </h3>
                      <ul className="carry-list">
                        {ride.thingsToCarry.slice(0, Math.ceil(ride.thingsToCarry.length / 2)).map((item, index) => (
                          <li key={index}>
                            <span className="list-icon">📌</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="carry-column">
                      <h3 className="carry-column-title suggested">
                        <span className="title-icon">💡</span>
                        Suggested
                      </h3>
                      <ul className="carry-list">
                        {ride.thingsToCarry.slice(Math.ceil(ride.thingsToCarry.length / 2)).map((item, index) => (
                          <li key={index}>
                            <span className="list-icon">📌</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Default fallback
                  <div className="carry-grid">
                    <div className="carry-column">
                      <h3 className="carry-column-title mandatory">
                        <span className="title-icon">⚠️</span>
                        Mandatory
                      </h3>
                      <ul className="carry-list">
                        <li><span className="list-icon">📌</span>RainCoat</li>
                        <li><span className="list-icon">📌</span>Jacket/Thermal wear</li>
                        <li><span className="list-icon">📌</span>Driving Licence (if driving or riding)</li>
                        <li><span className="list-icon">📌</span>Vehicle Documents</li>
                        <li><span className="list-icon">📌</span>Your Adhaar Card</li>
                        <li><span className="list-icon">📌</span>Riding Gear - Jacket, Helmet is must (Bikers)</li>
                      </ul>
                    </div>
                    <div className="carry-column">
                      <h3 className="carry-column-title suggested">
                        <span className="title-icon">💡</span>
                        Suggested
                      </h3>
                      <ul className="carry-list">
                        <li><span className="list-icon">📌</span>Power bank</li>
                        <li><span className="list-icon">📌</span>Sunglasses</li>
                        <li><span className="list-icon">📌</span>Camera</li>
                        <li><span className="list-icon">📌</span>Water bottle</li>
                        <li><span className="list-icon">📌</span>Snacks</li>
                        <li><span className="list-icon">📌</span>Personal medication</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Policy Section */}
            <div id="policy-section" className="tab-panel policy-panel">
              <h2>Policy</h2>
              
              {/* Two Column Grid for Cancellations and Payment Terms */}
              <div className="policy-grid">
                {/* Cancellations Column - Left */}
                <div className="policy-column">
                  <h3 className="policy-column-title cancellations">
                    <span className="title-icon">🚫</span>
                    Cancellations
                  </h3>
                  <div className="policy-column-content">
                    {ride.cancellationPolicy ? (
                      <div className="policy-text" style={{ whiteSpace: 'pre-line' }}>
                        {ride.cancellationPolicy}
                      </div>
                    ) : (
                      <div className="policy-items">
                        <div className="policy-item-box warning">
                          <p><strong>⚠️</strong> Bookings once done cannot be cancelled.</p>
                        </div>
                        <div className="policy-item-box warning">
                          <p><strong>⚠️</strong> If you wish to cancel due to any reason, you can use the paid amount for future trip</p>
                        </div>
                        <div className="policy-item-box warning">
                          <p><strong>⚠️</strong> No refund would be done for this trip.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Terms Column - Right */}
                <div className="policy-column">
                  <h3 className="policy-column-title payment">
                    <span className="title-icon">💳</span>
                    Payment Terms
                  </h3>
                  <div className="policy-column-content">
                    {ride.paymentTerms ? (
                      <div className="policy-text" style={{ whiteSpace: 'pre-line' }}>
                        {ride.paymentTerms}
                      </div>
                    ) : (
                      <div className="policy-items">
                        <div className="policy-item-box info">
                          <p><strong>📌</strong> Booking amount is required to confirm your spot</p>
                        </div>
                        <div className="policy-item-box info">
                          <p><strong>📌</strong> Remaining amount to be paid before the trip starts</p>
                        </div>
                        <div className="policy-item-box info">
                          <p><strong>📌</strong> Payment can be made via UPI, bank transfer, or cash</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* How to Join Section */}
              {ride.howToJoin && (
                <div className="policy-subsection">
                  <h3 className="policy-subsection-title">
                    <span className="subsection-icon">🎯</span>
                    How to Join This Trip
                  </h3>
                  <div className="policy-content">
                    <div className="policy-text" style={{ whiteSpace: 'pre-line' }}>
                      {ride.howToJoin}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="details-sidebar">
          <div className="booking-card">
            {/* Last Booking Date Ribbon */}
            {ride.lastBookingDate && (
              <div className="last-booking-ribbon">
                <div className="ribbon-icon">⏰</div>
                <div className="ribbon-content">
                  <div className="ribbon-label">Last Date for Booking</div>
                  <div className="ribbon-date">{new Date(ride.lastBookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            )}
            
            {/* Price Cards Grid */}
            <div className="price-cards-container">
              {/* Ride Amount Card - Only show if tripCost or price is provided and not 0 */}
              {((ride.tripCost && ride.tripCost !== '0' && ride.tripCost !== '₹0') || 
                (ride.price && ride.price !== '0' && ride.price !== '₹0')) && (
                <div className="price-info-card ride-amount-card">
                  <div className="price-card-amount-large">
                    {ride.tripCost 
                      ? (ride.tripCost.startsWith('₹') ? ride.tripCost : `₹${ride.tripCost}`)
                      : `₹${ride.price}`}
                  </div>
                  <div className="price-card-label">Ride Amount</div>
                  <div className="price-card-note">
                    {ride.tripCost ? 'Total trip cost' : 'per person'}
                  </div>
                </div>
              )}

              {/* Booking Amount Card - Only show if bookingCost is provided and not 0 */}
              {ride.bookingCost && ride.bookingCost !== '0' && ride.bookingCost !== '₹0' && (
                <div className="price-info-card booking-amount-card">
                  <div className="price-card-amount-large">
                    {ride.bookingCost.startsWith('₹') ? ride.bookingCost : `₹${ride.bookingCost}`}
                  </div>
                  <div className="price-card-label">Booking Amount</div>
                  <div className="price-card-note">
                    to reserve your spot
                  </div>
                </div>
              )}
            </div>
            
            <button className="book-now-btn-large" onClick={handleBookNow}>
              Register Now
            </button>
            
            <button className="share-btn" onClick={handleShare}>
              <span className="share-icon">{copied ? '✓' : '🔗'}</span>
              {copied ? 'Link Copied!' : 'Share This Ride'}
            </button>
          </div>

        </div>
      </div>

      {/* Similar Rides Section */}
      {similarRides.length > 0 && (
        <div className="similar-rides-section">
          <div className="section-container">
            <h2 className="section-title-similar">You Might Also Like</h2>
            <div className="similar-rides-grid">
              {similarRides.map((similarRide) => (
                <div 
                  key={similarRide.id} 
                  className="similar-ride-card"
                  onClick={() => navigate(`/ride/${similarRide.id}`)}
                >
                  <div className="similar-ride-image">
                    <img src={similarRide.image} alt={similarRide.title} />
                  </div>
                  <div className="similar-ride-content">
                    <h3>{similarRide.title}</h3>
                    <p className="similar-ride-date">
                      {similarRide.startDate && similarRide.endDate 
                        ? formatDateRange(similarRide.startDate, similarRide.endDate)
                        : 'Date TBD'}
                    </p>
                    <div className="similar-ride-meta">
                      <span>{similarRide.duration}</span>
                      <span>•</span>
                      <span>{similarRide.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RideDetails;

