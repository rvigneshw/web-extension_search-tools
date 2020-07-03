function getAllLinksInSearchResult() {
    console.log(document.querySelectorAll('ol[id="b_results"] li h2 a'))
    return document.querySelectorAll('ol[id="b_results"] li h2 a')
}
function getUrl(iconName) {
    return browser.extension.getURL(`images/${iconName}`);
}
function changeImageToTick(imgElement) {
    imgElement.src = getUrl("tick.svg")
    imgElement.classList.add("wand-tools-tick-icon");
}
function changeImageToLoading(imgElement) {
    imgElement.src = getUrl("loading.svg")
    imgElement.classList.remove("wand-tools-icons");
    imgElement.classList.add("wand-tools-loading-icon");
    console.log(imgElement);
}
function openTheLinkSecurelyHandler(event) {
    event.stopPropagation();
    window.location.href = event.srcElement.dataset.url
}
function openTheStackOverflowLinkHandler(event) {
    event.stopPropagation();
    window.location.href = event.srcElement.dataset.url
}
function copyTextToClipboardHandler(event) {
    event.stopPropagation();
    var iconImageTag = event.srcElement;
    copyToClipBoard(iconImageTag.dataset.url);
    changeImageToTick(iconImageTag);
}
function copyToClipBoard(linkToBeCopied) {
    navigator.clipboard.writeText(linkToBeCopied).then((data) => { }, (err) => { });
}

function openInNewTabHandler(event) {
    event.stopPropagation();
    browser.runtime.sendMessage({
        "type": "OINT",
        "url": event.srcElement.dataset.url
    });
    changeImageToTick(event.srcElement);
}
function getWhoIsInfoHandler(event) {
    event.stopPropagation();
    try {
        var table_div = event.srcElement.parentElement.parentElement;
        console.log(table_div);
        var url = new URL(event.srcElement.dataset.url);
        table_div.insertAdjacentHTML('beforeend', `<div class="wand-tools-who-is-table">
        ${getRandomLoadingMessage()}
        </div>`);
        changeImageToLoading(event.srcElement);
        fetch(`https://iplist.cc/api/${url.hostname}`)
            .then(response => response.json())
            .then((data) => {
                if (data.error) {
                    table_div.removeChild(table_div.lastChild);
                    showTryingWithAnotherSourceMessage();
                    fallbackToAnotherSource();
                } else {
                    table_div.removeChild(table_div.lastChild);
                    table_div.insertAdjacentHTML('beforeend', prepareTableContentsForIplistcc(data));
                    event.srcElement.classList
                        .remove("wand-tools-loading-icon");
                    changeImageToTick(event.srcElement);
                }
            });

    } catch (err) {
        console.log(err)
    }
    function fallbackToAnotherSource() {
        fetch(`https://freegeoip.app/json/${url.hostname}`)
            .then(response => response.json())
            .then((data) => {
                table_div.removeChild(table_div.lastChild);
                table_div.insertAdjacentHTML('beforeend', prepareTableContentsForFreeGeoIP(data));
                event.srcElement.classList
                    .remove("wand-tools-loading-icon");
                changeImageToTick(event.srcElement);
            }).catch((err) => {
                table_div.insertAdjacentHTML('beforeend', irrecoverableErrorMessage());
            })

        function irrecoverableErrorMessage() {
            return `<div class="wand-tools-who-is-table">
        We're Sorry for what really happened. We can't able to find the WHOIS info for the website you requested! If you badly want the info we suggest you this website. <a href="https://whois.net/"> https://whois.net/ </a> 
        No hard feelings okay?
        </div>`;
        }
    }

    function showTryingWithAnotherSourceMessage() {
        table_div.insertAdjacentHTML('beforeend', `<div class="wand-tools-who-is-table">
    Some error occured! But don't worry we're trying with another source.This will be automatically done for you! Just wait one more minute. That's it!
    </div>`);
    }

    function prepareTableContentsForIplistcc(data) {
        return `<table class="wand-tools-who-is-table"> <tr> <th>IP Address</th> <th>Is Spam website</th> <th>Country Name</th> <th>Registry</th></tr> <tr>  <td> ${data.ip} </td>  <td> ${data.spam} </td>  <td> ${data.countryname} </td>  <td> ${data.registry} </td></tr> <tr> <td colspan="4"> This data is gathered from public API  <a href="https://iplist.cc"> iplist.cc </a> </td> </tr> </table>`;
    }
    function prepareTableContentsForFreeGeoIP(data) {
        return `<table class="wand-tools-who-is-table"> <tr> <th>IP Address</th> <th>Country Name</th> <th>Time Zone</th></tr> <tr>  <td> ${data.ip} </td>  <td> ${data.country_name} </td>  <td> ${data.time_zone} </td></tr> <tr> <td colspan="3"> This data is gathered from public API  <a href="https://freegeoip.app"> freegeoip.app </a> </td> </tr> </table>`;
    }
}
function addToCollectionsHandler(event) {
    event.stopPropagation();
    try {
        var url = event.srcElement.ownerDocument.URL;
        var googleSearchRegex = /q=(.*?)(?:&|$)/g;
        var searchString = url.match(googleSearchRegex)[0];
        searchString = searchString.replace('q=', '');
        searchString = searchString.replace('&', '');
        searchString = searchString.replace(/\+/g, ' ');
        changeImageToTick(event.srcElement);
        browser.runtime.sendMessage({
            "type": "ATC",
            "search_term": searchString,
            "url": event.srcElement.dataset.url
        });
    } catch (error) {
        console.log(error);
    }
}
function attachEventListenerTo(className, eventHandler) {
    var allIcons = document.getElementsByClassName(className);
    for (let i = 0; i < allIcons.length; i++) {
        allIcons[i].addEventListener('click', eventHandler);
    }
}

