chrome.action.onClicked.addListener((tab) => {
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup",
      width: 500,
      height: 400
    });
  });
  