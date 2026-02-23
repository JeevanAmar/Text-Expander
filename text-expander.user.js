// ==UserScript==
// @name         Text Expander
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  Text Expander for MEDHAN (CRS a2z domain)
// @match        https://*.a2z.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const shortcuts = {
        "nare": "no any restricted item used/Present hence not restricting EAR99.",
        "hrfu": "hence restricting under PGA FAUNA.",
        "hrfl": "hence restricting under PGA FLORA.",
        "hmer": "hence marking under EAR99.",
        "hrec":"hence restricting under ECCN code"
    };

    function setReactValue(element, value) {
        const prototype = Object.getPrototypeOf(element);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

        if (descriptor && descriptor.set) {
            descriptor.set.call(element, value);
        } else {
            element.value = value;
        }

        element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function expandIfNeeded(element) {
        const cursorPos = element.selectionStart;
        const fullText = element.value;

        if (cursorPos === 0) return;

        const lastChar = fullText[cursorPos - 1];
        if (lastChar !== " " && lastChar !== "\n") return;

        const textBefore = fullText.substring(0, cursorPos - 1);
        const match = textBefore.match(/(\S+)$/);

        if (!match) return;

        const word = match[1];
        if (!shortcuts[word]) return;

        const expandedText = shortcuts[word];
        const startPos = textBefore.length - word.length;

        const newText =
            fullText.substring(0, startPos) +
            expandedText +
            fullText.substring(cursorPos);

        setReactValue(element, newText);

        const newCursor = startPos + expandedText.length + 1;
        element.setSelectionRange(newCursor, newCursor);
    }

    function attach(textarea) {
        if (textarea.dataset.expanderAttached) return;
        textarea.dataset.expanderAttached = "true";

        textarea.addEventListener("input", function () {
            expandIfNeeded(textarea);
        });
    }

    function observe() {
        const observer = new MutationObserver(() => {
            const areas = document.querySelectorAll("textarea");
            areas.forEach(attach);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.querySelectorAll("textarea").forEach(attach);
    }

    observe();

})();