const WTP = `wand-tools-`
const WAND_TOOLS_ICONS = `${WTP}icons`;
const COPY_LINK_TO_CLIPBOARD_CLASS_NAME = `${WTP}CopyLinkToClipboardTagImg
${WAND_TOOLS_ICONS} `;
const OPEN_SECURELY_CLASS_NAME = `${WTP}openSecurelyTagImg  
${WAND_TOOLS_ICONS}`;
const OPEN_IN_NEW_TAB_CLASS_NAME = `${WTP}openInNewTabTagImg   
${WAND_TOOLS_ICONS}`;
const ADD_TO_COLLECTIONS_CLASS_NAME = `${WTP}addToCollectionsTagImg    
${WAND_TOOLS_ICONS}`;
const WHO_IS_INFO_CLASS_NAME = `${WTP}getWhoIsInfoTag    
${WAND_TOOLS_ICONS}`;
const GOTO_STACKOVERFLOW_ANSWER_CLASS_NAME = `${WTP}goToTheStackoverflowAnswerTag    
${WAND_TOOLS_ICONS}`;
var SETTINGS = '';
const EVENT_LISTENER_ARRAY = [
    {
        "class": COPY_LINK_TO_CLIPBOARD_CLASS_NAME,
        "handler": copyTextToClipboardHandler
    },
    {
        "class": OPEN_IN_NEW_TAB_CLASS_NAME,
        "handler": openInNewTabHandler
    },
    {
        "class": ADD_TO_COLLECTIONS_CLASS_NAME,
        "handler": addToCollectionsHandler
    },
    {
        "class": WHO_IS_INFO_CLASS_NAME,
        "handler": getWhoIsInfoHandler
    },
    {
        "class": OPEN_SECURELY_CLASS_NAME,
        "handler": openTheLinkSecurelyHandler
    },
    {
        "class": GOTO_STACKOVERFLOW_ANSWER_CLASS_NAME,
        "handler": openTheStackOverflowLinkHandler
    }
]
const customIconsArray = {
    "stackoverflow.com": {
        "icon": "stackoverflow.svg",
        "title": "Click to Go straight to the answer's section!",
        "class": GOTO_STACKOVERFLOW_ANSWER_CLASS_NAME,
        "isHref": true
    }
}
function prepareIconsArray(settings) {
    var iconsArray = [];
    if (settings.ont_toggle) {
        iconsArray.push({
            "icon": "open_in_new_tab.svg",
            "title": "Click to open this link in New tab.",
            "class": OPEN_IN_NEW_TAB_CLASS_NAME
        });
    }
    if (settings.ctc_toggle) {
        iconsArray.push({
            "icon": "copy_link.svg",
            "title": "Click to copy the link.",
            "class": COPY_LINK_TO_CLIPBOARD_CLASS_NAME
        });
    }
    if (settings.so_toggle) {
        iconsArray.push({
            "icon": "secure_open.svg",
            "title": "Click to open in the same tab <br>(But without google tracking you!) ",
            "class": OPEN_SECURELY_CLASS_NAME
        });
    }
    if (settings.atc_toggle) {
        iconsArray.push({
            "icon": "collections.svg",
            "title": "Click to add this link to your collections <br> (For Reference purposes)",
            "class": ADD_TO_COLLECTIONS_CLASS_NAME
        });
    }
    if (settings.whois_toggle) {
        iconsArray.push({
            "icon": "who_is.svg",
            "title": "Click to get WhoIs information like country name , IP Address etc...",
            "class": WHO_IS_INFO_CLASS_NAME
        });
    }
    return iconsArray;
}

