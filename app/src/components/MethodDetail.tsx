import Inferno from 'inferno';
import Component from 'inferno-component';
import {I18n, Stream} from '../libs/ash-utils';
import _ from 'lodash';
import {Button, Spinner, Input, tableStyles} from '../libs/ash-components';

import browserRouter from '../streams/browserRouter';
import appStateStream from '../streams/appStateStream';
import languageStream from '../streams/languageStream';
import usersStream from '../streams/usersStream';
import methodsStream, {MethodsStreamStatus} from '../streams/methodsStream';
import resourcesStream, {ResourcesStreamStatus} from '../streams/resourcesStream';
import updateMethodActionStream from '../streams/updateMethodActionStream';
import deleteResourceActionStream from '../streams/deleteResourceActionStream';
import openModalActionStream from '../streams/openModalActionStream';
import link from '../utils/link';
import isUrlInternal from '../internals/isUrlInternal';
import {UserRole} from '../types/User';
import Method, {MethodStatus} from '../types/Method';
import Resource, {ResourceStatus} from '../types/Resource';
import {OpenModal} from '../types/AppState';
import styles from './MethodDetail.css';


const SPLIT_REGEXP = /\s*[,;]\s*/;

let i18n = new I18n();

interface ResourceCardProps {
	resource: Resource;
}

class ResourceCard extends Component<ResourceCardProps, {}> {
	render() {
		let {currentUser} = usersStream.value;
		let {resource} = this.props;

		return <section className={tableStyles.root}>
			<header className={tableStyles.itemHeader}>
				<h3 className={`${tableStyles.itemHeading} ${styles.tableItemHeading}`}>
					<span className={tableStyles.label}>{resource.type}</span>
					<a href={link('resource', resource.uuid, resource.name)} onClick={this.handleLinkClick}>{resource.name}</a> {/*place.review && place.review.bottles && place.review.bottles.length ? <a href="#" onClick={this.handleOpenPlaceClick.bind(this, place.id)}>{this.state.openPlaces.has(place.id) ? <Icon id="subtract" /> : <Icon id="add" />}</a> : null*/}
				</h3>
				{currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? <p className={`${tableStyles.itemInfo} ${tableStyles.isCenterAligned}`}>
					<span className={tableStyles.label}>Actions</span>
					<span className={tableStyles.value}><Button type="invisible" size="small" icon="delete" iconHref={link('assets', `icons.svg`)} isDisabled={resource.status === ResourceStatus.deleting} onClick={this.handleDeleteButtonClick} /></span>
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
		let {resource} = this.props;

		deleteResourceActionStream.push({uuid: resource.uuid});
	}
}

export interface MethodDetailProps {
	method: Method | null;
}

export default class MethodDetail extends Component<MethodDetailProps, {}> {
	state = {
		isEditingModeOn: false,
		isWaitingForResponse: false,
		isDoneMessageVisible: false,
		name: this.props.method && this.props.method.name ? this.props.method.name : '',
		shortName: this.props.method && this.props.method.shortName ? this.props.method.shortName : '',
		localName: this.props.method && this.props.method.localName ? this.props.method.localName : '',
		localShortName: this.props.method && this.props.method.localShortName ? this.props.method.localShortName : '',
		description: this.props.method && this.props.method.description ? this.props.method.description : '',
		tags: this.props.method && this.props.method.tags ? this.props.method.tags : [],
		authors: this.props.method && this.props.method.authors ? this.props.method.authors : [],
		source: this.props.method && this.props.method.source ? this.props.method.source : '',
	};

	private onAppStateStream: Stream<{}>;
	private onLanguageStream: Stream<{}>;
	private onUsersStream: Stream<{}>;
	private onMethodsStream: Stream<{}>;
	private onResourcesStream: Stream<{}>;

	componentDidMount() {
		this.onAppStateStream = appStateStream.on(() => this.forceUpdate());
		this.onLanguageStream = languageStream.on(() => this.forceUpdate());
		this.onUsersStream = usersStream.on(() => this.forceUpdate());
		this.onMethodsStream = methodsStream.subscribe(() => {
			let {method} = this.props;

			if (method) {
				let {methods} = methodsStream.value;
				let resourceIndex = _.findIndex(methods, {uuid: method.uuid});

				if (this.state.isWaitingForResponse && methods[resourceIndex].status === MethodStatus.idle) {
					this.setState({
						isWaitingForResponse: false,
						isDoneMessageVisible: true
					});
				} else {
					this.forceUpdate();
				}
			} else {
				this.forceUpdate();
			}
		});
		this.onResourcesStream = resourcesStream.on(() => this.forceUpdate());
	}

