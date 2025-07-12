// Bonuses/main.js
// Structure: { id, reason, xp, message, category, oncePerDay }

export const BONUSES = [
  // RECORDS Category - New Best Achievements (once per day)
  {
    id: 'new_best_xp_day',
    reason: 'New best XP in a day',
    xp: 10,
    message: 'New record! Best XP day ever!',
    quote: 'Records are made to be broken.',
    category: 'records',
    oncePerDay: true
  },
  {
    id: 'new_best_duration_day',
    reason: 'New best actual duration in a day',
    xp: 10,
    message: 'New record! Most productive day ever!',
    quote: 'Time is the most valuable coin in your life.',
    category: 'records',
    oncePerDay: true
  },
  {
    id: 'new_best_productivity_day',
    reason: 'New best productivity in a day',
    xp: 10,
    message: 'New record! Most efficient day ever!',
    quote: 'Efficiency is doing things right; effectiveness is doing the right things.',
    category: 'records',
    oncePerDay: true
  },
  {
    id: 'beat_yesterday_xp',
    reason: 'More XP than yesterday',
    xp: 5,
    message: 'You earned more XP today than yesterday!',
    quote: 'Say "no" to everything that doesn\'t contribute to a long-term goal.',
    category: 'records',
    oncePerDay: true
  },
  {
    id: 'twelfth_task_of_day',
    reason: '12th finished task of the day',
    xp: 5,
    message: 'Incredible! You finished 12 tasks today!',
    quote: 'Break the frame. How can I achieve this 5 times faster and 5 times better?',
    category: 'records',
    oncePerDay: true
  },
  
  // REWARDS Category - Task Completion Rewards
  {
    id: 'first_task_streak_bonus',
    reason: 'First task completion streak bonus',
    xp: 0, // Calculated dynamically
    message: 'Streak bonus for first task!',
    quote: 'The first step is always the hardest.',
    category: 'rewards',
    oncePerDay: true
  },
  {
    id: 'type1_task',
    reason: 'Quality A, Priority 1, Pure, ≥2 hours',
    xp: 20,
    message: 'Excellent! High-quality, high-priority, pure focus task!',
    quote: 'Quality is not an act, it is a habit.',
    category: 'rewards',
    oncePerDay: false
  },
  {
    id: 'type2_task',
    reason: 'Quality A, Priority 1, Pure, ≥4 hours',
    xp: 50,
    message: 'Outstanding! Epic high-quality, high-priority, pure focus task!',
    quote: 'Great things are done by a series of small things brought together.',
    category: 'rewards',
    oncePerDay: false
  },
  {
    id: 'three_type1_tasks',
    reason: '3 Type 1 tasks completed',
    xp: 50,
    message: 'Amazing! 3 high-quality, high-priority, pure focus tasks!',
    quote: 'Consistency is the hallmark of the unimaginative.',
    category: 'rewards',
    oncePerDay: true
  },
  {
    id: 'three_type2_tasks',
    reason: '3 Type 2 tasks completed',
    xp: 100,
    message: 'Legendary! 3 epic high-quality, high-priority, pure focus tasks!',
    quote: 'Excellence is not a skill. It\'s an attitude.',
    category: 'rewards',
    oncePerDay: true
  },
  
  // Keep existing
  {
    id: 'week_fully_planned',
    reason: 'Next week fully planned (18h+ each day)',
    xp: 50,
    message: 'Amazing! All days of next week are fully planned (18h+ each)!',
    quote: 'A week well planned is a week half done.',
    category: 'rewards',
    oncePerDay: true
  },
  {
    id: 'today_well_planned_not_sunday',
    reason: 'Today well planned (18h+) and not planned on Sunday',
    xp: 30,
    message: 'Great planning! Today is well planned and you didn\'t wait until Sunday!',
    quote: 'Planning is bringing the future into the present so that you can do something about it now.',
    category: 'rewards',
    oncePerDay: true
  }
];

// Utility to get a bonus by id
export function getBonusById(id) {
  return BONUSES.find(b => b.id === id);
}

// Utility to get bonuses by category
export function getBonusesByCategory(category) {
  return BONUSES.filter(b => b.category === category);
} 