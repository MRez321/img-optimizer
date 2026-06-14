import React, { useState, useEffect } from 'react';

const ClientLocation = () => {
    const [locationInfo, setLocationInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to get client location
        const getClientLocation = async () => {
            try {
                const position = await getCurrentPosition();
                const { latitude, longitude } = position.coords;

                const locationData = await reverseGeocode(latitude, longitude);

                setLocationInfo(locationData);
                setLoading(false);
            } catch (error) {
                console.error('Error getting client location:', error.message);
                setLoading(false);
            }
        };

        // Call the function to get client location when the component mounts
        getClientLocation();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    };

    const reverseGeocode = async (latitude, longitude) => {
        const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your own API key

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }

            const data = await response.json();
            const addressComponents = data.results[0].address_components;

            const locationInfo = {
                continent: 'Not available',
                country: 'Not available',
                city: 'Not available',
            };

            addressComponents.forEach((component) => {
                if (component.types.includes('country')) {
                    locationInfo.country = component.long_name;
                } else if (
                    component.types.includes('administrative_area_level_1')
                ) {
                    locationInfo.region = component.long_name;
                } else if (component.types.includes('locality')) {
                    locationInfo.city = component.long_name;
                }
            });

            return locationInfo;
        } catch (error) {
            console.error('Error in reverse geocoding:', error.message);
            return {
                continent: 'Not available',
                country: 'Not available',
                city: 'Not available',
            };
        }
    };

    return (
        <div className='bordered'>
            <div>
                <b>Location: </b>
                {loading ? (
                    <p>Loading location information...</p>
                ) : (
                    <div>
                        <p>Continent: {locationInfo.continent}</p>
                        <p>Country: {locationInfo.country}</p>
                        <p>City: {locationInfo.city}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientLocation;
