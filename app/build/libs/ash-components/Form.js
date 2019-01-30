import { createVNode } from "inferno";
export default function Form(props) {
    let formProps = {};
    if (props.className) {
        formProps.className = props.className;
    }
    return createVNode(2, "form", null, props.children, {
        ...formProps
    });
}