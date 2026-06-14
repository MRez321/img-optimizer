import FormatDate from './FormatDate.tsx';
import FormatTime from './FormatTime.tsx';

function DateAndTime() {
    const date = new Date();

    return (
        <>
            <FormatDate date={date} />
            <FormatTime time={date} />
        </>
    );
}

export default DateAndTime;