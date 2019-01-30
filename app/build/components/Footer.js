import Component from 'inferno-component';
import { I18n } from '../libs/ash-utils';
import browserRouter from '../streams/browserRouter';
import languageStream from '../streams/languageStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import styles from './Footer.css';
let i18n = new I18n();
import { createVNode } from 'inferno';
export default class Footer extends Component {
    constructor() {
        super(...arguments);
        this.handleClick = event => {
            if (event.button !== 1) {
                let url = event.target.getAttribute('href');
                if (url && isUrlInternal(url)) {
                    event.preventDefault();
                    browserRouter.navigate(url);
                }
            }
        };
    }
    componentDidMount() {
        this.onLanguageStream = languageStream.on(() => this.forceUpdate());
    }
    componentDidUnmount() {
        this.onLanguageStream.end();
    }
    render() {
        return createVNode(2, 'footer', styles.root, createVNode(2, 'ol', null, [createVNode(2, 'li', null, createVNode(2, 'a', styles.hasNoUnderline, 'v0.1.0', {
            'href': link('updates')
        })), createVNode(2, 'li', null, ['Do you have any advice? ', createVNode(2, 'a', null, 'Let us know!', {
            'href': 'mailto:'
        })])]), {
            'onClick': this.handleClick
        });
    }
}