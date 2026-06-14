import './Filter.css';

function Filter(props) {
    const onClickHandler = (e) => {
        props.onClickFilter(e.target.value);
    };

    return (
        <div className='portfolio-filters'>
            <button value='all' onClick={onClickHandler}>
                all
            </button>
            <button value='web' onClick={onClickHandler}>
                web
            </button>
            <button value='app' onClick={onClickHandler}>
                app
            </button>
            <button value='react' onClick={onClickHandler}>
                react
            </button>
            <button value='node' onClick={onClickHandler}>
                node
            </button>
        </div>
    );
}

export default Filter;
