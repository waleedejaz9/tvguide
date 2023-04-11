import "bootstrap/dist/css/bootstrap.css";
import '../styles/main.css';
import '../styles/programDetail.css';
import '../styles/atcb.min.css'
import '../styles/header.css';
import '../styles/footer.css';
import '../styles/authenticationModals.css';
import '../styles/atcb.min.css';
import '../styles/customChannel.css';
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../styles/channelTimeSlotToggle.css";
import "../styles/favouritesChannel.css";
import "../styles/specificChannelProgramListing.css";
import "../styles/favouriteShow.css";
import Layout from "../components/Layouts";
import { config } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useRef, useState } from 'react';
import Script from "next/script";
import { DefaultSeo } from 'next-seo';
import { useRouter } from "next/router";

config.autoAddCss = false;
function MyApp({ Component, pageProps }) {
	const router = useRouter();
	const [removedIframe, setRemovedIframe] = useState(false);
	const [, updateState] = useState<any>();
	const timeIntervalRef = useRef<any>();
	const premiumRef = useRef<any>();
	const premiumAdRef = useRef<any>();
	const setBodyPositionToZero = (): void => {

		const currentPosition = document.body?.style?.backgroundPosition;

		if (currentPosition && currentPosition.indexOf('center 0px') === -1) {
			document.body.style.backgroundPosition = "center 0px";
		}
		removeAdsIframe();
	}
	function removeAdsIframe() {
		setTimeout(() => {
			if (document.getElementById('ayads-pull-creative-1')) {
				document.getElementById('ayads-pull-creative-1').remove()
				setRemovedIframe(true);
			}
		}, 100);
	}
	useEffect(() => {
		import("bootstrap/dist/js/bootstrap");

		premiumAdRef.current = setInterval(() => {
			const checkJustPremium = document.getElementById("jpx-wp-front-container");
			if (checkJustPremium) {
				console.log("Premium ad attribute removed ")
				document.getElementsByClassName("w-78")[0].removeAttribute('style');
				clearInterval(premiumAdRef.current);
			}
			console.log("Premium ad attribute removed still running ")
		}, 10000);
		
		const checkJustPremium = document.getElementById("jpx-wp-front-container");

		if (checkJustPremium) {
			document.body.setAttribute('id', 'just-premium-desktop-ad'); // set this id to apply styles for just premium ads 
			setInterval(() => {
				checkJustPremium.removeAttribute('id'); // remove this ad's id from DOM b'coz it affects the toggle functionality
			}, 5000);
		}

		timeIntervalRef.current = setInterval(() => {
			const sublimeContainer = document.querySelectorAll("[id='sublime-container']")[1];

			if (sublimeContainer) {
				console.log("Removed Sublime Container");
				sublimeContainer?.remove();
				clearInterval(timeIntervalRef.current);
			}
		}, 1000);

		premiumRef.current = setInterval(() => {
			//const premiumScript = document.getElementById("script") && document.getElementById("script")?.getAttribute("src") === "https://nl.ads.justpremium.com/adserve/js.php?zone=34176"
			const premiumScript = document.getElementById("jpx-wp-front-container");
			if (premiumScript) {
				console.log("Premium class found");
				document.getElementById("tv-guide-body").setAttribute('class', 'premium-class');
				clearInterval(premiumRef.current)
			}
		}, 1000);

		const adInterval = setInterval(() => {
			setBodyPositionToZero();
			if (removedIframe) {
				clearInterval(adInterval);
			}
		}, 10);

		updateAdScripts()
	}, []);
	// This has to be uncomment starts
	const scriptHandler = (id: string, src: string) => {
		const scriptTag = document.getElementById(id)
		if (scriptTag)
			scriptTag.setAttribute("src", src);
		else {
			const script = document.createElement("script");
			Object.assign(script, { src, id, });
			document.body.append(script);
		}
	}

	const updateAdScripts = () => {
		const randomNumber = Math.trunc(Math.random() * (4 - 1) + 1); // Generate random number based on this randomly ad generated

		if (randomNumber === 2) {
			scriptHandler("script", "/static/InSkin.js")
			const adMobile = document.getElementById("script2")
			if (adMobile) {
				adMobile.removeAttribute("src");
				adMobile.removeAttribute("id");
			}
		}
		else if (randomNumber === 1) {
			scriptHandler("script", "https://sac.ayads.co/sublime/32643");
			scriptHandler("script2", "https://sac.ayads.co/sublime/37121");
			setTimeout(() => {
				// @ts-ignore comment
				const sublime = window.sublime;
				if (sublime && window.innerWidth < 767) {
					const sublimePreview = sublime.storage.get('sublime-preview')
					if (!sublimePreview) {
						sublime.storage.set('sublime-preview', 'ayads-aid=182759');
						window.location.reload();
					}
				}

			}, 5000)
		}
		else {
			scriptHandler("script", "https://nl.ads.justpremium.com/adserve/js.php?zone=34176");
			scriptHandler("script2", "https://nl.ads.justpremium.com/adserve/js.php?zone=48578");
		}
	}

	return (
		<>
			<Script src="https://gas.digitalbox.workers.dev/gas.js" defer />
			<Script src="/static/adSenseConfig.js" defer />

			<Layout>
				<DefaultSeo
					openGraph={{
						type: 'website',
						locale: 'en_IE',
						url: process.env.NEXT_SEO_URL,
						site_name: 'TvGuide',
					}}
				/>
				<Component {...pageProps} />
			</Layout>
		</>
	)
}
export default MyApp;