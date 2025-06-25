// lib/hooks/useCountdown.js
import { useState, useEffect } from 'react';

export function useCountdown(targetDateString) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    let timer;
    if (targetDateString) {
      const targetDate = new Date(targetDateString);

      const calculateTimeRemaining = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining(null); // Event hat begonnen oder ist vorbei
          clearInterval(timer);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      };

      calculateTimeRemaining(); // Initialer Aufruf
      timer = setInterval(calculateTimeRemaining, 1000);
    } else {
      setTimeRemaining(null);
    }

    return () => clearInterval(timer);
  }, [targetDateString]);

  return timeRemaining;
}
