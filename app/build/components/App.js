import Component from 'inferno-component';
import '../libs/ash-components/Page.css';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import Main from './Main';
import Footer from './Footer';
import CreateMethodModal from './CreateMethodModal';
import CreateResourceModal from './CreateResourceModal';
// import CookieLawBanner from './CookieLawBanner';
import appStateStream from '../streams/appStateStream';
import { OpenModal } from '../types/AppState';
import styles from './App.css';
import { createVNode } from 'inferno';
export default class App extends Component {
    constructor() {
        // state = {
        // 	isCookieLawBannerHidden: true
        // };
        super(...arguments);
        this.hideCookieLawBanner = () => {
            // localStore.set('isCookieLawBannerHidden', true);
            // this.setState({isCookieLawBannerHidden: true});
            // this.forceUpdate();
        };
    }
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
        return createVNode(2, 'div', styles.root, [createVNode(16, Header), createVNode(16, Breadcrumbs), createVNode(16, Main), createVNode(16, CreateMethodModal, null, null, {
            'isOpen': appState.openModal === OpenModal.createMethod
        }), createVNode(16, CreateResourceModal, null, null, {
            'isOpen': appState.openModal === OpenModal.createResource,
            'methodUuid': appState.createResourceModalMethodUuid
        }), createVNode(16, Footer)]);
    }
}