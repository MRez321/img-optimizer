import FormatDate from '../DateAndTime/FormatDate.tsx';
import ProjectTags from './ProjectTags.jsx';

import previewSVG from '../../../me.pixelstar/public/img/img-comp/preview.svg';
import './WorkProject.css';

function WorkProject({ data }) {
    const classes = 'work-project-wrapper ' + data.tags;

    return (
        <div className={classes}>
            <div className='preview-work-project'>
                <span>
                    <img src={previewSVG} alt='work project preview svg' />
                </span>
            </div>
            <div className='work-project'>
                <figure className='work-project-figure'>
                    <img
                        className='lazy loading'
                        src={undefined}
                        data-src={data.image}
                        alt={data.imageAlt}
                    />
                </figure>

                <div className='work-project-description'>
                    <div>
                        <h3>{data.title}</h3>
                        <p>{data.description}</p>
                    </div>
                    <img
                        className='lazy loading'
                        src={undefined}
                        data-src={data.logoImage}
                        alt=''
                    />
                </div>

                <div>   
                    {data.viewCount}
                    <FormatDate date={data.dateCreated} />
                </div>

                <ProjectTags tags={data.tags}/>
            </div>
        </div>
    );
}

export default WorkProject;
