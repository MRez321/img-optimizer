import React, { useState, useEffect } from 'react';

const ClientScreenColorDepth = () => {
    const [colorDepth, setColorDepth] = useState(null);

    useEffect(() => {
        // Function to get screen color depth
        const getScreenColorDepth = () => {
            setColorDepth(window.screen.colorDepth || window.screen.pixelDepth);
        };

        // Call the function to get screen color depth when the component mounts
        getScreenColorDepth();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <div>
                <b>Screen Color Depth: </b>
                {colorDepth !== null ? (
                    <p>Screen Color Depth: {colorDepth} bits per pixel</p>
                ) : (
                    <p>Loading screen color depth information...</p>
                )}
            </div>
        </div>
    );
};

export default ClientScreenColorDepth;
