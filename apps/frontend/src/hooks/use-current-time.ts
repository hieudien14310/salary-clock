import { useEffect, useState } from 'react';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const intervalId = window.setInterval(updateTime, 1_000);
    document.addEventListener('visibilitychange', updateTime);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', updateTime);
    };
  }, []);

  return currentTime;
}
