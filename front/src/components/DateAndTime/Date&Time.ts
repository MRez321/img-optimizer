const date = new Date();
const year = date.toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' });
const month = date.toLocaleDateString('fa-IR-u-nu-latn', { month: '2-digit' });
const day = date.toLocaleDateString('fa-IR-u-nu-latn', { day: '2-digit' });
const hour = date.toLocaleTimeString('fa-IR-u-nu-latn', { hour: '2-digit' });
const minutes = date.toLocaleTimeString('fa-IR-u-nu-latn', { minute: '2-digit' });
const seconds = date.toLocaleTimeString('fa-IR-u-nu-latn', { second: '2-digit' });

console.log(year,'\n', month,'\n',day,'\n',hour,'\n',minutes,'\n',seconds);