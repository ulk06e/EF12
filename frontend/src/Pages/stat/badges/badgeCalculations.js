// Badge calculations and thresholds

export const BADGES = [
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Beat yesterday\'s XP',
    category: 'records',
    levels: [
      { name: 'Bronze', threshold: 10, color: '#cd7f32' },
      { name: 'Silver', threshold: 50, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100, color: '#ffd700' },
      { name: 'Platinum', threshold: 250, color: '#e5e4e2' }
    ]
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete exactly 12 tasks in a day',
    category: 'records',
    levels: [
      { name: 'Bronze', threshold: 1, color: '#cd7f32' },
      { name: 'Silver', threshold: 5, color: '#c0c0c0' },
      { name: 'Gold', threshold: 10, color: '#ffd700' },
      { name: 'Platinum', threshold: 25, color: '#e5e4e2' }
    ]
  },
  {
    id: 'quality_champion',
    name: 'Quality Champion',
    description: 'Complete Type 1 tasks (A, P1, Pure, ≥2h)',
    category: 'rewards',
    levels: [
      { name: 'Bronze', threshold: 10, color: '#cd7f32' },
      { name: 'Silver', threshold: 50, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100, color: '#ffd700' },
      { name: 'Platinum', threshold: 250, color: '#e5e4e2' }
    ]
  },
  {
    id: 'epic_achiever',
    name: 'Epic Achiever',
    description: 'Complete Type 2 tasks (A, P1, Pure, ≥4h)',
    category: 'rewards',
    levels: [
      { name: 'Bronze', threshold: 5, color: '#cd7f32' },
      { name: 'Silver', threshold: 25, color: '#c0c0c0' },
      { name: 'Gold', threshold: 50, color: '#ffd700' },
      { name: 'Platinum', threshold: 100, color: '#e5e4e2' }
    ]
  },
  {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Complete 3 Type 1 tasks in a day',
    category: 'rewards',
    levels: [
      { name: 'Bronze', threshold: 1, color: '#cd7f32' },
      { name: 'Silver', threshold: 5, color: '#c0c0c0' },
      { name: 'Gold', threshold: 10, color: '#ffd700' },
      { name: 'Platinum', threshold: 25, color: '#e5e4e2' }
    ]
  },
  {
    id: 'legendary_trio',
    name: 'Legendary Trio',
    description: 'Complete 3 Type 2 tasks in a day',
    category: 'rewards',
    levels: [
      { name: 'Bronze', threshold: 1, color: '#cd7f32' },
      { name: 'Silver', threshold: 3, color: '#c0c0c0' },
      { name: 'Gold', threshold: 5, color: '#ffd700' },
      { name: 'Platinum', threshold: 10, color: '#e5e4e2' }
    ]
  },
  {
    id: 'planner_pro',
    name: 'Planner Pro',
    description: 'Week fully planned',
    category: 'rewards',
    levels: [
      { name: 'Bronze', threshold: 1, color: '#cd7f32' },
      { name: 'Silver', threshold: 5, color: '#c0c0c0' },
      { name: 'Gold', threshold: 10, color: '#ffd700' },
      { name: 'Platinum', threshold: 25, color: '#e5e4e2' }
    ]
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete tasks on weekends (≥50% weekly avg & >30 XP)',
    category: 'activity',
    levels: [
      { name: 'Bronze', threshold: 10, color: '#cd7f32' },
      { name: 'Silver', threshold: 50, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100, color: '#ffd700' },
      { name: 'Platinum', threshold: 250, color: '#e5e4e2' }
    ]
  },
  {
    id: 'pure_focus_master',
    name: 'Pure Focus Master',
    description: 'Complete pure focus tasks (measured in hours)',
    category: 'focus',
    levels: [
      { name: 'Bronze', threshold: 50, color: '#cd7f32' },
      { name: 'Silver', threshold: 250, color: '#c0c0c0' },
      { name: 'Gold', threshold: 500, color: '#ffd700' },
      { name: 'Platinum', threshold: 1000, color: '#e5e4e2' }
    ]
  },
  {
    id: 'priority_master',
    name: 'Priority Master',
    description: 'Complete priority 1 tasks',
    category: 'priority',
    levels: [
      { name: 'Bronze', threshold: 100, color: '#cd7f32' },
      { name: 'Silver', threshold: 500, color: '#c0c0c0' },
      { name: 'Gold', threshold: 1000, color: '#ffd700' },
      { name: 'Platinum', threshold: 2500, color: '#e5e4e2' }
    ]
  },
  {
    id: 'quality_seeker',
    name: 'Quality Seeker',
    description: 'Complete A-quality tasks',
    category: 'quality',
    levels: [
      { name: 'Bronze', threshold: 100, color: '#cd7f32' },
      { name: 'Silver', threshold: 500, color: '#c0c0c0' },
      { name: 'Gold', threshold: 1000, color: '#ffd700' },
      { name: 'Platinum', threshold: 2500, color: '#e5e4e2' }
    ]
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Complete tasks ≥4 hours',
    category: 'endurance',
    levels: [
      { name: 'Bronze', threshold: 10, color: '#cd7f32' },
      { name: 'Silver', threshold: 50, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100, color: '#ffd700' },
      { name: 'Platinum', threshold: 250, color: '#e5e4e2' }
    ]
  },
  {
    id: 'consistency_legend',
    name: 'Consistency Legend',
    description: 'Maintain streak for X days',
    category: 'streak',
    levels: [
      { name: 'Bronze', threshold: 7, color: '#cd7f32' },
      { name: 'Silver', threshold: 30, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100, color: '#ffd700' },
      { name: 'Platinum', threshold: 365, color: '#e5e4e2' }
    ]
  },
  {
    id: 'xp_millionaire',
    name: 'XP Millionaire',
    description: 'Earn total XP milestones',
    category: 'xp',
    levels: [
      { name: 'Bronze', threshold: 10000, color: '#cd7f32' },
      { name: 'Silver', threshold: 50000, color: '#c0c0c0' },
      { name: 'Gold', threshold: 100000, color: '#ffd700' },
      { name: 'Platinum', threshold: 500000, color: '#e5e4e2' }
    ]
  }
];

