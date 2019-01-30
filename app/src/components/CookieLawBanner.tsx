import Inferno from 'inferno';
import {Button} from '../libs/ash-components';

import styles from './CookieLawBanner.css';


export interface CookieLawBannerProps {
	handleHideBanner(): void;
}

export default function CookieLawBanner(props: CookieLawBannerProps) {
	return <div className={styles.root}>
		<p>
			Cookies are very small text files that are stored on your computer when you visit some websites.
			We use cookies to help identify your computer so we can tailor your user experience and to analyse traffic to this site.
			You can disable any cookies already stored on your computer.
		</p>
		<p className={styles.button}>
			<Button type="flat" label="I understand" handleClick={props.handleHideBanner} />
		</p>
	</div>;
}
