import $ from 'jquery';
import { Stream } from '../libs/ash-utils';
import openModalActionStream from './openModalActionStream';
import { OpenModal } from '../types/AppState';
let top = 0;
let stopBodyScrolling = isOn => {
    if (isOn) {
        let scrollTop = $('html, body').scrollTop();
        top = scrollTop ? scrollTop : 0;
        $('html').addClass('hasModal');
        $('html, body').scrollTop(top);
    } else {
        $('html').removeClass('hasModal');
        $('html, body').scrollTop(top);
    }
};
let appStateStream = new Stream({
    openModal: OpenModal.none,
    createResourceModalMethodUuid: ''
});
appStateStream.name = 'appStateStream';
appStateStream.combine(async (self, changed) => {
    let newValue = Object.assign({}, self.value);
    let isUpdateNeeded = false;
    // handle opening modals
    if (changed.includes(openModalActionStream)) {
        isUpdateNeeded = true;
        newValue.openModal = openModalActionStream.value.modal;
        if (newValue.openModal === OpenModal.createResource && openModalActionStream.value.parameter) {
            newValue.createResourceModalMethodUuid = openModalActionStream.value.parameter;
        }
    }
    // fix scrolling issues with opening and closing modals
    if (newValue.openModal === OpenModal.none) {
        stopBodyScrolling(false);
    } else {
        stopBodyScrolling(true);
    }
    // push new value if needed
    if (isUpdateNeeded) {
        self.push(newValue);
    }
}, openModalActionStream).immediate();
global.appStateStream = appStateStream;
export default appStateStream;