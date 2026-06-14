import { v4 as uuid } from 'uuid';

import image1 from '../../../me.pixelstar/public/img/img-comp/html-system-websites-concept.jpg';
import image2 from '../../../me.pixelstar/public/img/img-comp/cybersecurity-digital-information.jpg';
import image3 from '../../../me.pixelstar/public/img/img-comp/programming-background.jpg';
import image4 from '../../../me.pixelstar/public/img/img-comp/dark-souls.jpg';
import logoImage1 from '../../../me.pixelstar/public/img/img-comp/naqhavi.webp';
import logoImage2 from '../../../me.pixelstar/public/img/img-comp/vite.svg';
import logoImage3 from '../../../me.pixelstar/public/img/img-comp/react.svg';
import logoImage4 from '../../../me.pixelstar/public/img/img-comp/pixel-star.png';

import '../DateAndTime/Date&Time.ts';

const DummyData = [
    {
        id: uuid(),
        image: '',
        imageAlt: '',
        logoImage: logoImage1,
        logoImageAlt: '',
        title: 'Cool Web Development',
        description: 'Some cool hovering web development with neon lights',
        viewCount: '3',
        dateCreated: new Date(2024, 3, 12),
        tags: 'all web react',
    },
    {
        id: uuid(),
        image: image2,
        imageAlt: '',
        logoImage: logoImage2,
        logoImageAlt: '',
        title: '',
        description: '',
        viewCount: '12',
        dateCreated: new Date(2020, 6, 21),
        tags: 'all react node',
    },
    {
        id: uuid(),
        image: image3,
        imageAlt: '',
        logoImage: logoImage3,
        logoImageAlt: '',
        title: 'Programming',
        description: 'Some cool hovering codes',
        viewCount: '6',
        dateCreated: new Date(2019, 5, 1),
        tags: 'all',
    },
    {
        id: uuid(),
        image: image4,
        imageAlt: '',
        logoImage: logoImage4,
        logoImageAlt: '',
        title: 'دارک سولز 3',
        description: 'اسکرین شات داوود از یکی از منطقه های داخل بازی',
        viewCount: '32',
        dateCreated: new Date(2023, 6, 6),
        tags: 'all web app react node',
    },
];

export default DummyData;
