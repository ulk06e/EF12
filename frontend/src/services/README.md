# Services

This folder contains background services and utilities for the application.

## AutoUpdate Service

The `autoUpdate.js` service handles automatic weekly updates of the application.

### How it works:

1. **Initialization**: The service starts when the app loads and runs in the background
2. **Monitoring**: Checks every minute if it's Sunday 00:00 (weekly reset time)
3. **Weekly Update**: When triggered, it:
   - Checks and updates the local database
   - Populates the current week with daily basics
   - Reloads the app to refresh the UI

### Features:

- **Automatic**: Runs in the background without user intervention
- **Safe**: Prevents multiple updates in the same time window
- **Comprehensive**: Updates both local database and daily basics
- **Manual Trigger**: Includes `manualWeeklyUpdate()` for testing

### Usage:

```javascript
import autoUpdateService from './services/autoUpdate';

// Service is automatically initialized in App.jsx
// Manual trigger for testing:
autoUpdateService.manualWeeklyUpdate();
```

## Time Utilities

The `timeUtils.js` file contains utility functions for date/time calculations and weekly scheduling logic.

### Functions:

- `getCurrentWeekMonday()` - Get Monday of current week
- `getWeekMonday(date)` - Get Monday of specific week
- `isWeeklyUpdateTime()` - Check if it's Sunday 00:00
- `getNextWeeklyUpdateTime()` - Get next Sunday 00:00
- `getTimeUntilNextUpdate()` - Human readable time until next update

### Usage:

```javascript
import { isWeeklyUpdateTime, getTimeUntilNextUpdate } from './services/timeUtils';

if (isWeeklyUpdateTime()) {
  // Perform weekly update
}

console.log(`Next update in: ${getTimeUntilNextUpdate()}`);
```

## Daily Task Review Service

The `dailyTaskReview.js` service handles automatic daily task review popups.

### How it works:

1. **Initialization**: The service starts when the app loads and runs in the background
2. **Monitoring**: Checks every minute if it's a new day and if there are no running timers
3. **Task Review**: When triggered, it:
   - Fetches yesterday's uncompleted plan tasks (excluding daily basics)
   - Shows a popup with the tasks
   - Allows users to set tasks for today or delete them
   - Automatically closes when all tasks are handled
   - Checks for planning bonus: 30 XP if today has 18+ hours planned and wasn't planned on Sunday

### Features:

- **Timer-aware**: Waits for running timers to finish before showing popup
- **Automatic**: Runs in the background without user intervention
- **User-friendly**: Clear interface for handling yesterday's tasks
- **Self-closing**: Popup closes automatically when no tasks remain
- **Planning Bonus**: Checks for 30 XP bonus when today has 18+ hours planned and wasn't planned on Sunday
- **Manual Trigger**: Includes `manualTrigger()` for testing

### Usage:

```javascript
import dailyTaskReviewService from './services/dailyTaskReview';

// Service is automatically initialized in App.jsx
// Manual trigger for testing:
dailyTaskReviewService.manualTrigger();
```

## Note: Two Different Schedulers

This app has two different "scheduler" files with different purposes:

1. **`services/timeUtils.js`** (this folder) - Date/time utilities for weekly updates
2. **`Pages/Plan/utils/scheduler.js`** - Task scheduling algorithm for daily view positioning

The task scheduler is used by:
- `PlanFactColumns.jsx` - For positioning tasks in daily view
- `TaskFormPopup.jsx` - For checking if tasks can be scheduled

## Architecture

- **Services**: Background processes and utilities
- **Singleton Pattern**: AutoUpdate service uses singleton for global state
- **Clean Separation**: Services are separate from UI components
- **Reusable**: Time utilities can be used across the app 