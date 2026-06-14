import React, { useState } from 'react';

const PingTest = () => {
    const [ping, setPing] = useState(null);

    const testPing = async () => {
        const startTime = Date.now();

        try {
            // Replace 'YOUR_SERVER_ENDPOINT' with the actual endpoint you want to test
            await fetch('YOUR_SERVER_ENDPOINT');
            const endTime = Date.now();
            const latency = endTime - startTime;
            setPing(latency);
        } catch (error) {
            console.error('Ping test failed:', error);
        }
    };

    return (
        <div className='bordered'>
            <h4>Ping Test</h4>
            <button onClick={testPing}>Test Ping</button>
            {ping !== null && <p>Ping: {ping} ms</p>}
        </div>
    );
};

export default PingTest;
