import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchBarNav from './SearchBarNav';
import React from 'react';
const { showSixthAd, showTenthAd } = require("../public/js/channelGrid");

const getAdClass = () => {
    // setTimeout(showSixthAd, 2000);
    return "sixth-ad";
    return "tenth-ad";
}

export default function Layout({ children }) {
    return (
        <>
            <div className="sixth-ad"></div>
            <div className='tenth-ad'></div>
            <Navbar />
            <div className="w-78 m-auto" style={{marginTop: "0 !important"}}>
                <Head>
                    <title>TV Guide</title>
                </Head>
                {/* <Hero /> */}
                <SearchBarNav />
                <div  className="flex-grow">{children}</div>
                {/* <SideBanners /> */}
            </div>
            <Footer />
        </>
    );
};
// export default function Layout;
