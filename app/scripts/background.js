browser.runtime.onMessage.addListener(handleMessages);

function handleMessages(message) {
  if (message.type == "OINT") {
    openInNewTab(message.url);
  } else if (message.type == "ATC") {
    addToCollection(message.search_term, message.url);
  } else if (message.type == "CS") {
    handleChangeSettings(message);
  }
}
function openInNewTab(url) {
  var CURRENT_TAB_ID = null;
  getCurrentTabID();

  function getCurrentTabID() {
    let gettingCurrentTabId = browser.tabs.query({
      currentWindow: true,
      active: true
    });
    gettingCurrentTabId.then(gotCurrentTabID, onError);
  }

  function gotCurrentTabID(tabs) {
    setCurrentTabID(tabs);
    createNewTabForTheGivenURL();
  }
  function setCurrentTabID(tabs) {
    CURRENT_TAB_ID = tabs[0].id;
  }

  function createNewTabForTheGivenURL() {
    var creating = browser.tabs.create({
      url: url
    });
    creating.then(afterCreatingNewTab, onError);
  }

  function afterCreatingNewTab(tab) {
    goToOriginalTab();
  }
  function goToOriginalTab() {
    var goingToOriginalTab = browser.tabs.update(CURRENT_TAB_ID, {
      active: true
    });
    goingToOriginalTab.then(arrivedAtOriginalTab, onError);
  }
  function onError(error) {
    console.log(error);
  }
  function arrivedAtOriginalTab(tab) {

  }
}

function addToCollection(searchTerm, url) {
  browser.storage.local.get(data => {
    if (data.collections) {
      var localCollections = data.collections;
      if (Object.keys(localCollections).includes(searchTerm)) {
        addToExistingCollections(localCollections);
      } else {
        createNewCollectionsAndAddToIt(localCollections);
      }
      updateCollections(localCollections);
    }
  });

  function updateCollections(localCollections) {
    browser.storage.local.set({
      collections: localCollections
    });
  }

  function createNewCollectionsAndAddToIt(localCollections) {
    var newlocalCollection = [url];
    localCollections[searchTerm] = newlocalCollection;
  }

  function addToExistingCollections(localCollections) {
    var localSearchTermArray = localCollections[searchTerm];
    localSearchTermArray.push(url);
    localCollections[searchTerm] = localSearchTermArray;
  }
}
function handleChangeSettings(message) {
  browser.storage.local.set({
    settings: message.settings
  });
}
browser.runtime.onInstalled.addListener(details => {
  if (details.temporary) {
    developmentInstallation();
  } else {
    userInstallation();
  }
});

function userInstallation() {
  browser.storage.local.set({
    collections: {},
    settings: {
      "tooltip_toggle": true,
      "ont_toggle": true,
      "ctc_toggle": true,
      "so_toggle": true,
      "atc_toggle": true,
      "whois_toggle": true
    }
  });
  browser.tabs.create({ url: '../pages/intro.html' });
}

function developmentInstallation() {
  browser.storage.local.set({
    collections: getDemoCollections(),
    settings: {
      "tooltip_toggle": true,
      "ont_toggle": true,
      "ctc_toggle": true,
      "so_toggle": true,
      "atc_toggle": true,
      "whois_toggle": true
    }
  });
  browser.tabs.create({ url: '../pages/intro.html' });
}

function getDemoCollections() {
  return {
    "delete a object with its key js": [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete",
      "https://stackoverflow.com/questions/208105/how-do-i-remove-a-property-from-a-javascript-object?rq=1"
    ],
    "paris": [
      "https://en.wikipedia.org/wiki/Paris",
      "https://www.britannica.com/place/Paris",
      "https://www.tripadvisor.in/Tourism-g187147-Paris_Ile_de_France-Vacations.html"
    ]
  }
}