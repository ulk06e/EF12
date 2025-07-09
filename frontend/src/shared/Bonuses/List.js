// Bonuses/main.js
// Structure: { id, reason, xp, message }

export const BONUSES = [
  {
    id: 'first_task_of_day',
    reason: 'First task of the day',
    xp: 5,
    message: 'Laziness is absence of clarity.'
  },
  {
    id: 'more_xp_than_yesterday',
    reason: 'More XP than yesterday',
    xp: 7,
    message: 'Say “no” to everything that doesn’t contribute to a long-term goal. Short-term wins are a waste of time.'
  },
  {
    id: 'duration_low',
    reason: 'Long focus session (low)',
    xp: 15,
    message: 'Look for what you shouldn’t be doing because you’ve outgrown it.'
  },
  {
    id: 'duration_medium',
    reason: 'Long focus session (medium)',
    xp: 25,
    message: 'Play the game for the sake of the game.'
  },
  {
    id: 'tenth_task_of_day',
    reason: '10th finished task of the day',
    xp: 15,
    message: 'Break the frame. How can I achieve this 5 times faster and 5 times better?'
  },
  {
    id: 'three_pure_long_high_quality',
    reason: '3 pure, long, high-quality, high-priority tasks',
    xp: 20,
    message: 'Outstanding! Create a scenario where failure would be unbearable for you.'
  },
  {
    id: 'three_very_long_good_quality',
    reason: '3 very long, good-quality, high-priority tasks (at least one pure)',
    xp: 50,
    message: 'Legendary! Personal growth is training yourself on how you respond to hard.'
  }
];

// Utility to get a bonus by id
export function getBonusById(id) {
  return BONUSES.find(b => b.id === id);
} 