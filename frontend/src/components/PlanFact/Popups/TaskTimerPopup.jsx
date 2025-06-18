import React, { useState, useEffect } from 'react';
import '../../shared/Popup.css';

export default function TaskTimerPopup({ open, onClose, task, onComplete }) {
  if (!open || !task) return null;
  const estimatedMinutesNum = typeof task.estimated_duration === 'string'
    ? parseInt(task.estimated_duration)
    : task.estimated_duration;

  const [remainingTime, setRemainingTime] = useState(estimatedMinutesNum * 60);
  const [isPure, setIsPure] = useState(true);
  const [isRunning, setIsRunning] = useState(true);
  const [startTime] = useState(new Date());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [lastTickTime, setLastTickTime] = useState(Date.now());

  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastTickTime(Date.now());
      } else {
        const now = Date.now();
        const missedTime = Math.floor((now - lastTickTime) / 1000);
        setRemainingTime(prev => prev - missedTime);
        setLastTickTime(now);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTickTime) / 1000);
      setLastTickTime(now);
      setRemainingTime(prev => prev - elapsed);
    }, 1000);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, lastTickTime]);

  const formatTime = (seconds) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? '-' : ''}${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsRunning(false);
    setPauseStartTime(Date.now());
    setIsPure(false);
  };

  const handleContinue = () => {
    setIsRunning(true);
    setLastTickTime(Date.now());
    if (pauseStartTime) {
      setTotalPausedTime(prev => prev + (Date.now() - pauseStartTime));
    }
    setPauseStartTime(null);
  };

  const handleFinish = () => {
    const endTime = new Date();
    const actualDuration = Math.ceil(
      ((endTime.getTime() - startTime.getTime()) - totalPausedTime) / (1000 * 60)
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