import urlRoot from '../internals/urlRoot';
export default function link(...levels) {
    return levels && levels.length ? `${urlRoot}/${levels.join('/')}` : `${urlRoot}/`;
}