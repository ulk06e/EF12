// Bonuses/main.js
// Structure: { id, reason, xp, message }

export const BONUSES = [
  {
    id: 'first_task_of_day',
    reason: 'First task of the day',
    xp: 5,
    message: 'You finished your first task today!',
    quote: 'Laziness is absence of clarity.'
  },
  {
    id: 'more_xp_than_yesterday',
    reason: 'More XP than yesterday',
    xp: 7,
    message: 'You earned more XP today than yesterday!',
    quote: 'Say “no” to everything that doesn’t contribute to a long-term goal. Short-term wins are a waste of time.'
  },
  {
    id: 'duration_low',
    reason: 'Long focus session (low)',
    xp: 15,
    message: 'Great job! You focused for a long session!',
    quote: 'Look for what you shouldn’t be doing because you’ve outgrown it.'
  },
  {
    id: 'duration_medium',
    reason: 'Long focus session (medium)',
    xp: 25,
    message: 'Amazing! You completed a very long focus session!',
    quote: 'Play the game for the sake of the game.'
  },
  {
    id: 'tenth_task_of_day',
    reason: '10th finished task of the day',
    xp: 15,
    message: 'Incredible! You finished 10 tasks today!',
    quote: 'Break the frame. How can I achieve this 5 times faster and 5 times better?'
  },
  {
    id: 'three_pure_long_high_quality',
    reason: '3 pure, long, high-quality, high-priority tasks',
    xp: 20,
    message: 'Outstanding! 3 pure, 90+ min, A/B, priority 1-3 tasks!',
    quote: 'Create a scenario where failure would be unbearable for you.'
  },
  {
    id: 'three_very_long_good_quality',
    reason: '3 very long, good-quality, high-priority tasks (at least one pure)',
    xp: 50,
    message: 'Legendary! 3 tasks 4h+, A-C, priority 1-4, at least one pure!',
    quote: 'Personal growth is training yourself on how you respond to hard.'
  }
];

// Utility to get a bonus by id
export function getBonusById(id) {
  return BONUSES.find(b => b.id === id);
} 