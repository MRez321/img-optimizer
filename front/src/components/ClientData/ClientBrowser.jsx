import React, { useState, useEffect } from 'react';

const ClientBrowser = () => {
    const [browserInfo, setBrowserInfo] = useState(null);

    useEffect(() => {
        // Function to get browser information
        const getBrowserInfo = () => {
            const userAgent = navigator.userAgent;
            let browserName = '';
            let browserVersion = '';

            switch (true) {
                case /Chrome/.test(userAgent) && !/Edge/.test(userAgent):
                    browserName = 'Google Chrome';
                    browserVersion = userAgent.match(/Chrome\/(\S+)/)[1];
                    break;
                case /Firefox/.test(userAgent):
                    browserName = 'Mozilla Firefox';
                    browserVersion = userAgent.match(/Firefox\/(\S+)/)[1];
                    break;
                case /Safari/.test(userAgent) && !/Chrome/.test(userAgent):
                    browserName = 'Safari';
                    browserVersion = userAgent.match(/Version\/(\S+)/)[1];
                    break;
                case /Edg/.test(userAgent):
                    browserName = 'Microsoft Edge';
                    browserVersion = userAgent.match(/Edg\/(\S+)/)[1];
                    break;
                case /Trident/.test(userAgent):
                    browserName = 'Internet Explorer';
                    browserVersion = userAgent.match(/rv:([\d.]+)/)[1];
                    break;
                default:
                    browserName = 'Unknown Browser';
                    browserVersion = 'Unknown Version';
            }

            setBrowserInfo(`${browserName} ${browserVersion}`);
        };

        getBrowserInfo();
    }, []);

    return (
        <div className='bordered'>
            <p>
                <b>Browser Information: </b>
                {browserInfo ? (
                    <span>{browserInfo}</span>
                ) : (
                    <span>Loading browser information...</span>
                )}
            </p>
        </div>
    );
};

export default ClientBrowser;
