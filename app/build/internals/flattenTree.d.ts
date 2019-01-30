/**
 * Flattes tree object, ie. object with objects as properties, into single-level object.
 * Property names are separated byt dot.
 *
 * @example
 * flattenTree({foo: {bar: 42}}); // -> {'foo.bar': 42}
 */
export default function flattenTree(tree: {
    [key: string]: any;
}, {valuesToString, separator}?: {
    valuesToString?: boolean;
    separator?: string;
}): {
    [key: string]: any;
};
