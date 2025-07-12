import { loadActiveTaskTimer } from 'src/shared/cache/localDb';
import { getTodayDateString, toLocalDateString } from 'src/shared/utils/time.js';
import { API_URL } from 'src/shared/getApiUrl';
import { getBonusById } from 'src/shared/Bonuses/List.js';

class DailyTaskReviewService {
  constructor() {
    this.lastCheckDate = null;
    this.checkInterval = null;
    this.isInitialized = false;
    this.popupOpen = false;
    this.yesterdayTasks = [];
    this.onShowPopup = null;
    this.onHidePopup = null;
    this.onAddTask = null;
    this.onDeleteTask = null;
    this.onShowBonusPopup = null;
  }

  // Initialize the service
  init({ onShowPopup, onHidePopup, onAddTask, onDeleteTask, onShowBonusPopup }) {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.onShowPopup = onShowPopup;
    this.onHidePopup = onHidePopup;
    this.onAddTask = onAddTask;
    this.onDeleteTask = onDeleteTask;
    this.onShowBonusPopup = onShowBonusPopup;
    
    // Check immediately on startup
    this.checkForNewDay();
    
    // Set up periodic checks (every minute)
    this.checkInterval = setInterval(() => {
      this.checkForNewDay();
    }, 60000); // Check every minute
  }

  // Stop the service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isInitialized = false;
  }

  // Check if it's a new day and if we should show the popup
  async checkForNewDay() {
    const today = getTodayDateString();
    
    // Prevent multiple checks on the same day
    if (this.lastCheckDate === today) {
      return;
    }
    
    this.lastCheckDate = today;
    
    // Check if there's a running timer
    const activeTimer = loadActiveTaskTimer();
    if (activeTimer && activeTimer.isRunning) {
      console.log('[DailyTaskReview] Timer is running, waiting for it to finish...');
      return;
    }
    
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalDateString(yesterday);
    
    // Fetch yesterday's plan tasks that weren't completed
    await this.fetchYesterdayTasks(yesterdayStr);
    
    // Check for today's planning bonus
    await this.checkTodayPlanningBonus();
  }

  // Fetch yesterday's uncompleted plan tasks
  async fetchYesterdayTasks(yesterdayStr) {
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const allItems = await response.json();
      
      // Filter for yesterday's plan tasks that weren't completed (excluding daily basics)
      const yesterdayPlanTasks = allItems.filter(item => 
        item.day_id === yesterdayStr &&
        item.column_location === 'plan' &&
        !item.completed_time &&
        item.type !== 'daily_basic'
      );
      
      if (yesterdayPlanTasks.length > 0) {
        this.yesterdayTasks = yesterdayPlanTasks;
        this.showPopup();
      }
    } catch (error) {
      console.error('[DailyTaskReview] Error fetching yesterday tasks:', error);
    }
  }

  // Show the popup
  showPopup() {
    if (this.popupOpen || !this.onShowPopup) return;
    
    this.popupOpen = true;
    this.onShowPopup(this.yesterdayTasks);
  }

  // Hide the popup
  hidePopup() {
    if (!this.popupOpen || !this.onHidePopup) return;
    
    this.popupOpen = false;
    this.yesterdayTasks = [];
    this.onHidePopup();
  }

  // Set a task for today
  async setTaskForToday(task) {
    if (!this.onAddTask) return;
    
    try {
      const today = getTodayDateString();
      const taskForToday = {
        ...task,
        id: undefined, // Let backend assign new id
        day_id: today,
        completed: false,
        completed_time: null,
        actual_duration: null,
        created_time: new Date().toISOString(),
      };
      
      await this.onAddTask(taskForToday);
      this.removeTaskFromList(task.id);
    } catch (error) {
      console.error('[DailyTaskReview] Error setting task for today:', error);
    }
  }

  // Delete a task
  async deleteTask(task) {
    if (!this.onDeleteTask) return;
    
    try {
      await this.onDeleteTask(task.id);
      this.removeTaskFromList(task.id);
    } catch (error) {
      console.error('[DailyTaskReview] Error deleting task:', error);
    }
  }

  // Remove task from the list
  removeTaskFromList(taskId) {
    this.yesterdayTasks = this.yesterdayTasks.filter(task => task.id !== taskId);
    
    // If no tasks left, close the popup
    if (this.yesterdayTasks.length === 0) {
      this.hidePopup();
    }
  }

  // Check for today's planning bonus
  async checkTodayPlanningBonus() {
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const allItems = await response.json();
      const today = getTodayDateString();
      
      // Check if today has 18+ hours (1080 minutes) planned
      const todayPlanTasks = allItems.filter(item => 
        item.day_id === today &&
        item.column_location === 'plan' &&
        item.type !== 'daily_basic'
      );
      
      const todayPlannedMinutes = todayPlanTasks.reduce((sum, item) => sum + (item.estimated_duration || 0), 0);
      const has18HoursPlanned = todayPlannedMinutes >= 1080; // 18 hours = 1080 minutes
      
      if (!has18HoursPlanned) {
        return; // Not enough planning
      }
      
      // Check if this bonus was already given today
      const hasBonusToday = allItems.some(item => 
        item.type === 'bonus' && 
        item.day_id === today && 
        item.description === 'today_well_planned_not_sunday'
      );
      
      if (hasBonusToday) {
        return; // Bonus already given
      }
      
      // Check if today was planned on Sunday
      const todayDate = new Date(today);
      const isTodaySunday = todayDate.getDay() === 0;
      
      if (isTodaySunday) {
        return; // Can't get bonus if today is Sunday
      }
      
      // Check if any of today's plan tasks were created on Sunday
      const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get the date of the most recent Sunday
      const sunday = new Date(todayDate);
      sunday.setDate(todayDate.getDate() - dayOfWeek);
      const sundayStr = toLocalDateString(sunday);
      
      const plannedOnSunday = todayPlanTasks.some(task => {
        if (!task.created_time) return false;
        const createdDate = new Date(task.created_time);
        const createdDateStr = toLocalDateString(createdDate);
        return createdDateStr === sundayStr;
      });
      
      if (plannedOnSunday) {
        return; // Some tasks were planned on Sunday
      }
      
      // All conditions met! Give the bonus
      const bonus = getBonusById('today_well_planned_not_sunday');
      if (bonus && this.onShowBonusPopup) {
        this.onShowBonusPopup(bonus);
      }
      
    } catch (error) {
      console.error('[DailyTaskReview] Error checking today planning bonus:', error);
    }
  }

  // Manual trigger for testing
  async manualTrigger() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalDateString(yesterday);
    await this.fetchYesterdayTasks(yesterdayStr);
    await this.checkTodayPlanningBonus();
  }
}

// Create singleton instance
const dailyTaskReviewService = new DailyTaskReviewService();

export default dailyTaskReviewService; 