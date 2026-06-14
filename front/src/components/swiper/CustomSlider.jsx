// import React, { useRef, useEffect } from 'react';
// import Swiper from 'swiper';

// import 'swiper/css'; // Import Swiper styles

// const CustomSlider = ({ slides, options }) => {
//     const swiperRef = useRef(null);

//     useEffect(() => {
//         // Initialize Swiper when component mounts
//         swiperRef.current = new Swiper('.swiper-container', options);

//         // Clean up Swiper instance when component unmounts
//         return () => {
//             if (swiperRef.current) {
//                 swiperRef.current.destroy();
//             }
//         };
//     }, [options]);

//     return (
//         <div className='swiper-container'>
//             <div className='swiper-wrapper'>
//                 {slides.map((slide, index) => (
//                     <div key={index} className='swiper-slide'>
//                         {slide}
//                     </div>
//                 ))}
//             </div>
//             {/* Add Pagination */}
//             <div className='swiper-pagination'></div>
//             {/* Add Navigation */}
//             <div className='swiper-button-next'></div>
//             <div className='swiper-button-prev'></div>
//         </div>
//     );
// };

// export default CustomSlider;
