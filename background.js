let currentSelection = "";
/*
function isJson(fetchedResponse) {
  try {
    JSON.parse(fetchedResponse);
    return true;
  } catch(error) {
    console.error(error.message);
    return false;
  }
} 
*/ 
// refine syllable finder logic so it accuarately puts a delimiter between each syllable
function syllableFinder(text) {
  return text.replace(/([aeiou])/gi, "$1·");
}

function dataStructure(data) {
  if (Array.isArray(data)) {
    data = data[0]; 
  }
  // use ??(Nullish Coalescing Op) as safety net
  let word = data?.word;
  if (!word) {
    return {
      error: true, 
      message: "Word not found!"
    };
  }
  const phonetics = data.phonetics?.filter(m => m.text && m.audio).map(m => ({
    pronounce: m.text, 
    audioRec: m.audio
  })) ?? [];
  const origin = data?.origin ?? ""; 

  // All data obtained through "meanings" property
  const meanings = data.meanings?.flatMap(m => 
    m.definitions.map(d => ({
      partOfSpeech: m.partOfSpeech ?? "", // pull 'partOfSpeech' from parent m
      definition: d.definition ?? "", 
      example: d.example ?? "",
      synonyms: d.synonyms ?? ""
    }))
  ) ?? [];

  return {
    error: false, 
    word,
    phonetics,
    origin, 
    meanings
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message.type === "UPDATE_MENU_TITLE") {
    const updatedTitle = message.reset ? "Select text to define!" : `Define: "${message.newTitle}"`;
    chrome.contextMenus.update("openSidePanelForSelection", {
      title: `${updatedTitle}`
    });
  }
  if(message.data) {
    currentSelection = message.data;
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if(info.menuItemId === "openSidePanelForSelection") {     
    chrome.sidePanel.open({tabId: tab.id});
  }
  const wordToDefine = currentSelection;
  if(wordToDefine) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToDefine}`);
      const data = await response.json();
      console.log("It is JSON:",data);
      
      const finalizedData = dataStructure(data);
      await chrome.storage.session.set({dictionaryData: finalizedData});
      
    } catch(error) {
      console.error(error.messsage);
    }
  }
  // Retrn True to keep message channel open for async
  return true;
});
