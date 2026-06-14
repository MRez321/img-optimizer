import React, { useState, useEffect } from 'react';

const ClientScreenResolution = () => {
    const [screenWidth, setScreenWidth] = useState(null);
    const [screenHeight, setScreenHeight] = useState(null);

    useEffect(() => {
        // Function to get screen resolution
        const getScreenResolution = () => {
            setScreenWidth(window.screen.width);
            setScreenHeight(window.screen.height);
        };

        // Call the function to get screen resolution when the component mounts
        getScreenResolution();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <div>
                <b>Screen Resolution: </b>
                {screenWidth !== null && screenHeight !== null ? (
                    <p>
                        Screen Resolution: {screenWidth} x {screenHeight}
                    </p>
                ) : (
                    <p>Loading screen resolution...</p>
                )}
            </div>
        </div>
    );
};

export default ClientScreenResolution;
