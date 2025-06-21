import React, { useState, useEffect } from 'react';
import '../../shared/Popup.css';

// TaskTimerPopup: A robust timer popup that always shows the correct remaining time
// regardless of tab inactivity, system sleep, or interval delays.
export default function TaskTimerPopup({ open, onClose, task, onComplete }) {
  if (!open || !task) return null; // Render nothing if popup is closed or no task

  // Parse the estimated duration in minutes from the task
  const estimatedMinutesNum = typeof task.estimated_duration === 'string'
    ? parseInt(task.estimated_duration)
    : task.estimated_duration;

  const [isPure, setIsPure] = useState(true); // True if timer was never paused
  const [isRunning, setIsRunning] = useState(true); // True if timer is running
  const [startTime] = useState(Date.now()); // Start time in ms since epoch
  const [totalPausedTime, setTotalPausedTime] = useState(0); // Total paused ms
  const [pauseStartTime, setPauseStartTime] = useState(null); // When pause started
  const [tick, setTick] = useState(0); // Dummy state to trigger re-renders

  // Set up an interval to trigger a re-render every second while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTick(t => t + 1); // Just trigger a re-render
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Calculate the remaining time (in seconds) based on wall clock time
  let now = Date.now(); // Current time in ms
  let effectivePaused = totalPausedTime; // Total paused ms
  if (!isRunning && pauseStartTime) {
    effectivePaused += now - pauseStartTime; // Add current paused duration
  }
  // Remaining time in seconds
  const remainingTime = Math.round(
    estimatedMinutesNum * 60 - (now - startTime - effectivePaused) / 1000
  );

  // Format seconds as MM:SS, with a leading '-' if negative
  const formatTime = (seconds) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? '-' : ''}${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Pause the timer
  const handlePause = () => {
    setIsRunning(false); // Stop timer
    setPauseStartTime(Date.now()); // Record when pause started
    setIsPure(false); // Mark as not pure
  };

  // Continue the timer
  const handleContinue = () => {
    setIsRunning(true); // Resume timer
    if (pauseStartTime) {
      setTotalPausedTime(prev => prev + (Date.now() - pauseStartTime)); // Add paused ms
    }
    setPauseStartTime(null); // Clear pause start
  };

  // Finish the timer and report result
  const handleFinish = () => {
    let endTime = Date.now(); // When finished
    let effectivePaused = totalPausedTime;
    if (!isRunning && pauseStartTime) {
      effectivePaused += endTime - pauseStartTime; // Add current paused duration
    }
    const actualDuration = Math.round(
      (endTime - startTime - effectivePaused) / (1000 * 60) // Duration in minutes
    );
    const completedTime = new Date().toISOString();
    onComplete({
      ...task,
      actual_duration: actualDuration,
      time_quality: isPure ? 'pure' : 'not-pure',
      column_location: 'fact',
      completed: true,
      completed_time: completedTime,
    });
    onClose();
  };

  // Render the timer popup UI
  return (
    <div className="task-time-popup">
      <div className="task-time-content">
        <h2 className="task-time-title">{task.description}</h2>
        <div className={`task-time-display ${remainingTime < 0 ? 'negative' : ''}`}>
          {formatTime(remainingTime)}
        </div>
        <div className="task-time-buttons">
          <button
            onClick={isRunning ? handlePause : handleContinue}
            className={`task-time-button ${!isRunning ? 'bold' : ''}`}
          >
            {isRunning ? 'Pause' : 'Continue'}
          </button>
          <button onClick={handleFinish} className="task-time-button primary">
            Complete
          </button>
        </div>
      </div>
    </div>
  );
} 