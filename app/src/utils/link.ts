import urlRoot from '../internals/urlRoot';


export default function link(...levels: Array<string>): string {
	return levels && levels.length ? `${urlRoot}/${levels.join('/')}` : `${urlRoot}/`;
}
