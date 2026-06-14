function FormatTime({ time }: { time: Date }) {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return <span>{formatter.format(time)}</span>;
}

export default FormatTime;