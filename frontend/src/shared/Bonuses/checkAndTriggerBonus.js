// Bonuses/checkAndTriggerBonus.js
import { BONUSES, getBonusById } from './List.js';
import CongratsPopup from './CongratsPopup.jsx';

/**
 * Checks if any bonus requirements are satisfied, adds a bonus task if so, and triggers the popup.
 * @param {Object} params
 * @param {Array} params.items - All tasks/items
 * @param {Function} params.onAddTask - Function to add a new task (should accept a task object)
 * @param {Function} params.showPopup - Function to show the CongratsPopup (should accept a bonus object)
 * @param {Object} [params.options] - Additional options (e.g., userId, dayId)
 */
const DURATION_LOW_MINUTES = 60;
const DURATION_MEDIUM_MINUTES = 120;

export async function checkAndTriggerBonus({ items, onAddTask, showPopup, options = {}, completedTask }) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // 1. First finished task of the day
  const hasFirstTaskBonus = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'first_task_of_day');
  const completedToday = items.filter(item => item.completed_time && (item.day_id || '').slice(0, 10) === today && item.type !== 'bonus');
  if (!hasFirstTaskBonus && completedToday.length === 1) {
    const bonus = getBonusById('first_task_of_day');
    if (bonus) {
      const bonusTask = {
        id: crypto.randomUUID(),
        type: 'bonus',
        column_location: 'fact',
        completed: true,
        day_id: today,
        completed_time: new Date().toISOString(),
        xp_value: bonus.xp,
      };
      await onAddTask(bonusTask);
      showPopup(bonus);
    }
  }

  // 2. More XP today than yesterday
  const hasMoreXPBonus = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'more_xp_than_yesterday');
  const todayXP = items.filter(item => (item.day_id || '').slice(0, 10) === today && item.completed_time).reduce((sum, item) => sum + (item.xp_value || 0), 0);
  const yesterdayXP = items.filter(item => (item.day_id || '').slice(0, 10) === yesterday && item.completed_time).reduce((sum, item) => sum + (item.xp_value || 0), 0);
  if (!hasMoreXPBonus && todayXP > yesterdayXP && yesterdayXP > 0) {
    const bonus = getBonusById('more_xp_than_yesterday');
    if (bonus) {
      const bonusTask = {
        id: crypto.randomUUID(),
        type: 'bonus',
        column_location: 'fact',
        completed: true,
        day_id: today,
        completed_time: new Date().toISOString(),
        xp_value: bonus.xp,
      };
      await onAddTask(bonusTask);
      showPopup(bonus);
    }
  }

  // 3. Long focus session (duration bonuses)
  if (completedTask && completedTask.actual_duration) {
    // Medium duration
    if (completedTask.actual_duration >= DURATION_MEDIUM_MINUTES) {
      const hasMediumBonus = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'duration_medium');
      if (!hasMediumBonus) {
        const bonus = getBonusById('duration_medium');
        if (bonus) {
          const bonusTask = {
            id: crypto.randomUUID(),
            type: 'bonus',
            column_location: 'fact',
            completed: true,
            day_id: today,
            completed_time: new Date().toISOString(),
            xp_value: bonus.xp,
          };
          await onAddTask(bonusTask);
          showPopup(bonus);
        }
      }
    } else if (completedTask.actual_duration >= DURATION_LOW_MINUTES) {
      const hasLowBonus = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'duration_low');
      if (!hasLowBonus) {
        const bonus = getBonusById('duration_low');
        if (bonus) {
          const bonusTask = {
            id: crypto.randomUUID(),
            type: 'bonus',
            column_location: 'fact',
            completed: true,
            day_id: today,
            completed_time: new Date().toISOString(),
            xp_value: bonus.xp,
          };
          await onAddTask(bonusTask);
          showPopup(bonus);
        }
      }
    }
  }

  // 4. 10th finished task of the day
  const hasTenthTaskBonus = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'tenth_task_of_day');
  if (!hasTenthTaskBonus && completedToday.length === 10) {
    const bonus = getBonusById('tenth_task_of_day');
    if (bonus) {
      const bonusTask = {
        id: crypto.randomUUID(),
        type: 'bonus',
        column_location: 'fact',
        completed: true,
        day_id: today,
        completed_time: new Date().toISOString(),
        xp_value: bonus.xp,
      };
      await onAddTask(bonusTask);
      showPopup(bonus);
    }
  }

  // 5. 3 pure, 90+ min, A/B, priority 1-3 tasks today
  const hasThreePureLongHighQuality = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'three_pure_long_high_quality');
  const pureLongHighQualityTasks = completedToday.filter(item =>
    item.time_quality === 'pure' &&
    item.actual_duration >= 90 &&
    (item.task_quality === 'A' || item.task_quality === 'B') &&
    [1, 2, 3].includes(item.priority)
  );
  if (!hasThreePureLongHighQuality && pureLongHighQualityTasks.length >= 3) {
    const bonus = getBonusById('three_pure_long_high_quality');
    if (bonus) {
      const bonusTask = {
        id: crypto.randomUUID(),
        type: 'bonus',
        column_location: 'fact',
        completed: true,
        day_id: today,
        completed_time: new Date().toISOString(),
        xp_value: bonus.xp,
      };
      await onAddTask(bonusTask);
      showPopup(bonus);
    }
  }

  // 6. 3 tasks 4h+ (240 min), A-C, priority 1-4, at least one pure
  const hasThreeVeryLongGoodQuality = items.some(item => item.type === 'bonus' && item.day_id === today && item.bonus_id === 'three_very_long_good_quality');
  const veryLongGoodQualityTasks = completedToday.filter(item =>
    item.actual_duration >= 240 &&
    ['A', 'B', 'C'].includes(item.task_quality) &&
    [1, 2, 3, 4].includes(item.priority)
  );
  const atLeastOnePure = veryLongGoodQualityTasks.some(item => item.time_quality === 'pure');
  if (!hasThreeVeryLongGoodQuality && veryLongGoodQualityTasks.length >= 3 && atLeastOnePure) {
    const bonus = getBonusById('three_very_long_good_quality');
    if (bonus) {
      const bonusTask = {
        id: crypto.randomUUID(),
        type: 'bonus',
        column_location: 'fact',
        completed: true,
        day_id: today,
        completed_time: new Date().toISOString(),
        xp_value: bonus.xp,
      };
      await onAddTask(bonusTask);
      showPopup(bonus);
    }
  }
} 