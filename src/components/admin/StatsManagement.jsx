import React, { useState, useEffect } from 'react';
import { statsManager, rideManager } from '../../services/firebaseDataManager';
import { getStatsBreakdown, formatStatsForDisplay } from '../../utils/statsCalculator';

const StatsManagement = () => {
  const [stats, setStats] = useState({
    completedRides: 0,
    happyRiders: 0,
    kilometersCovered: 0,
    monthsOfAdventure: 0
  });
  const [statsBreakdown, setStatsBreakdown] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [savedStats, rides] = await Promise.all([
        statsManager.getStats(),
        rideManager.getAllRides()
      ]);
      
      setStats(savedStats);
      
      // Calculate detailed breakdown
      const breakdown = getStatsBreakdown(rides);
      setStatsBreakdown(breakdown);
    } catch (error) {
      console.error('Error loading stats:', error);
      showMessage('error', 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleRefreshStats = async () => {
    try {
      setIsLoading(true);
      const success = await statsManager.autoUpdateStats();
      if (success) {
        showMessage('success', 'Statistics refreshed successfully!');
        await loadStats();
      } else {
        showMessage('error', 'Failed to refresh statistics');
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      showMessage('error', 'An error occurred while refreshing statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, description }) => (
    <div className="admin-card stat-preview-card">
      <div className="stat-preview-header">
        <span className="stat-preview-icon">{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className="stat-preview-value">{value}</div>
      <div className="stat-preview-description">{description}</div>
    </div>
  );

  return (
    <div className="stats-management">
      <div className="admin-section">
        <div className="section-header">
          <div>
            <h2>Statistics Management</h2>
            <p>Statistics are automatically calculated from your rides data.</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleRefreshStats}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh Stats'}
          </button>
        </div>
        
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3>Current Statistics Preview</h3>
        <div className="admin-grid-4">
          <StatCard
            title="Completed Rides"
            value={`${stats.completedRides}+`}
            icon="🚴"
            description="Total number of completed cycling adventures"
          />
          <StatCard
            title="Happy Riders"
            value={`${stats.happyRiders}+`}
            icon="👥"
            description="Total number of satisfied participants"
          />
          <StatCard
            title="Kilometers Covered"
            value={`${stats.kilometersCovered.toLocaleString()}+`}
            icon="🛣️"
            description="Total distance covered in all rides"
          />
          <StatCard
            title="Months of Adventure"
            value={stats.monthsOfAdventure}
            icon="📅"
            description="Duration of your adventure business"
          />
        </div>
      </div>

      <div className="admin-section">
        <h3>Detailed Statistics Breakdown</h3>
        <div className="admin-grid-2">
          <div className="admin-card">
            <h4>Ride Summary</h4>
            <div className="stats-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Total Rides:</span>
                <span className="breakdown-value">{statsBreakdown.totalRides || 0}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Upcoming:</span>
                <span className="breakdown-value upcoming">{statsBreakdown.upcomingRides || 0}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Completed:</span>
                <span className="breakdown-value completed">{statsBreakdown.completedRides || 0}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Cancelled:</span>
                <span className="breakdown-value cancelled">{statsBreakdown.cancelledRides || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="admin-card">
            <h4>Performance Metrics</h4>
            <div className="stats-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Average Participants:</span>
                <span className="breakdown-value">{statsBreakdown.averageParticipants || 0}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Average Distance:</span>
                <span className="breakdown-value">{statsBreakdown.averageDistance || 0} km</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Total Participants:</span>
                <span className="breakdown-value">{statsBreakdown.totalParticipants || 0}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Total Distance:</span>
                <span className="breakdown-value">{statsBreakdown.totalKilometers || 0} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsManagement;
