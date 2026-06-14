import React, { useState, useEffect } from 'react';

const ClientLanguage = () => {
    const [userLanguage, setUserLanguage] = useState('');
    const [userLanguages, setUserLanguages] = useState([]);

    useEffect(() => {
        // Function to get client language and languages
        const getClientInfo = () => {
            setUserLanguage(navigator.language);

            // navigator.languages provides an array of language tags representing the user's preferred languages
            setUserLanguages(navigator.languages || []);
        };

        // Call the function to get client info when the component mounts
        getClientInfo();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <div>
                <b>Languages: </b>
                {userLanguage && userLanguages.length > 0 ? (
                    <div>
                        <p>User Language: {userLanguage}</p>
                        <p>User Languages:</p>
                        <ul>
                            {userLanguages.map((language, index) => (
                                <li key={index}>{language}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Loading client language information...</p>
                )}
            </div>
        </div>
    );
};

export default ClientLanguage;
