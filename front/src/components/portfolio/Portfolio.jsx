import { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import DummyData from './DummyData.js';
import lazyLoading from '../../../me.pixelstar/public/js/utils/lazyLoading';
import WorkProject from './WorkProject.jsx';
import Filter from './FilterAndSort/Filter.jsx';

import './Portfolio.css';
import ViewCount from './ViewCount.jsx';
import ClientData from '../ClientData/ClientData.jsx';
import WorkProjectPage from './WorkProjectPage.jsx';

// import Filter from '../filter-sort/Filter-Sort';
// import App from '../Filter/App';

function Portfolio() {
    useEffect(() => lazyLoading(), []);
    const [parent, enableAnimations] = useAutoAnimate({ duration: 500 });
    const [workProjects, setWorkProjects] = useState(DummyData);
    const [filteredItems, setFilteredItems] = useState('all');

    const onClickFilterHandler = (selectedFilter) => {
        setFilteredItems(selectedFilter);
    };

    const filteredWorkProjects = workProjects.filter((items) => {
        return items.tags.includes(filteredItems);
    });

    useEffect(() => lazyLoading(), [filteredItems]);

    return (
        <>
            <WorkProjectPage />

            <hr />

            {/* <ClientData /> */}

            <hr />

            <ViewCount />

            <Filter onClickFilter={onClickFilterHandler} />

            <div className='portfolio' ref={parent}>
                {filteredWorkProjects.map((data) => {
                    return <WorkProject key={data.id} data={data} />;
                })}

                {filteredWorkProjects.length === 0 && (
                    <h2>No Work Projects Yet</h2>
                )}
            </div>
        </>
    );
}

export default Portfolio;
