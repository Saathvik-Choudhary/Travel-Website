import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components';
import { statsManager, rideManager } from '../services/firebaseDataManager';
import { formatDateRange } from '../utils/dateUtils';

const PreviousRides = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    completedRides: 47,
    happyRiders: 320,
    kilometersCovered: 18500
  });
  const [previousRides, setPreviousRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedStats, rides] = await Promise.all([
        statsManager.getStats(),
        rideManager.getPreviousRides()
      ]);
      
      setStats(savedStats);
      
      // Migrate any old data format
      const migratedRides = rides.map(ride => rideManager.migrateRideData(ride));
      
      // If no rides from Firebase, use default rides
      if (migratedRides.length === 0) {
        setPreviousRides([
          {
            id: 1,
            title: "Rajasthan Royal Heritage Ride",
            startDate: "2025-09-10",
            endDate: "2025-09-17",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            description: "An incredible journey through royal Rajasthan covering Jaipur, Pushkar, Udaipur, and Jodhpur. Witnessed stunning forts, palaces, and desert landscapes.",
            participants: 18,
            distance: "1240 km",
            duration: "8D 7N"
          },
          {
            id: 2,
            title: "Goa Monsoon Magic",
            startDate: "2025-08-22",
            endDate: "2025-08-25",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            description: "Rode through the lush green landscapes of monsoon Goa, exploring hidden waterfalls, spice plantations, and pristine beaches.",
            participants: 14,
            distance: "420 km",
            duration: "4D 3N"
          },
          {
            id: 3,
            title: "Himalayan Adventure - Manali Circuit",
            startDate: "2025-07-15",
            endDate: "2025-07-21",
            image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=400&h=300&fit=crop",
            description: "Epic ride through Rohtang Pass, Solang Valley, and the stunning Himalayan ranges around Manali. Unforgettable mountain vistas!",
            participants: 16,
            distance: "850 km",
            duration: "7D 6N"
          },
          {
            id: 4,
            title: "Tamil Nadu Temple Trail",
            startDate: "2025-06-28",
            endDate: "2025-07-01",
            image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop",
            description: "Cultural expedition covering ancient temples of Thanjavur, Madurai, Rameswaram, and Kanyakumari. Rich heritage and stunning architecture!",
            participants: 11,
            distance: "680 km",
            duration: "4D 3N"
          },
          {
            id: 5,
            title: "Konkan Coastal Ride",
            startDate: "2025-05-12",
            endDate: "2025-05-14",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
            description: "Breathtaking coastal ride along the Konkan coast from Mumbai to Goa, exploring pristine beaches, ancient forts, and delicious seafood.",
            participants: 20,
            distance: "620 km",
            duration: "3D 2N"
          },
          {
            id: 6,
            title: "Weekend Escape - Coorg Plantations",
            startDate: "2025-04-20",
            endDate: "2025-04-21",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            description: "Perfect weekend getaway through misty coffee estates, rolling hills, and Abbey Falls in the Scotland of India.",
            participants: 9,
            distance: "295 km",
            duration: "2D 1N"
          }
        ]);
      } else {
        setPreviousRides(migratedRides);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="previous-rides">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Past Adventures</h1>
          <p className="page-subtitle">Relive the memories of our completed rides and adventures</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{loading ? '...' : `${stats.completedRides}+`}</div>
            <div className="stat-label">Completed Rides</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{loading ? '...' : `${stats.happyRiders}+`}</div>
            <div className="stat-label">Happy Riders</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{loading ? '...' : `${stats.kilometersCovered.toLocaleString()}+`}</div>
            <div className="stat-label">Kilometers Covered</div>
          </div>
        </div>
      </div>

      {/* Rides Section */}
      <div className="rides-section">
        <div className="section-header">
          <h2 className="section-title">Completed Rides</h2>
          <p className="section-subtitle">Each ride tells a story of adventure, friendship, and discovery</p>
        </div>
        <div className="rides-grid">
          {previousRides.map((ride) => (
            <div key={ride.id} className="ride-card past-ride">
              <div className="ride-image">
                <img src={ride.image} alt={ride.title} />
                <div className="ride-badge">Completed</div>
              </div>
              <div className="ride-content">
                <div className="ride-meta">
                  <span className="ride-duration">{ride.duration}</span>
                  <span className="ride-distance">{ride.distance}</span>
                </div>
                <h3 className="ride-title">{ride.title}</h3>
                <p className="ride-date">{ride.startDate && ride.endDate ? formatDateRange(ride.startDate, ride.endDate) : 'Date TBD'}</p>
                <p className="ride-description">{ride.description}</p>
                <div className="ride-stats">
                  <span className="stat">
                    <strong>{ride.participants}</strong> Riders
                  </span>
                  <span className="stat">
                    <strong>{ride.distance}</strong> Total
                  </span>
                </div>
                <div className="ride-actions">
                  <button 
                    className="instagram-btn" 
                    onClick={() => {
                      if (ride.instagramUrl) {
                        window.open(ride.instagramUrl, '_blank');
                      } else {
                        alert('Instagram link not available for this ride yet.');
                      }
                    }}
                  >
                    Instagram
                  </button>
                  <button 
                    className="youtube-btn"
                    onClick={() => {
                      if (ride.youtubeUrl) {
                        window.open(ride.youtubeUrl, '_blank');
                      } else {
                        alert('YouTube video not available for this ride yet.');
                      }
                    }}
                  >
                    YouTube
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviousRides;
