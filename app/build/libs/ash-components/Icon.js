import Component from 'inferno-component';
import styles from './Icon.css';
const OLD_EDGE_ID = 10547;
const OLD_WEBKIT_ID = 537;
function embed(svg, target) {
    // if the target exists
    if (target) {
        // create a document fragment to hold the contents of the target
        let fragment = document.createDocumentFragment();
        // cache the closest matching viewBox
        let viewBox = !svg.getAttribute('viewBox') && target.getAttribute('viewBox');
        // conditionally set the viewBox on the svg
        if (viewBox) {
            svg.setAttribute('viewBox', viewBox);
        }
        // clone the target
        let clone = target.cloneNode(true);
        // copy the contents of the clone into the fragment
        while (clone.childNodes.length) {
            if (clone.firstChild) {
                fragment.appendChild(clone.firstChild);
            }
        }
        // append the fragment into the svg
        svg.appendChild(fragment);
    }
}
function loadReadyStateChange(xhr) {
    // listen to changes in the request
    xhr.onreadystatechange = () => {
        // if the request is ready
        if (xhr.readyState === 4) {
            // get the cached html document
            let cachedDocument = xhr._cachedDocument;
            // ensure the cached html document based on the xhr response
            if (!cachedDocument) {
                cachedDocument = xhr._cachedDocument = document.implementation.createHTMLDocument('');
                cachedDocument.body.innerHTML = xhr.responseText;
                xhr._cachedTarget = {};
            }
            // clear the xhr embeds list and embed each item
            xhr._embeds.splice(0).map(item => {
                // get the cached target
                let target = xhr._cachedTarget[item.id];
                // ensure the cached target
                if (!target) {
                    target = xhr._cachedTarget[item.id] = cachedDocument.getElementById(item.id);
                }
                // embed the target into the svg
                embed(item.svg, target);
            });
        }
    };
    // test the ready state change immediately
    xhr.onreadystatechange(new Event(''));
}
import { createVNode } from 'inferno';
export default class Icon extends Component {
    constructor() {
        super(...arguments);
        this.refs = {};
    }
    render() {
        let styleSuffix = '';
        if (this.props && this.props.size === 'medium') {
            styleSuffix = ` ${styles.medium}`;
        } else if (this.props && this.props.size === 'large') {
            styleSuffix = ` ${styles.large}`;
        }
        return createVNode(2, 'span', styles.root + styleSuffix, createVNode(128, 'svg', null, this.props && this.props.id ? createVNode(2, 'use', null, null, {
            'xlink:href': `${this.props.href}#${this.props.id}`
        }, null, node => {
            this.refs.use = node;
        }) : null, {
            'xmlns': 'http://www.w3.org/2000/svg'
        }), null, null, node => {
            this.refs.root = node;
        });
    }
    componentDidMount() {
        let domNode = this.refs.root;
        let useNode = this.refs.use;
        if (!domNode || !useNode) {
            return;
        }
        // set whether the polyfill will be activated or not
        let polyfill;
        let newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/;
        let webkitUA = /\bAppleWebKit\/(\d+)\b/;
        let olderEdgeUA = /\bEdge\/12\.(\d+)\b/;
        polyfill = newerIEUA.test(navigator.userAgent) || parseInt((navigator.userAgent.match(olderEdgeUA) || [])[1], 10) < OLD_EDGE_ID || parseInt((navigator.userAgent.match(webkitUA) || [])[1], 10) < OLD_WEBKIT_ID;
        // create xhr requests object
        let requests = {};
        if (polyfill) {
            requestAnimationFrame(() => {
                // get the current <svg>
                if (useNode) {
                    let svg = useNode.parentNode;
                    if (svg && /svg/i.test(svg.nodeName)) {
                        let src = useNode.getAttribute('xlink:href') || useNode.getAttribute('href');
                        // remove the <use> element
                        svg.removeChild(useNode);
                        // parse the src and get the url and id
                        let srcSplit = src ? src.split('#') : null;
                        let url = srcSplit ? srcSplit.shift() : null;
                        let id = srcSplit ? srcSplit.join('#') : null;
                        // if the link is external
                        if (url && url.length) {
                            // get the cached xhr request
                            let xhr = requests[url];
                            // ensure the xhr request exists
                            if (!xhr) {
                                xhr = requests[url] = new XMLHttpRequest();
                                xhr.open('GET', url);
                                xhr.send();
                                xhr._embeds = [];
                            }
                            // add the svg and id as an item to the xhr embeds list
                            xhr._embeds.push({
                                svg,
                                id
                            });
                            // prepare the xhr ready state change event
                            loadReadyStateChange(xhr);
                        } else if (id) {
                            // embed the local id into the svg
                            embed(svg, document.getElementById(id));
                        }
                    }
                }
            });
        }
    }
}