import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';

import browserRouter from '../streams/browserRouter';
import languageStream from '../streams/languageStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Footer.css';


let i18n = new I18n();

export default class Footer extends Component<{}, {}> {
	onLanguageStream: Stream<{}>;

	componentDidMount() {
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onLanguageStream.end();
	}

	render() {
		return <footer className={styles.root} onClick={this.handleClick}>
			<ol>
				<li><a className={styles.hasNoUnderline} href={link('updates')}>v0.1.0</a></li>
				<li>Do you have any advice? <a href="mailto:">Let us know!</a></li>
			</ol>
			{/*<p className={styles.logo}>
				<a href="http://www.datanautika.com"><img src={link('assets', 'datanautika.svg')} alt="Made by Datanautika" /></a>
			</p>*/}
		</footer>;
	}

	handleClick = (event: MouseEvent) => {
		if (event.button !== 1) {
			let url = (event.target as Element).getAttribute('href');

			if (url && isUrlInternal(url)) {
				event.preventDefault();

				browserRouter.navigate(url);
			}
		}
	}
}
