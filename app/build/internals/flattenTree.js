/**
 * Walks tree for flattening.
 */
function walkFlattenTree(tree, list, parent, convertToString, separator) {
    for (let property in tree) {
        if (Object.prototype.hasOwnProperty.call(tree, property)) {
            if (typeof tree[property] === 'object') {
                walkFlattenTree(tree[property], list, `${parent}${property}${separator}`, convertToString, separator);
            } else {
                list[parent + property] = convertToString ? `${tree[property]}` : tree[property];
            }
        }
    }
}
/**
 * Flattes tree object, ie. object with objects as properties, into single-level object.
 * Property names are separated byt dot.
 *
 * @example
 * flattenTree({foo: {bar: 42}}); // -> {'foo.bar': 42}
 */
export default function flattenTree(tree, { valuesToString, separator } = {}) {
    let list = {};
    walkFlattenTree(tree, list, '', !!valuesToString, separator || '.');
    return list;
}