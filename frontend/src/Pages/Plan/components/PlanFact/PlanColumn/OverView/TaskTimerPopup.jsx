import React, { useState, useEffect } from 'react';
import 'src/shared/styles/Popup.css';
import { handleDeleteTask } from 'src/Pages/Plan/api/items.js';
import { clearActiveTaskTimer } from 'src/shared/cache/localDb.js';

// TaskTimerPopup: A robust timer popup that always shows the correct remaining time
// regardless of tab inactivity, system sleep, or interval delays.
export default function TaskTimerPopup({ open, minimized, onMinimize, onRestore, onClose, task, onComplete, onDeleteTask, startTime: propStartTime, totalPausedTime: propTotalPausedTime, isRunning: propIsRunning, pauseStartTime: propPauseStartTime }) {
  // All hooks at the top
  const estimatedMinutesNum = typeof task?.estimated_duration === 'string'
    ? parseInt(task.estimated_duration)
    : task?.estimated_duration;

  const [isPure, setIsPure] = useState(true); // True if timer was never paused
  const [isRunning, setIsRunning] = useState(propIsRunning ?? true); // True if timer is running
  const [startTime, setStartTime] = useState(propStartTime ?? Date.now()); // Start time in ms since epoch
  const [totalPausedTime, setTotalPausedTime] = useState(propTotalPausedTime ?? 0); // Total paused ms
  const [pauseStartTime, setPauseStartTime] = useState(propPauseStartTime ?? null); // When pause started
  const [tick, setTick] = useState(0); // Dummy state to trigger re-renders

  // When task or timer props change, re-initialize state
  useEffect(() => {
    setIsRunning(propIsRunning ?? true);
    setStartTime(propStartTime ?? Date.now());
    setTotalPausedTime(propTotalPausedTime ?? 0);
    setPauseStartTime(propPauseStartTime ?? null);
  }, [task?.id, propStartTime, propTotalPausedTime, propIsRunning, propPauseStartTime]);

  // Add debug log for timer restore and render
  useEffect(() => {
  }, [startTime]);

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
  // Debug log for render
  useEffect(() => {
  }, [remainingTime, now, startTime, totalPausedTime]);

  // Play a beep using the Web Audio API
  function playBeep(frequency = 440, duration = 200, volume = 0.2) { // Lowered default volume
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, duration);
  }

  // Track if we've already played the 15-min, 0, and middle beeps
  const [beep15Played, setBeep15Played] = useState(false);
  const [beep0Played, setBeep0Played] = useState(false);
  const [beepMiddlePlayed, setBeepMiddlePlayed] = useState(false);

  useEffect(() => {
    if (open && minimized) {
      onRestore && onRestore();
    }
  }, [open]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTick(t => t + 1); // Just trigger a re-render
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    // 15 minutes = 900 seconds
    // Only play 15-min beep if estimatedMinutesNum >= 30
    if (estimatedMinutesNum >= 30 && remainingTime <= 900 && !beep15Played && remainingTime > 0) {
      playBeep(660, 200, 0.2); // warning beep, quieter
      setBeep15Played(true);
    }
    // Play a beep at the middle of the task if estimatedMinutesNum > 60
    if (
      estimatedMinutesNum > 60 &&
      !beepMiddlePlayed &&
      remainingTime <= (estimatedMinutesNum * 60) / 2 &&
      remainingTime > (estimatedMinutesNum * 60) / 2 - 5 // 5s window to avoid multiple triggers
    ) {
      playBeep(550, 300, 0.2); // middle beep, quieter
      setBeepMiddlePlayed(true);
    }
    if (remainingTime <= 0 && !beep0Played) {
      playBeep(440, 500, 0.25); // end beep, slightly louder but still quieter than before
      setBeep0Played(true);
    }
    // Reset beeps if timer is reset
    if (remainingTime > 900 && (beep15Played || beep0Played)) {
      setBeep15Played(false);
      setBeep0Played(false);
    }
    if (remainingTime > (estimatedMinutesNum * 60) / 2 && beepMiddlePlayed) {
      setBeepMiddlePlayed(false);
    }
  }, [remainingTime, beep15Played, beep0Played, beepMiddlePlayed, estimatedMinutesNum]);

  if ((!open && !minimized) || !task || !Number.isFinite(estimatedMinutesNum)) {
    return null;
  }

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

  // Finish the timer and report result (just complete)
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
    clearActiveTaskTimer();
    onClose();
  };

  // Finish and delete parent for not planned tasks
  const handleFinishAndDeleteParent = () => {
    let endTime = Date.now();
    let effectivePaused = totalPausedTime;
    if (!isRunning && pauseStartTime) {
      effectivePaused += endTime - pauseStartTime;
    }
    const actualDuration = Math.round(
      (endTime - startTime - effectivePaused) / (1000 * 60)
    );
    const completedTime = new Date().toISOString();
    // Complete the task
    onComplete({
      ...task,
      actual_duration: actualDuration,
      time_quality: isPure ? 'pure' : 'not-pure',
      column_location: 'fact',
      completed: true,
      completed_time: completedTime,
    });
    // Delete the parent after a short delay to ensure completion is processed
    if (task.parent_id) {
      setTimeout(() => {
        if (onDeleteTask) {
          onDeleteTask(task.parent_id, { deleteAllPlanChildren: true });
        } else {
          handleDeleteTask(task.parent_id, undefined, { deleteAllPlanChildren: true });
        }
      }, 500);
    }
    clearActiveTaskTimer();
    onClose();
  };

  // Overlay click handler
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onMinimize && onMinimize();
    }
  };

  // Minimized sticky widget click handler
  const handleStickyClick = () => {
    onRestore && onRestore();
  };

  if (minimized) {
    const isNegative = remainingTime < 0;
    return (
      <div
        className={`sticky-timer-widget${isNegative ? ' negative-bg' : ''}`}
        onClick={handleStickyClick}
      >
        <span className="sticky-timer-time">{formatTime(remainingTime)}</span>
        <div className="sticky-timer-buttons">
          <button
            onClick={e => { e.stopPropagation(); isRunning ? handlePause() : handleContinue(); }}
            className={`task-time-button ${!isRunning ? 'bold' : ''} sticky-timer-btn`}
          >
            {isRunning ? 'Pause' : 'Continue'}
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleFinish(); }}
            className="task-time-button primary sticky-timer-btn"
          >
            Complete
          </button>
        </div>
      </div>
    );
  }

  // Full popup overlay
  return (
    <div className="task-time-popup-overlay" onClick={handleOverlayClick}>
      <div className="task-time-popup" onClick={e => e.stopPropagation()}>
        <div className="task-time-content">
          <div className="task-name">{task.description}</div>
          {task.full_description && (
            <>
              <div className="task-full-description">{task.full_description}</div>
              <hr className="task-popup-divider" />
            </>
          )}
          <div className={`task-time-display ${remainingTime < 0 ? 'negative' : ''}`}>{formatTime(remainingTime)}</div>
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
            {task.type === 'not planned' && (
              <button onClick={handleFinishAndDeleteParent} className="task-time-button delete">
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 