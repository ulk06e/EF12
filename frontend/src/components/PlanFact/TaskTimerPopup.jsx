import React, { useState, useEffect } from 'react';

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
    onComplete({
      ...task,
      actual_duration: actualDuration,
      time_quality: isPure ? 'pure' : 'not-pure',
      column_location: 'fact',
      completed: true,
      completed_time: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
        <h2>{task.description}</h2>
        <div style={{ fontSize: 32, margin: '24px 0', color: remainingTime < 0 ? 'red' : 'black' }}>
          {formatTime(remainingTime)}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={isRunning ? handlePause : handleContinue}
            style={{ fontWeight: !isRunning ? 'bold' : 'normal' }}
          >
            {isRunning ? 'Pause' : 'Continue'}
          </button>
          <button onClick={handleFinish}>Complete</button>
        </div>
        <button style={{ position: 'absolute', top: 16, right: 24 }} onClick={onClose}>×</button>
      </div>
    </div>
  );
} 