function constructImageTag(iconUrl, className, titleString, originalUrl, showTooltip, isHref) {
    var iconSourceUrl = getUrl(iconUrl);
    var openingTag = `<div class="wand-tools-helper-icon-tooltip">`;
    var closingTag = `</div>`;
    var imageTag = `<img src=${iconSourceUrl} 
        class="${className}"   
        data-url="${originalUrl}" />`;
    // if (isHref) {
    //     imageTag = `<a href=${originalUrl}>${imageTag}</a>`;
    // }

    if (showTooltip) {
        var spanTag = `<span class="tooltiptext">${titleString}</span>`;
        return `${openingTag}${imageTag}${spanTag}${closingTag}`;
    } else {
        return `${openingTag}${imageTag}${closingTag}`;
    }
}

function addIconTagsToLinks(links, iconsArray, showTooltip) {
    console.log(links);
    links.forEach(link => {
        if (link.parentElement == null) {
            return
        }
        var originalUrl = link.href;
        var iconTags = '';
        iconsArray.forEach(iconData => {
            var isHref = false;
            if (iconData.icon == "secure_open.svg") {
                isHref = true
            }
            var iconTag = constructImageTag(
                iconData.icon,
                iconData.class,
                iconData.title,
                originalUrl,
                showTooltip,
                isHref
            )
            iconTags += iconTag;
        });
        var url = new URL(originalUrl);
        var hostName = url.hostname;
        if (Object.keys(customIconsArray).includes(hostName)) {
            var iconData = customIconsArray[hostName];
            var iconTag = constructImageTag(
                iconData.icon,
                iconData.class,
                iconData.title,
                `${originalUrl}#answers-header`,
                showTooltip,
                iconData.isHref
            )
            iconTags += `<span style="margin-left:2px; border-left:2px solid #000;height:50px"></span>${iconTag}`;
        }
        link.parentElement.innerHTML += `<br>${iconTags}`;
    });
}

function initialize() {
    try {
        var links = getAllLinksInSearchResult();
        var gettingSettings = browser.storage.local.get();
        gettingSettings.then((data) => {
            if (data.settings) {
                var settingsConfig = data.settings
                var iconsArray = prepareIconsArray(
                    settingsConfig
                );
                try {
                    addIconTagsToLinks(
                        links,
                        iconsArray,
                        settingsConfig.tooltip_toggle
                    );
                } catch (error) {
                    console.log(error);
                }
                EVENT_LISTENER_ARRAY.forEach(element => {
                    attachEventListenerTo(
                        element.class,
                        element.handler
                    )
                });
            }
        }, (err) => {
            console.log(err)
        });
    } catch (error) {
        console.log(error);
    }
}

initialize();

const loadingText = new Array(
    `Locating the required gigapixels to render...`,
    `Spinning up the hamster...`,
    `Shovelling coal into the server...`,
    `Programming the flux capacitor...`,
    `Please wait while the little elves draw your map`,
    `Don't worry - a few bits tried to escape, but we caught them`,
    `Would you like fries with that?`,
    `Checking the gravitational constant in your locale...`,
    `Go ahead -- hold your breath!`,
    `...at least you're not on hold...`,
    `Hum something loud while others stare`,
    `You're not in Kansas any more`,
    `The server is powered by a lemon and two electrodes.`,
    `Please wait while a larger software vendor in Seattle takes over the world`,
    `We're testing your patience`,
    `As if you had any other choice`,
    `Follow the white rabbit`,
    `Why don't you order a sandwich?`,
    `While the satellite moves into position`,
    `keep calm and npm install`,
    `The bits are flowing slowly today`,
    `Dig on the 'X' for buried treasure... ARRR!`,
    `It's still faster than you could draw it`,
);

function getRandomLoadingMessage() {
    return loadingText[Math.round(Math.random() * (loadingText.length - 1))];
}