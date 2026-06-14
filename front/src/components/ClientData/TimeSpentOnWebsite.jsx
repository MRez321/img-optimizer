import React, { useState, useEffect, useRef } from 'react';

const TimeSpentOnWebsite = () => {
  const startTimeRef = useRef(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [formattedCurrentTime, setFormattedCurrentTime] = useState('');
  const [formattedTotalTime, setFormattedTotalTime] = useState('');

  const updateTimes = () => {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTimeRef.current;

    setTotalTimeSpent((prevTotalTime) => {
      const updatedTotalTime = prevTotalTime + elapsedTime;
      setFormattedTotalTime(formatTime(updatedTotalTime));
      setFormattedCurrentTime(formatTime(elapsedTime));
      return updatedTotalTime;
    });
  };

  useEffect(() => {
    const storedStartTime = localStorage.getItem('startTime');
    startTimeRef.current = storedStartTime
      ? parseInt(storedStartTime, 10)
      : new Date().getTime();

    const intervalId = setInterval(() => {
      updateTimes();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array ensures that the effect runs only once after the initial render

  const formatTime = (time) => {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formatted = `${+hours}h ${+minutes % 60}m ${+seconds % 60}s`;
    return formatted;
  };

  const handleReset = () => {
    localStorage.removeItem('startTime');
    startTimeRef.current = new Date().getTime();
    setTotalTimeSpent(0);
    setFormattedCurrentTime('0s');
    setFormattedTotalTime('0s');
  };

  return (
    <div className='bordered'>
      <h4>Time Tracker</h4>
      <p>Time spent during this visit: {formattedCurrentTime}</p>
      <p>Total time spent on the website: {formattedTotalTime}</p>
      <button onClick={handleReset}>Reset Timer</button>
    </div>
  );
};

export default TimeSpentOnWebsite;
