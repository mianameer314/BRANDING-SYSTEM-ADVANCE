import { useEffect, useState } from 'react';

export function CountUp({ end, duration = 600 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      
      if (elapsed < duration) {
        // Spins up completely wildly (extremely fast) to look like high-speed calculation
        setCount(Math.floor(elapsed * 3.7) % 100);
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end); // Snaps to the actual count when calculation time finishes
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return <span>{count}</span>;
}
