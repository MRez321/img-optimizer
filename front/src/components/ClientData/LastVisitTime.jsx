import React, { useState, useEffect } from 'react';

const LastVisitTime = () => {
    const [lastVisitTime, setLastVisitTime] = useState('');

    useEffect(() => {
        // Function to get and set last visit time
        const updateLastVisitTime = () => {
            const currentTime = new Date();
            const storedLastVisitTime = localStorage.getItem('lastVisitTime');

            if (storedLastVisitTime) {
                setLastVisitTime(
                    new Date(storedLastVisitTime).toLocaleString()
                );
            }

            localStorage.setItem('lastVisitTime', currentTime.toString());
        };

        // Call the function to update last visit time when the component mounts
        updateLastVisitTime();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Last Visit Time: </b>
                {lastVisitTime ? (
                    <p>Your last visit was on: {lastVisitTime}</p>
                ) : (
                    <p>First time visiting the website!</p>
                )}
            </p>
        </div>
    );
};

export default LastVisitTime;