// Helper to get badge by id
export function getBadgeById(id) {
  return BADGES.find(b => b.id === id);
}

// Helper to get badges by category
export function getBadgesByCategory(category) {
  return BADGES.filter(b => b.category === category);
}

// Calculate badge progress and current level
export async function calculateBadgeProgress(badgeId, items, bonusHistory = []) {
  const badge = getBadgeById(badgeId);
  if (!badge) return null;

  let count = 0;
  const today = new Date().toISOString().slice(0, 10);

  switch (badgeId) {
    case 'consistency_king':
      // Count days where yesterday's XP was beaten
      count = bonusHistory.filter(b => b.bonusId === 'beat_yesterday_xp').length;
      break;

    case 'task_master':
      // Count days with exactly 12 tasks
      count = bonusHistory.filter(b => b.bonusId === 'twelfth_task_of_day').length;
      break;

    case 'quality_champion':
      // Count Type 1 tasks (A, P1, Pure, ≥2h)
      count = items.filter(item => 
        item.completed_time && 
        item.task_quality === 'A' && 
        item.priority === 1 && 
        item.time_quality === 'pure' && 
        (item.actual_duration || 0) >= 120
      ).length;
      break;

    case 'epic_achiever':
      // Count Type 2 tasks (A, P1, Pure, ≥4h)
      count = items.filter(item => 
        item.completed_time && 
        item.task_quality === 'A' && 
        item.priority === 1 && 
        item.time_quality === 'pure' && 
        (item.actual_duration || 0) >= 240
      ).length;
      break;

    case 'triple_threat':
      // Count days with 3 Type 1 tasks
      count = bonusHistory.filter(b => b.bonusId === 'three_type1_tasks').length;
      break;

    case 'legendary_trio':
      // Count days with 3 Type 2 tasks
      count = bonusHistory.filter(b => b.bonusId === 'three_type2_tasks').length;
      break;

    case 'planner_pro':
      // Count weeks fully planned
      count = bonusHistory.filter(b => b.bonusId === 'week_fully_planned').length;
      break;

    case 'weekend_warrior':
      // Count weekends with ≥50% weekly avg & >30 XP
      const weekendDays = getWeekendDays(items);
      count = weekendDays.filter(day => {
        const dayItems = items.filter(item => 
          item.completed_time && 
          (item.day_id || item.completed_time || '').slice(0, 10) === day
        );
        const dayXP = dayItems.reduce((sum, item) => sum + (item.xp_value || 0), 0);
        const weeklyAvg = getWeeklyAverage(items, day);
        return dayXP >= weeklyAvg * 0.5 && dayXP > 30;
      }).length;
      break;

    case 'pure_focus_master':
      // Count pure focus hours
      count = items.filter(item => 
        item.completed_time && 
        item.time_quality === 'pure'
      ).reduce((sum, item) => sum + ((item.actual_duration || 0) / 60), 0);
      break;

    case 'priority_master':
      // Count priority 1 tasks
      count = items.filter(item => 
        item.completed_time && 
        item.priority === 1
      ).length;
      break;

    case 'quality_seeker':
      // Count A-quality tasks
      count = items.filter(item => 
        item.completed_time && 
        item.task_quality === 'A'
      ).length;
      break;

    case 'marathon_runner':
      // Count tasks ≥4 hours
      count = items.filter(item => 
        item.completed_time && 
        (item.actual_duration || 0) >= 240
      ).length;
      break;

    case 'consistency_legend':
      // Get current streak
      const { getCurrentStreak } = await import('../utils/statistics');
      count = getCurrentStreak(items);
      break;

    case 'xp_millionaire':
      // Total XP earned
      count = items.reduce((sum, item) => sum + (item.xp_value || 0), 0);
      break;

    default:
      count = 0;
  }

  // Find current level
  let currentLevel = null;
  let nextLevel = null;

  for (let i = 0; i < badge.levels.length; i++) {
    if (count >= badge.levels[i].threshold) {
      currentLevel = badge.levels[i];
      nextLevel = badge.levels[i + 1] || null;
    } else {
      nextLevel = badge.levels[i];
      break;
    }
  }

  return {
    badge,
    count,
    currentLevel,
    nextLevel,
    progress: nextLevel ? (count / nextLevel.threshold) * 100 : 100
  };
}

// Helper functions
function getWeekendDays(items) {
  const days = new Set(
    items
      .filter(item => item.completed_time)
      .map(item => (item.day_id || item.completed_time || '').slice(0, 10))
  );
  
  return Array.from(days).filter(day => {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  });
}

function getWeeklyAverage(items, dateStr) {
  const date = new Date(dateStr);
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekItems = items.filter(item => {
    if (!item.completed_time) return false;
    const itemDate = new Date((item.day_id || item.completed_time || '').slice(0, 10));
    return itemDate >= weekStart && itemDate <= weekEnd;
  });

  const weekXP = weekItems.reduce((sum, item) => sum + (item.xp_value || 0), 0);
  return weekXP / 7; // Average per day
} 