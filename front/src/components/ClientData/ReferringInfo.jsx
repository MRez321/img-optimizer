import React, { useState, useEffect } from 'react';

const ReferringInfo = () => {
    const [referringWebsite, setReferringWebsite] = useState('');
    const [searchEngine, setSearchEngine] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Function to extract referring website and search term
        const extractReferringInfo = () => {
            const referrer = document.referrer;

            if (referrer) {
                setReferringWebsite(referrer);

                // Check if the referral is from a search engine
                const searchEngineRegex = /(?:www\.)?([a-zA-Z]+)\.([a-zA-Z]+)/;
                const searchEngineMatch = referrer.match(searchEngineRegex);

                if (searchEngineMatch && searchEngineMatch[1]) {
                    setSearchEngine(searchEngineMatch[1]);

                    // Extract search term from the URL
                    const searchTermRegex = /(?:\?|&)q=([^&]+)/;
                    const searchTermMatch = referrer.match(searchTermRegex);

                    if (searchTermMatch && searchTermMatch[1]) {
                        setSearchTerm(decodeURIComponent(searchTermMatch[1]));
                    }
                }
            }
        };

        // Call the function to extract referring info when the component mounts
        extractReferringInfo();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Referring Information: </b>
                <span>Referring Website: {referringWebsite || 'Direct visit'}</span>
                {searchEngine && (
                    <>
                        <span>Search Engine: {searchEngine}</span>
                        <span>Search Term: {searchTerm || 'Not available'}</span>
                    </>
                )}
            </p>
        </div>
    );
};

export default ReferringInfo;
