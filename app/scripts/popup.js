function getMyIp() {
    my_nw_ip_address_var.innerText = getRandomLoadingMessage();
    my_nw_registry_var.innerText = getRandomLoadingMessage();
    my_nw_country_name_var.innerText = getRandomLoadingMessage();
    my_nw_detail_var.innerText = getRandomLoadingMessage();
    fetch('https://iplist.cc/api')
        .then(response => response.json())
        .then((data) => {
            my_nw_ip_address_var.innerText = data.ip
            my_nw_registry_var.innerText = data.registry
            my_nw_country_name_var.innerText = data.countryname
            my_nw_detail_var.innerText = data.detail
        });
}
function updateHtmlContent() {
    collectionsSection.innerHTML = getRandomLoadingMessage();
    var collections_section_innerHtml = '';
    var gettingData = browser.storage.local.get();
    gettingData.then(gotData, gotError);
    function gotData(data) {
        if (data.settings) {
            renderSettings(data.settings);
        }
        if (data.collections) {
            renderCollections(data);
        }
    }

    function renderCollections(data) {
        console.log(data);
        var localCollections = data.collections;
        var searchStrings = Object.keys(localCollections);
        if (searchStrings.length == 0) {
            collectionsSection.innerHTML = showIntroTextForCollections();
        }
        else {
            showCollections(searchStrings, localCollections);
            addEventListenerToDeleteCollections();
        }
    }

    function renderSettings(settings) {
        show_tooltip_toggle_var.checked = settings.tooltip_toggle;
        show_ont_toggle_var.checked = settings.ont_toggle;
        show_ctc_toggle_var.checked = settings.ctc_toggle;
        show_so_toggle_var.checked = settings.so_toggle;
        show_atc_toggle_var.checked = settings.atc_toggle;
        show_whois_toggle_var.checked = settings.whois_toggle;
        attachEventListenerTo(
            "wand-tools-settings-ui",
            handleSettingsChange
        )
    }

    function showCollections(searchStrings, localCollections) {
        updateCollectionsCount(searchStrings);
        var headerTag = `
                    <div uk-accordion="multiple: true" class="uk-container">`;
        searchStrings.forEach(searchString => {
            var urlArray = localCollections[searchString];
            var accordionHeaderTag = `<div>
                    <a class="uk-accordion-title uk-animation-slide-top uk-animation-fast " href="#">
                    <span uk-icon="tag"></span> 
                    ${searchString} 
                    <span class="uk-badge">${urlArray.length}</span>
                    </a>
                    `;
            var urlsInsideAccordion = `<div class="uk-accordion-content">
                    <ul class="uk-list uk-list-collapse uk-list-divider">
                    <li class"uk-position-center">
                    <button data-string="${searchString}" class="uk-button uk-button-danger wand-tools-delete-collection uk-margin-small-bottom ">Delete </button>
                    <button data-string="${searchString}" class="uk-button uk-button-primary wand-tools-open-collection uk-margin-small-bottom">Open all links </button>
                    </li>
                    `;
            urlArray.forEach(url => {
                urlsInsideAccordion += `<li><span uk-icon="link"></span> ${url}</li>`;
            });
            urlsInsideAccordion += `</ul></div>`;
            var accordionCloserTag = '</div>';
            collections_section_innerHtml += `${accordionHeaderTag}${urlsInsideAccordion}${accordionCloserTag}`;
        });
        var closingTag = `</div>`;
        collectionsSection.innerHTML = headerTag + collections_section_innerHtml + closingTag;
    }

    function showIntroTextForCollections() {
        return ` 
                <ul class="uk-list  uk-list-divider">
                <li class="uk-animation-slide-top uk-animation-fast">
                <p class="uk-text-emphasis uk-text-primary">
                 No Collections yet, Add them without hassle!
                 </p>
                You can add collections just by clicking on this 
                <img src="${browser.extension.getURL('images/collections.svg')}" height="20px" width="20px"/> icon.
                </li>
                <li class="uk-animation-slide-top uk-animation-fast">
                <p class="uk-text-emphasis uk-text-primary">
                 But why I've to do this?
                 </p>
                 You can use this feature to quickly gather several links and go through one by one and also they can be saved for future reference.
                 </li>
                 <li class="uk-animation-slide-top uk-animation-fast">
                 <p class="uk-text-emphasis uk-text-primary">
                 Bye Bye to managing stuff!
                 </p>
                 The links you gather are automatically organised under your search text ! (The words you typed in Google search box)
                 </li>
                 <li>
                 <p class="uk-text-emphasis uk-text-primary uk-animation-slide-bottom">
                 Go search and add some collections here!<br>
                 <a class="uk-link-heading" href="https://www.google.com/search?client=firefox-b-d&q=venice"> Search for Venice </a>
                </p>
                </li>
                </ul>
                `;
    }

}
function updateCollectionsCount(searchStrings) {
    document.getElementById('num_of_collections').innerText = searchStrings.length;
}

