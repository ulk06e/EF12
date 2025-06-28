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