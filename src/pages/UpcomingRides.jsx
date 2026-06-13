import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components';
import { heroManager, rideManager, featuredRideManager } from '../services/firebaseDataManager';
import { formatDateRange } from '../utils/dateUtils';
import logo from '../assets/logo.png';

const UpcomingRides = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [featuredRide, setFeaturedRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Set up real-time listeners for hero slides and featured ride
    const unsubscribeHero = heroManager.listenToSlides((slides) => {
      console.log('🎬 Hero Slides updated from Firebase:', slides);
      // Only show slides that exist in Firebase (admin panel)
      setHeroSlides(slides);
    });
    
    const unsubscribeFeatured = featuredRideManager.listenToFeaturedRide((featured) => {
      console.log('🌟 Featured Ride updated from Firebase:', featured);
      setFeaturedRide(featured);
    });
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeHero();
      unsubscribeFeatured();
    };
  }, []);

  const loadData = async () => {
    try {
      const [slides, rides, featured] = await Promise.all([
        heroManager.getSlides(),
        rideManager.getUpcomingRides(),
        featuredRideManager.getFeaturedRide()
      ]);
      
      console.log('🎬 Initial Hero Slides from Firebase:', slides);
      console.log('🌟 Initial Featured Ride from Firebase:', featured);
      
      // Migrate any old data format
      const migratedRides = rides.map(ride => rideManager.migrateRideData(ride));
      
      // Set featured ride (will be updated by listener)
      setFeaturedRide(featured);
      
      // Only show slides that exist in Firebase (admin panel)
      setHeroSlides(slides);

      // If no rides from Firebase, use default rides
      if (migratedRides.length === 0) {
        setUpcomingRides([
          {
            id: 1,
            title: "Spiti Valley Expedition - The Desert Mountain",
            startDate: "2025-11-15",
            endDate: "2025-11-22",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            description: "Embark on an unforgettable journey through the cold desert of Spiti Valley, exploring ancient monasteries, pristine landscapes, and thrilling high-altitude passes.",
            duration: "8D 7N",
            distance: "1850 km"
          },
          {
            id: 2,
            title: "Coastal Karnataka Adventure",
            startDate: "2025-11-08",
            endDate: "2025-11-10",
            image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
            description: "Ride along the stunning Konkan coastline from Mangalore to Gokarna, discovering hidden beaches, temples, and coastal cuisine.",
            duration: "3D 2N",
            distance: "380 km"
          },
          {
            id: 3,
            title: "Leh-Ladakh Ultimate Expedition",
            startDate: "2025-12-01",
            endDate: "2025-12-12",
            image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=400&h=300&fit=crop",
            description: "The legendary Leh-Ladakh circuit covering Khardung La, Nubra Valley, Pangong Lake, and the mesmerizing landscapes of the Himalayas.",
            duration: "12D 11N",
            distance: "2400 km"
          },
          {
            id: 4,
            title: "Weekend Gateway - Chikmagalur Coffee Trail",
            startDate: "2025-10-25",
            endDate: "2025-10-26",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            description: "A relaxing weekend ride through coffee plantations, waterfalls, and the lush Western Ghats of Chikmagalur.",
            duration: "2D 1N",
            distance: "285 km"
          },
          {
            id: 5,
            title: "Meghalaya - Abode of Clouds",
            startDate: "2025-11-20",
            endDate: "2025-11-26",
            image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop",
            description: "Explore the wettest place on Earth! Ride through living root bridges, crystal clear rivers, waterfalls, and the stunning landscapes of Meghalaya.",
            duration: "7D 6N",
            distance: "980 km"
          }
        ]);
      } else {
        setUpcomingRides(migratedRides);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (heroSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleJoinCommunity = () => {
    navigate('/contact');
  };


  return (
    <div className="upcoming-rides">
      {/* Auto-Scrolling Hero Section - Only show if slides exist in admin panel */}
      {heroSlides.length > 0 && (
        <div className="hero-carousel">
          <div className="hero-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide) => (
              <div key={slide.id} className="hero-slide">
                <div 
                  className="hero-background" 
                  style={{ backgroundImage: `url(${slide.background})` }}
                >
                  <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                  <div className="hero-logo">
                    <img src={logo} alt="Travel Website Logo" className="hero-logo-img" />
                  </div>
                  <h1 className="hero-title">{slide.title}</h1>
                  <h2 className="hero-subtitle">{slide.subtitle}</h2>
                  <h3 className="hero-tagline">{slide.tagline}</h3>
                  <div className="hero-cta">
                    <button className="hero-btn primary">{slide.cta}</button>
                    <button className="hero-btn secondary">Learn More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="hero-nav hero-nav-prev"
            onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
          >
            &#8249;
          </button>
          <button 
            className="hero-nav hero-nav-next"
            onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
            aria-label="Next slide"
          >
            &#8250;
          </button>
        </div>
      )}

      {/* Featured Ride Banner */}
      {featuredRide && featuredRide.isActive && (
        <div className="featured-ride-banner">
          <div className="banner-content">
            <div className="banner-text">
              <h2>{featuredRide.title}</h2>
              <h3>{featuredRide.subtitle}</h3>
              <p>{featuredRide.description}</p>
              <button 
                className="banner-btn" 
                onClick={() => {
                  if (featuredRide.ctaLink) {
                    // If ctaLink starts with /ride/, navigate to that ride
                    if (featuredRide.ctaLink.startsWith('/ride/')) {
                      navigate(featuredRide.ctaLink);
                    } else if (featuredRide.ctaLink.startsWith('http')) {
                      // If it's an external link, open in new tab
                      window.open(featuredRide.ctaLink, '_blank');
                    } else {
                      // Otherwise navigate to it
                      navigate(featuredRide.ctaLink);
                    }
                  } else {
                    // Default to first upcoming ride or contact page
                    upcomingRides.length > 0 ? navigate(`/ride/${upcomingRides[0].id}`) : navigate('/contact');
                  }
                }}
              >
                {featuredRide.ctaText}
              </button>
            </div>
            <div className="banner-image">
              <img src={featuredRide.image} alt={featuredRide.subtitle} />
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Rides Section */}
      <div className="rides-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Rides</h2>
          <p className="section-subtitle">Choose your next adventure from our carefully curated selection</p>
        </div>
        <div className="rides-grid">
          {upcomingRides.map((ride) => (
            <div key={ride.id} className="ride-card">
              <div className="ride-image">
                <img src={ride.image} alt={ride.title} />
              </div>
              <div className="ride-content">
                <div className="ride-meta">
                  <span className="ride-duration">{ride.duration}</span>
                  <span className="ride-distance">{ride.distance}</span>
                  {((ride.tripCost && ride.tripCost !== '0' && ride.tripCost !== '₹0') || 
                    (ride.price && ride.price !== '0' && ride.price !== '₹0')) && (
                    <span className="ride-booking">
                      {ride.tripCost 
                        ? (ride.tripCost.startsWith('₹') ? ride.tripCost : `₹${ride.tripCost}`)
                        : `₹${ride.price}`}
                    </span>
                  )}
                </div>
                <h3 className="ride-title">{ride.title}</h3>
                <p className="ride-date">{ride.startDate && ride.endDate ? formatDateRange(ride.startDate, ride.endDate) : 'Date TBD'}</p>
                <p className="ride-description">{ride.description}</p>
                <div className="ride-actions">
                  <button className="view-details-btn" onClick={() => navigate(`/ride/${ride.id}`)}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join our community of passionate riders and discover the world on two wheels</p>
          <div className="cta-buttons">
            <button className="cta-btn primary" onClick={handleJoinCommunity}>Join Our Community</button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UpcomingRides;
