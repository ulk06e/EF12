import { checkAndUpdateLocalSettingsIfEmpty } from 'src/shared/cache/localDb';
import { populateWeekWithDailyBasics } from 'src/Pages/settings/first3/daily_basics/tapi';
import { toLocalDateString } from 'src/Pages/Plan/utils/time';
import { isWeeklyUpdateTime, getCurrentWeekMonday } from './timeUtils';

class AutoUpdateService {
  constructor() {
    this.lastUpdateCheck = null;
    this.updateInterval = null;
    this.isInitialized = false;
  }

  // Initialize the auto-update service
  init() {
    if (this.isInitialized) return;
    
    console.log('[AutoUpdate] Service initialized');
    this.isInitialized = true;
    
    // Check immediately on startup
    this.checkForWeeklyUpdate();
    
    // Set up periodic checks (every minute)
    this.updateInterval = setInterval(() => {
      this.checkForWeeklyUpdate();
    }, 60000); // Check every minute
  }

  // Stop the auto-update service
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isInitialized = false;
    console.log('[AutoUpdate] Service stopped');
  }

  // Check if it's time for a weekly update (Sunday 00:00)
  checkForWeeklyUpdate() {
    const now = new Date();
    const currentTime = now.getTime();
    
    // Prevent multiple updates in the same minute
    if (this.lastUpdateCheck && (currentTime - this.lastUpdateCheck) < 60000) {
      return;
    }
    
    this.lastUpdateCheck = currentTime;
    
    // Use utility function to check if it's weekly update time
    if (isWeeklyUpdateTime()) {
      console.log('[AutoUpdate] Sunday 00:00 detected, starting weekly update');
      this.performWeeklyUpdate();
    }
  }

  // Perform the weekly update
  async performWeeklyUpdate() {
    try {
      console.log('[AutoUpdate] Starting weekly update...');
      
      // Step 1: Check and update local database
      console.log('[AutoUpdate] Checking local database...');
      await checkAndUpdateLocalSettingsIfEmpty();
      
      // Step 2: Get the current week's Monday using utility function
      const monday = getCurrentWeekMonday();
      const mondayIso = toLocalDateString(monday);
      
      console.log('[AutoUpdate] Populating week starting from:', mondayIso);
      
      // Step 3: Populate the week with daily basics
      await populateWeekWithDailyBasics(mondayIso);
      
      console.log('[AutoUpdate] Weekly update completed successfully');
      
      // Step 4: Trigger app reload to refresh the UI
      this.triggerAppReload();
      
    } catch (error) {
      console.error('[AutoUpdate] Error during weekly update:', error);
    }
  }

  // Trigger app reload to refresh the UI
  triggerAppReload() {
    console.log('[AutoUpdate] Triggering app reload...');
    
    // Use a small delay to ensure all operations are complete
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Manual trigger for testing
  async manualWeeklyUpdate() {
    console.log('[AutoUpdate] Manual weekly update triggered');
    await this.performWeeklyUpdate();
  }
}

// Create singleton instance
const autoUpdateService = new AutoUpdateService();

export default autoUpdateService; 