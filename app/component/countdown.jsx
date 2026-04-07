"use client";

import { useEffect, useState } from "react";

export default function Countdown({ targetDate }) {
  const targetTime = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = targetTime - Date.now();
      setTimeLeft(difference > 0 ? difference : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  //  Convert milliseconds → days/hours/minutes/seconds
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div>
      {timeLeft > 0 ? (
        <h2>
          {" "}
          Start In -{days}d {hours}h {minutes}m {seconds}s
        </h2>
      ) : (
        <h2>Time Up</h2>
      )}
    </div>
  );
}
