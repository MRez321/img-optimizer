import './ProjectTags.css';

function ProjectTags({ tags }) {
    const tagsArr = tags.split(' ');

    const createdTags = tagsArr.map((tag, index) => {
        if (tag === 'web') {
            return (
                <span key={index} className='web-tag'>
                    Web
                </span>
            );
        }
        if (tag === 'app') {
            return (
                <span key={index} className='app-tag'>
                    App
                </span>
            );
        }
        if (tag === 'react') {
            return (
                <span key={index} className='react-tag'>
                    React
                </span>
            );
        }
        if (tag === 'node') {
            return (
                <span key={index} className='node-tag'>
                    Node
                </span>
            );
        } else {
            return null;
        }
    });

    return (
        <div className='work-project-tags'>
            <span>tags</span>
            {createdTags}
        </div>
    );
}

export default ProjectTags;
