import React, { useState, useEffect } from 'react';

const ClientEncoding = () => {
    const [encoding, setEncoding] = useState('');

    useEffect(() => {
        // Function to get document encoding
        const getDocumentEncoding = () => {
            setEncoding(
                document.characterSet || document.charset || 'Not available'
            );
        };

        // Call the function to get document encoding when the component mounts
        getDocumentEncoding();
    }, []); // Empty dependency array ensures that the effect runs only once after the initial render

    return (
        <div className='bordered'>
            <p>
                <b>Document Encoding: </b>
                {encoding}
            </p>
        </div>
    );
};

export default ClientEncoding;
