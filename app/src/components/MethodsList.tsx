import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import {Button, Spinner, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import createMethodActionStream from '../streams/createMethodActionStream';
import deleteMethodActionStream from '../streams/deleteMethodActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import {UserRole} from '../types/User';
import Method, {MethodStatus} from '../types/Method';
import {OpenModal} from '../types/AppState';
import styles from './MethodsList.css';


let i18n = new I18n();

interface MethodCardProps {
	method: Method;
}

class MethodCard extends Component<MethodCardProps, {}> {
	render() {
		let {currentUser} = usersStream.value;
		let {method} = this.props;

		return <section className={tableStyles.root}>
			<header className={tableStyles.itemHeader}>
				<h3 className={`${tableStyles.itemHeading} ${styles.tableItemHeading}`}>
					<span className={tableStyles.label}>Name</span>
					<a href={link('method', method.uuid, method.name)} onClick={this.handleLinkClick}>{method.name}</a> {/*place.review && place.review.bottles && place.review.bottles.length ? <a href="#" onClick={this.handleOpenPlaceClick.bind(this, place.id)}>{this.state.openPlaces.has(place.id) ? <Icon id="subtract" /> : <Icon id="add" />}</a> : null*/}
				</h3>
				{currentUser && currentUser.role === UserRole.admin ? <p className={`${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`}>
					<span className={tableStyles.label}>Actions</span>
					<span className={tableStyles.value}><Button type="invisible" size="small" icon="delete" iconHref={link('assets', `icons.svg`)} isDisabled={method.status === MethodStatus.deleting} onClick={this.handleDeleteButtonClick} /></span>
				</p> : null}

				{/*icon ? <p className={`${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`}>
					<span className={tableStyles.label}>Type</span>
					<span className={tableStyles.value}><Icon id={icon} size="medium" /></span>
				</p> : null*/}
				{/*place.openingHours && place.openingHours.length ? <p className={`${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`}>
					<span className={tableStyles.label}>Is open?</span>
					<span className={tableStyles.value + (place.isOpen ? ` ${styles.isPlaceOpen}` : ` ${styles.isPlaceClosed}`)}>{place.isOpen ? <Icon id="check-medium" size="medium" /> : <Icon id="cancel-medium" size="medium" />}</span>
				</p> : null*/}
				{/*typeof place.distance !== 'undefined' ? <p className={`${tableStyles.itemInfo} ${tableStyles.isRightAligned}`}>
					<span className={tableStyles.label}>Distance</span>
					<span className={tableStyles.value}>{`${INTEGER_NUMBER_FORMAT.format(Math.round(place.distance / 10) * 10)} m`}</span>
				</p> : null*/}
				{/*<p className={tableStyles.itemInfo + (_.isFinite(whiskyRating) ? '' : ` ${styles.isHidden}`)}>
					<span className={tableStyles.label}>Whisky rating</span>
					<span className={`${tableStyles.value} ${styles.ratingBadge} ${whiskyRatingClassName}`}>{_.isFinite(whiskyRating) ? INTEGER_NUMBER_FORMAT.format(whiskyRating) : '–'}</span>
				</p>*/}
			</header>
			{/*whiskyElements && whiskyElements.length ? <ol className={`${tableStyles.subitems} ${styles.tableSubitems}`}>
				{whiskyElements}
			</ol> : null*/}
		</section>;
	}

	handleLinkClick = (event: MouseEvent) => {
		if (event.button !== 1) {
			let url = (event.target as Element).getAttribute('href');

			if (url && isUrlInternal(url)) {
				event.preventDefault();

				browserRouter.navigate(url);
			}
		}
	}

	handleDeleteButtonClick = () => {
		let {method} = this.props;

		deleteMethodActionStream.push({uuid: method.uuid});
	}
}

export default class MethodsList extends Component<{}, {}> {
	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onUsersStream = usersStream.on(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
		this.onMethodsStream.end();
	}

	render() {
		let {methods, status} = methodsStream.value;
		let {currentUser} = usersStream.value;

		return <article className={styles.root}>
			<h1 className={styles.heading}>Methods</h1>

			{currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? <div className={styles.buttons}>
				<Button label="Add new method" onClick={this.handleOpenCreateMethodModal} />
			</div> : null}

			{methods.map((method: Method, methodIndex: number) => <MethodCard key={methodIndex} method={method} />)}
			{status === MethodsStreamStatus.loading ? <div className={styles.spinner}><Spinner isVisible={true} /></div> : null}
		</article>;
	}

	handleOpenCreateMethodModal = () => {
		openModalActionStream.push({modal: OpenModal.createMethod});
	}
}
