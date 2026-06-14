import { useState, useEffect } from 'react';

function ViewCount() {
    const [count, setCount] = useState(0);
    const [count2, setCount2] = useState(0);

    useEffect(() => {
        const storedCount = localStorage.getItem('pageVisits');
        const initialCount = Number(storedCount) || 0;
        setCount(initialCount + 1);
        localStorage.setItem('pageVisits', initialCount + 1);
    }, []);

    const onLoadHandler = () => {
        const storedCount = localStorage.getItem('pageVisits2');
        const initialCount = Number(storedCount) || 0;
        setCount2(initialCount + 1);
        localStorage.setItem('pageVisits2', initialCount + 1);
    };

    console.log(count2);

    return (
        <>
            
            <div>React count is {count}</div>
            <div onLoad={onLoadHandler}>Page count is {count2}</div>

            <button
                onClick={() => {
                    localStorage.setItem('pageVisits', 0);
                }}
            >
                Reset &nbsp;
            </button>
        </>
    );
}

export default ViewCount;
