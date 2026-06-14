import React, { useState, useEffect } from 'react';

const ClientOperatingSystem = () => {
    const [device, setDevice] = useState('');
    const [operatingSystem, setOperatingSystem] = useState('');

    useEffect(() => {
        // Function to get device and operating system
        const getDeviceInfo = () => {
            const userAgent = navigator.userAgent;

            // Detecting device type
            const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
            setDevice(isMobile ? 'Mobile' : 'Desktop');

            // Detecting operating system
            let os = 'Unknown';
            switch (true) {
                case /Windows/.test(userAgent):
                    os = 'Windows';
                    break;
                case /Mac OS|Macintosh/.test(userAgent):
                    os = 'Mac OS';
                    break;
                case /Android/.test(userAgent):
                    os = 'Android';
                    break;
                case /Linux/.test(userAgent):
                    os = 'Linux';
                    break;
            }

            setOperatingSystem(os);
        };

        // Call the function to get device and operating system when the component mounts
        getDeviceInfo();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Operating System: </b>
                {device && operatingSystem ? (
                    <p>
                        Device: {device}, Operating System: {operatingSystem}
                    </p>
                ) : (
                    <p>Loading device and operating system information...</p>
                )}
            </p>
        </div>
    );
};

export default ClientOperatingSystem;
