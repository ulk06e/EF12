import React, { useState, useEffect } from 'react';
import { BADGES, calculateBadgeProgress } from './badgeCalculations';
import BadgeEarnedPopup from './BadgeEarnedPopup';
import './Badges.css';
import 'src/Pages/stat/components/Menu/Menu.css';

function BadgeCard({ badge, progress, items, bonusHistory, onBadgeEarned }) {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(null);

  useEffect(() => {
    async function loadBadgeData() {
      setLoading(true);
      try {
        const data = await calculateBadgeProgress(badge.id, items, bonusHistory);
        setBadgeData(data);
        
        // Check if a new level was achieved
        if (data.currentLevel && data.currentLevel !== previousLevel && previousLevel !== null) {
          // New level achieved!
          onBadgeEarned(badge, data.currentLevel);
        }
        
        setPreviousLevel(data.currentLevel);
      } catch (error) {
        console.error('Error calculating badge progress:', error);
        setBadgeData(null);
      }
      setLoading(false);
    }

    loadBadgeData();
  }, [badge.id, items, bonusHistory, previousLevel, onBadgeEarned]);

  if (loading) {
    return (
      <div className="badge-card">
        <div className="badge-name">{badge.name}</div>
        <div className="badge-description">Loading...</div>
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className="badge-card">
        <div className="badge-name">{badge.name}</div>
        <div className="badge-description">Error loading badge data</div>
      </div>
    );
  }

  const { count, currentLevel, nextLevel, progress: progressPercent } = badgeData;

  // Determine badge icon and class
  const getBadgeIcon = (level) => {
    if (!level) return { icon: '', class: 'none' };
    
    const levelMap = {
      'Bronze': { icon: '🥉', class: 'bronze' },
      'Silver': { icon: '🥈', class: 'silver' },
      'Gold': { icon: '🥇', class: 'gold' },
      'Platinum': { icon: '💎', class: 'platinum' }
    };
    
    return levelMap[level.name] || { icon: '', class: 'none' };
  };

  const currentBadge = getBadgeIcon(currentLevel);
  const nextBadge = getBadgeIcon(nextLevel);

  // Format count based on badge type
  const formatCount = (count, badgeId) => {
    if (badgeId === 'pure_focus_master') {
      return `${Math.round(count)}h`;
    }
    if (badgeId === 'xp_millionaire') {
      return count.toLocaleString();
    }
    return count.toString();
  };

  return (
    <div className="badge-card">
      <div className="badge-header">
        <h3 className="badge-name">{badge.name}</h3>
      </div>
      
      <div className="badge-levels">
        <div className="current-badge">
          <div className={`badge-icon ${currentBadge.class}`}>
            {currentBadge.icon}
          </div>
        </div>
      </div>
      
      <div className="badge-progress">
        <div className="progress-text">
          {formatCount(count, badge.id)} / {nextLevel ? formatCount(nextLevel.threshold, badge.id) : 'Complete'}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="badge-description">
        {badge.description}
      </div>
    </div>
  );
}

export default function Badges({ items = [], bonusHistory = [] }) {
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [earnedLevel, setEarnedLevel] = useState(null);

  const handleBadgeEarned = (badge, level) => {
    setEarnedBadge(badge);
    setEarnedLevel(level);
  };

  const handleClosePopup = () => {
    setEarnedBadge(null);
    setEarnedLevel(null);
  };

  return (
    <div className="column-container">
      <div className="column-header">
        <h3>Badges</h3>
      </div>
      
      <div className="badges-grid">
        {BADGES.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            items={items}
            bonusHistory={bonusHistory}
            onBadgeEarned={handleBadgeEarned}
          />
        ))}
      </div>
      
      <BadgeEarnedPopup
        open={!!earnedBadge}
        onClose={handleClosePopup}
        badge={earnedBadge}
        level={earnedLevel}
      />
    </div>
  );
} 