	componentDidUnmount() {
		this.onAppStateStream.end();
		this.onLanguageStream.end();
		this.onUsersStream.end();
		this.onMethodsStream.end();
		this.onResourcesStream.end();
	}

	render() {
		let {currentUser} = usersStream.value;
		let {methods, status: methodsStreamStatus} = methodsStream.value;
		let {resources, status: resourcesStreamStatus} = resourcesStream.value;
		let {method} = this.props;

		if (!method) {
			return methodsStreamStatus === MethodsStreamStatus.loading ? <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<Spinner isVisible={true} />
				</div>
			</main> : <main className={styles.root}>
				<div className={styles.fallbackContent}>
					<p>Sorry, we can’t find this method.</p>
				</div>
			</main>;
		}

		return <main className={styles.root}>
			<h2 className={styles.heading}>
				{this.state.isEditingModeOn ? <Input name="name" value={this.state.name} onChange={this.handleNameChange} /> : `${method.name}`}
				{/*<span className={styles.title}>{method.name}</span>*/}

			</h2>

			<div className={styles.row}>
				<div className={styles.wideRowItem}>
					<h4 className={styles.attributeHeading}>Description</h4>
					<p className={`${method.description ? '' : styles.isUnknown} ${this.state.isEditingModeOn ? styles.isBeingEdited : ''}`}>
						{this.state.isEditingModeOn ? <Input name="description" value={this.state.description} onChange={this.handleDescriptionChange} /> : (method.description ? `${method.description}` : '?')}
					</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.doubleRowItem}>
					<h4 className={styles.attributeHeading}>Local name</h4>
					<p className={method.localName ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="localName" value={this.state.localName} onChange={this.handleLocalNameChange} /> : (method.localName ? `${method.localName}` : '?')}
					</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Short name</h4>
					<p className={method.shortName ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="shortName" value={this.state.shortName} onChange={this.handleShortNameChange} /> : (method.shortName ? `${method.shortName}` : '?')}
					</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Short local name</h4>
					<p className={method.localShortName ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="localShortName" value={this.state.localShortName} onChange={this.handleLocalShortNameChange} /> : (method.localShortName ? `${method.localShortName}` : '?')}
					</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.doubleRowItem}>
					<h4 className={styles.attributeHeading}>Authors</h4>

					<p className={method.authors && method.authors.length ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="authors" value={this.state.authors.join('; ')} onChange={this.handleAuthorsChange} /> : (method.authors && method.authors.length ? method.authors.map((author, authorIndex) => <span className={styles.author} key={authorIndex}>{author}</span>) : '?')}
					</p>
				</div>

				<div className={styles.tripleRowItem}>
					<h4 className={styles.attributeHeading}>Source</h4>
					<p className={method.source ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="source" value={this.state.source} onChange={this.handleSourceChange} /> : (method.source ? `${method.source}` : '?')}
					</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Tags</h4>

					<p className={method.tags && method.tags.length ? '' : styles.isUnknown}>
						{this.state.isEditingModeOn ? <Input name="tags" value={this.state.tags.join('; ')} onChange={this.handleTagsChange} /> : (method.tags && method.tags.length ? method.tags.map((tag, tagIndex) => <span className={styles.tag} key={tagIndex}>{tag}</span>) : '?')}
					</p>
				</div>
			</div>

			{currentUser && currentUser.role === UserRole.admin ? <div className={styles.buttons}>
				<Button type="flat" label={this.state.isEditingModeOn ? 'Save changes' : (this.state.isWaitingForResponse ? 'Updating...' : 'Edit method')} hasSpinner={true} isLoading={method.status && method.status !== MethodStatus.idle} onClick={this.state.isEditingModeOn ? this.handleSaveChangesClick : this.handleEditMethodClick} />
				{this.state.isEditingModeOn ? <Button type="invisible" label="Discard changes" onClick={this.handleDiscardChangesClick} /> : null}
			</div> : null}

			<h3 className={styles.subeading}>Resources</h3>

			{currentUser && (currentUser.role === UserRole.user || currentUser.role === UserRole.admin) ? <div className={styles.buttons}>
				<Button label="Create resource" onClick={this.handleCreateResourceClick} />
			</div> : null}

			{resources.filter((resource) => method && resource.method && resource.method.uuid === method.uuid).map((resource: Resource, resourceIndex: number) => <ResourceCard key={resourceIndex} resource={resource} />)}
			{resourcesStreamStatus === ResourcesStreamStatus.loading ? <div className={styles.spinner}><Spinner isEnabled={true} /></div> : null}

