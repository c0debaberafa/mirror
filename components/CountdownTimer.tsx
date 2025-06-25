'use client';

import React, { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // July 2, 2025, 12:00 NN GMT+08
    const targetDate = new Date('2025-07-02T04:00:00Z').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>Limited release ends in:</span>
      <div className="flex gap-1">
        <span className="font-mono font-medium">{timeLeft.days}d</span>
        <span>:</span>
        <span className="font-mono font-medium">{timeLeft.hours.toString().padStart(2, '0')}h</span>
        <span>:</span>
        <span className="font-mono font-medium">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
        <span>:</span>
        <span className="font-mono font-medium">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
} 