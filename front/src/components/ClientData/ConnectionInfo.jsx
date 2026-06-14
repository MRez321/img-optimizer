import React, { useState, useEffect } from 'react';

const ConnectionInfo = () => {
    const [connectionInfo, setConnectionInfo] = useState(null);

    useEffect(() => {
        // Check if the browser supports the navigator.connection API
        if (navigator.connection) {
            const connection = navigator.connection;

            // Update the state with the connection information
            setConnectionInfo({
                type: connection.type,
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                saveData: connection.saveData,
            });

            // Add an event listener to update the state if the connection information changes
            const updateConnectionInfo = () => {
                setConnectionInfo({
                    type: connection.type,
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    saveData: connection.saveData,
                });
            };

            connection.addEventListener('change', updateConnectionInfo);

            // Clean up the event listener when the component unmounts
            return () => {
                connection.removeEventListener('change', updateConnectionInfo);
            };
        }
    }, []); // Run this effect only once when the component mounts

    return (
        <div className='bordered'>
            <div>
                <b>Connection Information: </b>
                {connectionInfo ? (
                    <ul>
                        <li>
                            <span className='span'>
                                Type: {connectionInfo.type}
                            </span>
                        </li>
                        <li>
                            <span className='span'>
                                Effective Type: {connectionInfo.effectiveType}
                            </span>
                        </li>
                        <li>
                            <span className='span'>
                                Downlink: {connectionInfo.downlink} Mbps
                            </span>
                        </li>
                        <li>
                            <span className='span'>
                                Data Saver Mode:{' '}
                                {connectionInfo.saveData
                                    ? 'Enabled'
                                    : 'Disabled'}
                            </span>
                        </li>
                    </ul>
                ) : (
                    <p>Connection information not available in this browser.</p>
                )}
            </div>
        </div>
    );
};

export default ConnectionInfo;
