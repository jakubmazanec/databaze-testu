import Inferno from 'inferno';
import Component from 'inferno-component';
import {Stream} from '../libs/ash-utils';

import '../libs/ash-components/Page.css';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import Main from './Main';
import Footer from './Footer';
import CreateMethodModal from './CreateMethodModal';
import CreateResourceModal from './CreateResourceModal';
// import CookieLawBanner from './CookieLawBanner';
import appStateStream from '../streams/appStateStream';
import {OpenModal} from '../types/AppState';
import styles from './App.css';


export default class App extends Component<{}, {}> {
	// state = {
	// 	isCookieLawBannerHidden: true
	// };

	private onAppStateStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.subscribe(() => this.forceUpdate());

		// if (!localStore.get('isCookieLawBannerHidden')) {
		// 	this.setState({isCookieLawBannerHidden: false});
		// }
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
	}

	render() {
		let appState = appStateStream.value;

		return <div className={styles.root}>
			<Header />
			<Breadcrumbs />
			<Main />
			<CreateMethodModal isOpen={appState.openModal === OpenModal.createMethod} />
			<CreateResourceModal isOpen={appState.openModal === OpenModal.createResource} methodUuid={appState.createResourceModalMethodUuid}/>
			{/*this.state.isCookieLawBannerHidden === true ? null : <CookieLawBanner handleHideBanner={this.hideCookieLawBanner} />*/}
			<Footer />
		</div>;
	}

	hideCookieLawBanner = () => {
		// localStore.set('isCookieLawBannerHidden', true);
		// this.setState({isCookieLawBannerHidden: true});

		// this.forceUpdate();
	}
}
