import './WorkProjectPage.css';

function WorkProjectPage(props) {
    return (
        <>

        <main className='portfolio-main-wrapper'>

            <section className='portfolio-showcase'>
                {/* <img src='https://www.naqhvi.ir/wp-content/uploads/2022/11/contact.jpg' alt='' /> */}
                {/* <img src='https://www.naqhvi.ir/wp-content/uploads/2022/11/about-me1.jpg' alt='' /> */}
                {/* <img src='https://www.naqhvi.ir/wp-content/uploads/2022/11/banner.jpg.webp' alt='' /> */}
            </section>

            <section className='portfolio-information'>
                <div className='project-info-title'>
                    <h1>عنوان</h1>
                </div>
                <div className="project-info">
                    <div className="project-info-part">
                        <div>
                            <h3>:تاریخ</h3>
                            <p>تست تست تست</p>
                        </div>
                        <img className="lazy loaded" data-src="" alt="" src="../../../me.pixelstar/public/img/img-comp/react.svg" />
                    </div>

                    <div className="project-info-part">
                        <div>
                            <h3>:کارفرما</h3>
                            <p>تست تست تست</p>
                        </div>
                        <img className="lazy loaded" data-src="" alt="" src="../../../me.pixelstar/public/img/img-comp/react.svg" />
                    </div>

                    <div className="project-info-part">
                        <div>
                            <h3>:کارفرما</h3>
                            <p>تست تست تست</p>
                        </div>
                        <img className="lazy loaded" data-src="" alt="" src="../../../me.pixelstar/public/img/img-comp/react.svg" />
                    </div>

                    <div className="project-info-part">
                        <div>
                            <h3>:کارفرما</h3>
                            <p>تست تست تست</p>
                        </div>
                        <img className="lazy loaded" data-src="" alt="" src="../../../me.pixelstar/public/img/img-comp/react.svg" />
                    </div>
                </div>
                <div className='project-description'>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Error ea natus animi dignissimos repudiandae voluptatum veniam corrupti quae consequuntur voluptate!</p>
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi blanditiis ex voluptatibus tempore quo.</p>
                </div>
                <div className='project-tags-wrapper'>
                    tags
                </div>
            </section>

            <section className=''>

            </section>
            
        </main>

        </>
    );
}

export default WorkProjectPage;