function handleSettingsChange(e) {
    var updateSettings = {
        "tooltip_toggle": show_tooltip_toggle_var.checked,
        "ont_toggle": show_ont_toggle_var.checked,
        "ctc_toggle": show_ctc_toggle_var.checked,
        "so_toggle": show_so_toggle_var.checked,
        "atc_toggle": show_atc_toggle_var.checked,
        "whois_toggle": show_whois_toggle_var.checked
    }
    console.log(updateSettings);
    browser.storage.local.set({
        settings: updateSettings
    });
}
function updateVersionText() {
    var version = browser.runtime.getManifest().version;
    document.getElementById("wand-tools-version-text")
        .innerHTML = `Version : ${version}`;
}
function addEventListenerToDeleteCollections() {
    var deleteIcons = document.getElementsByClassName("wand-tools-delete-collection");
    var openIcons = document.getElementsByClassName("wand-tools-open-collection");
    for (let i = 0; i < deleteIcons.length; i++) {
        var deleteIcon = deleteIcons[i];
        var openIcon = openIcons[i];
        deleteIcon.addEventListener('click', handleCollectionDelete);
        openIcon.addEventListener('click', handleCollectionOpen);
    }
}
function handleCollectionOpen(event) {
    var searchString = event.srcElement.dataset.string;
    var gettingCollections = browser.storage.local.get();
    gettingCollections.then(gotCollections, gotError);
    function gotCollections(data) {
        if (data.collections) {
            var urls = data.collections[searchString];
            urls.forEach(url => {
                var creating = browser.tabs.create({
                    url: url
                });
            });
        }
    }

}
function handleCollectionDelete(event) {
    var searchString = event.srcElement.dataset.string;
    var gettingCollections = browser.storage.local.get();
    gettingCollections.then(gotCollections, gotError);
    function gotCollections(data) {
        if (data.collections) {
            var localCollections = data.collections;
            delete localCollections[searchString];
            var settingCollection = browser.storage.local.set({
                collections: localCollections
            });
            settingCollection.then(setCollections, gotError);
            function setCollections() {
                updateCollectionsCount(Object.keys(localCollections));
                initialize();
            }
        }
    }
}
function getRandomLoadingMessage() {
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
    return loadingText[Math.round(Math.random() * (loadingText.length - 1))];
}

function initialize() {
    updateHtmlContent();
    document.getElementById("get_my_ip_btn")
        .addEventListener('click', getMyIp);
    updateVersionText()
}

function attachEventListenerTo(className, eventHandler) {
    var allElements = document.getElementsByClassName(className);
    console.log(allElements);
    for (let i = 0; i < allElements.length; i++) {
        allElements[i].addEventListener('click', eventHandler);
    }
}
function stringToDOM(htmlString) {

    // var wrapper = document.createElement('div');
    // wrapper.innerHTML = htmlString;
    // var df = document.createDocumentFragment();
    // return df.addChilds(wrapper.children);

    var d = document.createElement('div');
    d.innerHTML = htmlString;
    console.log(d);
    return d.children;

    // var xmlString = "<div id='foo'><a href='#'>Link</a><span></span></div>";
    // var doc = new DOMParser().parseFromString(xmlString, "text/xml");
    // console.log(doc.firstChild.innerHTML); // => <a href="#">Link...
    // console.log(doc.firstChild.firstChild.innerHTML); // => Link
};
var show_tooltip_toggle_var = document
    .getElementById("show_tooltip_toggle");
var show_ont_toggle_var = document
    .getElementById("show_ont_toggle");
var show_ctc_toggle_var = document
    .getElementById("show_ctc_toggle");
var show_so_toggle_var = document
    .getElementById("show_so_toggle");
var show_atc_toggle_var = document
    .getElementById("show_atc_toggle");
var show_whois_toggle_var = document
    .getElementById("show_whois_toggle");
var collectionsSection = document
    .getElementById("collections_section");
var my_nw_ip_address_var = document
    .getElementById("my_nw_ip_address");
var my_nw_registry_var = document
    .getElementById("my_nw_registry");
var my_nw_country_name_var = document
    .getElementById("my_nw_country_name");
var my_nw_detail_var = document
    .getElementById("my_nw_detail");
initialize();
function gotError(err) {
    console.log(err);
}