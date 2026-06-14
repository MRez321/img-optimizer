import React, { useState, useEffect } from 'react';

const ClientCookies = () => {
    const [cookies, setCookies] = useState('');

    useEffect(() => {
        // Function to get client cookies
        const getClientCookies = () => {
            setCookies(document.cookie || 'No cookies found');
        };

        // Call the function to get client cookies when the component mounts
        getClientCookies();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Cookies: </b>
                {cookies}
            </p>
        </div>
    );
};

export default ClientCookies;
