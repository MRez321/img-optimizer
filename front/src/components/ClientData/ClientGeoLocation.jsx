import React, { useState, useEffect } from 'react';

const ClientGeoLocation = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to get client geolocation
        const getGeoLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude);
                        setLongitude(position.coords.longitude);
                    },
                    (err) => {
                        setError(err.message);
                    }
                );
            } else {
                setError('Geolocation is not supported by this browser.');
            }
        };

        // Call the function to get geolocation when the component mounts
        getGeoLocation();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Geolocation: </b>
                {latitude !== null && longitude !== null ? (
                    <p>
                        Latitude: {latitude}, Longitude: {longitude}
                    </p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <p>Loading geolocation...</p>
                )}
            </p>
        </div>
    );
};

export default ClientGeoLocation;
