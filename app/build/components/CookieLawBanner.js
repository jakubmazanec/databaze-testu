import { Button } from '../libs/ash-components';
import styles from './CookieLawBanner.css';
import { createVNode } from 'inferno';
export default function CookieLawBanner(props) {
	return createVNode(2, 'div', styles.root, [createVNode(2, 'p', null, 'Cookies are very small text files that are stored on your computer when you visit some websites. We use cookies to help identify your computer so we can tailor your user experience and to analyse traffic to this site. You can disable any cookies already stored on your computer.'), createVNode(2, 'p', styles.button, createVNode(16, Button, null, null, {
		'type': 'flat',
		'label': 'I understand',
		'handleClick': props.handleHideBanner
	}))]);
}