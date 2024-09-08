// noinspection JSFileReferences

import {SlashCommandParser} from '../../../slash-commands/SlashCommandParser.js';
import {SlashCommand} from '../../../slash-commands/SlashCommand.js';
import {chat_metadata, extension_prompt_roles, extension_prompt_types} from '../../../../script.js';
import {callGenericPopup, POPUP_TYPE} from '../../../popup.js';


function getInjectionsCallback() {
    // clagged from slash-commands.js:listInjectsCallback()

    console.log('getInjectionsCallback');
    if (!chat_metadata.script_injects || !Object.keys(chat_metadata.script_injects).length) {
        toastr.info('No script injections for the current chat');
        return '';
    }

    const injects = Object.entries(chat_metadata.script_injects)
        .map(([id, inject]) => {
            const position = Object.entries(extension_prompt_types);
            const positionName = position.find(([_, value]) => value === inject.position)?.[0] ?? 'unknown';
            return `* **${id}**: <code>${inject.value}</code> (${positionName}, depth: ${inject.depth}, scan: ${inject.scan ?? false}, role: ${inject.role ?? extension_prompt_roles.SYSTEM})`;
        })
        .join('\n');

    const converter = new showdown.Converter();
    const messageText = `### Script injections:\n${injects}`;
    const htmlMessage = DOMPurify.sanitize(converter.makeHtml(messageText));
    callGenericPopup(htmlMessage, POPUP_TYPE.TEXT, 'Script injections', {
        wide: false,
        large: false,
        okButton: 'Close',
        allowVerticalScrolling: true
    });

    // was:
    // sendSystemMessage(system_message_types.GENERIC, htmlMessage);

    return '';
}

jQuery(async () => {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'getinjections',
        callback: getInjectionsCallback,
        helpString: 'Lists all script injections for the current chat, but as a popup.',
    }));
});
