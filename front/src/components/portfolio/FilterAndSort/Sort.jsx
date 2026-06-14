function Sort(props) {
    const onClickHandler = (e) => {
        props.onClickFilter(e.target.value);
    };

    return (
        <div className='portfolio-sorters'>
            <button value='original' onClick={onClickHandler}>
                original
            </button>
            <button value='view' onClick={onClickHandler}>
                view
            </button>
            <button value='date' onClick={onClickHandler}>
                date
            </button>
            <button value='oldest' onClick={onClickHandler}>
                oldest
            </button>
            <button value='newst' onClick={onClickHandler}>
                newst
            </button>
        </div>
    );
}

export default Sort;
