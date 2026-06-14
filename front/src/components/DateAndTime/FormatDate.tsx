// function FormatDate({ date }: { date: Date }) {
//     const month = date.toLocaleDateString('fa-IR-u-nu-latn', { month: '2-digit' });
//     const day = date.toLocaleDateString('fa-IR-u-nu-latn', { day: '2-digit' });
//     const year = date.toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' });
//
//     return <span>{`${year}/${month}/${day}`}</span>;
// }



function FormatDate({ date }: { date: Date }) {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const formatted = formatter.format(date); // e.g., "۱۴۰۵/۰۳/۲۳"

    return <span>{formatted}</span>;
}

export default FormatDate;