			{/*<div className={styles.row}>
				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Type</h4>
					<p className={icon ? '' : `${styles.isUnknown} ${styles.hasOnlyText}`}>{icon ? <Icon id={icon} size="medium" /> : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Is open?</h4>
					<p className={(typeof place.isOpen === 'boolean' && place.openingHours && place.openingHours.length ? '' : `${styles.isUnknown} ${styles.hasOnlyText}`) + (place.isOpen ? ` ${styles.isTrue}` : ` ${styles.isFalse}`)}>{typeof place.isOpen === 'boolean' && place.openingHours && place.openingHours.length ? (place.isOpen ? <Icon id="check-medium" size="medium" /> : <Icon id="cancel-medium" size="medium" />) : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Card accepted?</h4>
					<p className={(place.review && typeof place.review.isCashOnly === 'boolean' ? '' : `${styles.isUnknown} ${styles.hasOnlyText}`) + (place.review && place.review.isCashOnly ? ` ${styles.isFalse}` : ` ${styles.isTrue}`)}>{place.review && typeof place.review.isCashOnly === 'boolean' ? (place.review && place.review.isCashOnly ? <Icon id="cancel-medium" size="medium" /> : <Icon id="check-medium" size="medium" />) : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Non-smoking?</h4>
					<p className={(place.review && typeof place.review.isSmokingAllowed === 'boolean' ? '' : `${styles.isUnknown} ${styles.hasOnlyText}`) + (place.review && place.review.isSmokingAllowed ? ` ${styles.isFalse}` : ` ${styles.isTrue}`)}>{place.review && typeof place.review.isSmokingAllowed === 'boolean' ? (place.review && place.review.isSmokingAllowed ? <Icon id="cancel-medium" size="medium" /> : <Icon id="check-medium" size="medium" />) : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Glass</h4>
					<p className={styles.hasOnlyText + (place.review && place.review.glass ? '' : ` ${styles.isUnknown}`)}>{place.review && place.review.glass ? place.review.glass : '?'}</p>
				</div>
			</div>

			<div className={styles.row}>
				<div className={`${styles.rowItem} ${styles.isTopAligned}`}>
					<h4 className={styles.attributeHeading}>Distance</h4>
					<p className={typeof place.distance !== 'undefined' ? '' : styles.isUnknown}>{typeof place.distance !== 'undefined' ? `${INTEGER_NUMBER_FORMAT.format(Math.round(place.distance / 10) * 10)} m` : '?'}</p>
				</div>

				{place.address ? <div className={`${styles.rowItem} ${styles.isTopAligned}`}>
					<h4 className={styles.attributeHeading}>Address</h4>
					<p>{place.address}</p>
				</div> : null}

				<div className={styles.tripleRowItem}>
					<h4 className={styles.attributeHeading}>Opening hours</h4>
					{place.review && !place.review.isOperational ? <p>Permanently or temporarily closed</p> : <p className={styles.hasOnlyText + (place.openingHours && place.openingHours.length ? '' : ` ${styles.isUnknown}`)}>
						{place.openingHours && place.openingHours.length ? place.openingHours.map((openingHours) => <p className={styles.openingHours}><span className={styles.openingHoursLabel}>{openingHours.startTime ? openingHours.startTime.format('dddd') : null}</span><span className={styles.openingHoursValue}>{openingHours.startTime && openingHours.endTime ? `${openingHours.startTime.format('HH:mm')} – ${openingHours.endTime.format('HH:mm')}` : null}</span></p>) : '?'}
					</p>}
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Ambient</h4>
					<p className={place.review && typeof place.review.ambient === 'number' ? '' : styles.isUnknown}>{place.review && typeof place.review.ambient === 'number' ? `${place.review.ambient} / 10` : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Service informedness</h4>
					<p className={place.review && typeof place.review.serviceInformedness === 'number' ? '' : styles.isUnknown}>{place.review && typeof place.review.serviceInformedness === 'number' ? `${place.review.serviceInformedness} / 10` : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Service amiability</h4>
					<p className={place.review && typeof place.review.serviceAmiability === 'number' ? '' : styles.isUnknown}>{place.review && typeof place.review.serviceAmiability === 'number' ? `${place.review.serviceAmiability} / 10` : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Restroom cleanness</h4>
					<p className={place.review && typeof place.review.restroomCleanness === 'number' ? '' : styles.isUnknown}>{place.review && typeof place.review.restroomCleanness === 'number' ? `${place.review.restroomCleanness} / 10` : '?'}</p>
				</div>

				<div className={styles.rowItem}>
					<h4 className={styles.attributeHeading}>Towels</h4>
					<p className={place.review && place.review.towels ? '' : styles.isUnknown}>{place.review && place.review.towels ? place.review.towels : '?'}</p>
				</div>
			</div>

			<h3 className={styles.whiskiesHeading}>Whiskies</h3>

			{whiskyElements && whiskyElements.length ? <ol className={`${tableStyles.subitems} ${styles.tableSubitems}`}>
				{whiskyElements}
			</ol> : null}

			<h3 className={styles.whiskiesHeading}>Rating calculation</h3>

			<ul className={styles.points}>
				<li>
					<p className={styles.pointsLabel}>Number of bottles</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeWhiskiesCountScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeWhiskiesCountScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Glass</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeGlassScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeGlassScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Opening hours</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeOpeningHoursScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeOpeningHoursScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Card accepted?</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeIsCashOnlyScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeIsCashOnlyScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Non-smoking?</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeIsSmokingAllowedScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeIsSmokingAllowedScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Ambient</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeAmbientScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeAmbientScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Service amiability</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeServiceAmiabilityScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeServiceAmiabilityScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Service informedness</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeServiceInformednessScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeServiceInformednessScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Restroom cleanness</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeRestroomCleannessScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeRestroomCleannessScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}>Towels</p>
					<p className={styles.pointsValue}>{_.isFinite(place.placeTowelsScore) ? `+${SHORT_FLOAT_NUMBER_FORMAT.format(place.placeTowelsScore as number)}` : '–'}</p>
				</li>

				<li>
					<p className={styles.pointsLabel}><strong>Total</strong></p>
					<p className={styles.pointsValue}><strong>{_.isFinite(place.placeScore) ? SHORT_FLOAT_NUMBER_FORMAT.format(place.placeScore as number) : '–'}</strong></p>
				</li>
			</ul>*/}
		</main>;
	}

	handleEditMethodClick = () => {
		this.setState({
			isEditingModeOn: true,
			isWaitingForResponse: false,
			isDoneMessageVisible: false,
			name: this.props.method && this.props.method.name ? this.props.method.name : '',
			shortName: this.props.method && this.props.method.shortName ? this.props.method.shortName : '',
			localName: this.props.method && this.props.method.localName ? this.props.method.localName : '',
			localShortName: this.props.method && this.props.method.localShortName ? this.props.method.localShortName : '',
			description: this.props.method && this.props.method.description ? this.props.method.description : '',
			tags: this.props.method && this.props.method.tags ? this.props.method.tags : [],
			authors: this.props.method && this.props.method.authors ? this.props.method.authors : [],
			source: this.props.method && this.props.method.source ? this.props.method.source : '',
		});
	}

	handleSaveChangesClick = () => {
		let {method} = this.props;

		if (method) {
			updateMethodActionStream.push({
				uuid: method.uuid,
				name: this.state.name,
				shortName: this.state.shortName ? this.state.shortName : null,
				localName: this.state.localName ? this.state.localName : null,
				localShortName: this.state.localShortName ? this.state.localShortName : null,
				description: this.state.description ? this.state.description : null,
				tags: this.state.tags.length ? this.state.tags.map((tag: string) => tag.trim()) : null,
				authors: this.state.authors.length ? this.state.authors.map((author: string) => author.trim()) : null,
				source: this.state.source ? this.state.source : null
			});

			this.setState({
				isEditingModeOn: false,
				isWaitingForResponse: true,
				isDoneMessageVisible: false,
			});
		}
	}

	handleDiscardChangesClick = () => {
		this.setState({
			isEditingModeOn: false,
			isWaitingForResponse: false,
			isDoneMessageVisible: false
		});
	}

	handleCreateResourceClick = () => {
		let {method} = this.props;

		if (method) {
			openModalActionStream.push({modal: OpenModal.createResource, parameter: method.uuid});
		}
	}

	handleNameChange = (name: string) => {
		this.setState({name});
	}

	handleShortNameChange = (shortName: string) => {
		this.setState({shortName});
	}

	handleLocalNameChange = (localName: string) => {
		this.setState({localName});
	}

	handleLocalShortNameChange = (localShortName: string) => {
		this.setState({localShortName});
	}

	handleDescriptionChange = (description: string) => {
		this.setState({description});
	}

	handleTagsChange = (tags: string) => {
		this.setState({tags: tags.split(SPLIT_REGEXP)});
	}

	handleAuthorsChange = (authors: string) => {
		this.setState({authors: authors.split(SPLIT_REGEXP)});
	}

	handleSourceChange = (source: string) => {
		this.setState({source});
	}
}
