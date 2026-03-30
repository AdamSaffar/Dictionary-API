function isJson(fetchedResponse) {
  try {
    JSON.parse(fetchedResponse);
    return true;
  } catch(error) {
    console.error(error.message);
    return false;
  }
} 

function dataStructure(returnData) {
  // use ??(Nullish COalescing Op) as safety net
  const word = returnData?.word;
  if (!word) {
    word = "Word not found!"
    return;
  }
  const pronounce = returnData?.phonetics[0].text;
  const audioRecording = returnData?.phonetics[0].audio;
  let definitions = [];
  const lengthOfMeaning = returnData.meanings.length; 
  for(let i = 0; i <= lengthOfMeaning; i++) {
    definitions.push(returnData.meanings[i].definitions.definition);
  }

  return {
    word,
    pronounce,
    audioRecording,

  }
}
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

/*
// 2. Listen for the message from content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open_side_panel') {
    if (sender.tab && sender.tab.id) {
      // Open the panel for the specific tab that sent the message
      chrome.sidePanel.open({ tabId: sender.tab.id })
        .then(() => console.log("✅ Panel opened"))
        .catch((err) => console.error("❌ Panel error:", err));
    }
  }
});
*/
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSidePanelForSelection",
    title: "Select text to define",
    contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  if(message.type === "UPDATE_MENU_TITLE") {
    const updatedTitle = message.reset ? "Select text to define!" : `Define: "${message.newTitle}"`;
    chrome.contextMenus.update("openSidePanelForSelection", {
      title: `${updatedTitle}`
    });
  }
  if(message.data) {
    currentSelection = message.data;
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentSelection}`);
      const returnData = await response.json();
      console.log("It is JSON:",returnData);
      if(Array.isArray(returnData)) {
        console.log(returnData[0].meanings[0].definitions[0].definition); 
      } else {
        console.log("Word not found!");
      }
    } catch(error) {
      console.error(error.messsage);
    }
  }
  // Retrn True to keep message channel open for async
  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if(info.menuItemId === "openSidePanelForSelection") {     
    chrome.sidePanel.open({tabId: tab.id});
  }
});
