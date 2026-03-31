//const { createElement } = require("react");

const wordHeader = document.getElementById("word-header");
const pronounceContainer = document.getElementById("pronounce-container");
const audioButton = document.getElementById("audio-bttn");
const originContainer = document.getElementById("origin-container");
const definitonContainer = document.getElementById("definition-container");
let currentAudioUrl = null;

audioButton.addEventListener("click", () => {
  if(currentAudioUrl) {
    const player = new Audio(currentAudioUrl);
    player.play();
  } else {
    console.log("No audio file available");
  }
});
function updateUI(data) {
  if(data.error) {
    wordHeader.innerText = data.message;
    definitonContainer.innerText = "";
    return;
  }
  // set main word
  wordHeader.innerText = data.word;

  // clear out old pronounciation text
  pronounceContainer.innerText = "";
  // set new pronounciation text
  pronounceContainer.innerText = data.phonetics[0].pronounce;
  // clear out old origin text
  originContainer.innerText = "";
  // set new origin text
  originContainer.innerText = data.origin;
  // clear out old audio
  currentAudioUrl = null; 
  // set new audio
  currentAudioUrl = data.phonetics[0].audioRec;

  // clear out old definitions
  definitonContainer.innerText = "";

  data.meanings.forEach((m) => {
    const newDiv = document.createElement("div");
    newDiv.classList.add("main-definiton-container");
    
    newDiv.innerHTML = `
      <strong>${m.partOfSpeech}</strong>
      <p>${m.definition}</p>
      <p>${m.example}</p> 
      <p>${m.synonyms}</p>
    `;

    definitonContainer.appendChild(newDiv);
  });
}

function clearOldValues() {
  
}
// When panel first opens, grab whatever is currently in storage
chrome.storage.session.get("dictionaryData", (result) => {
  if(result.dictionaryData) {
    updateUI(result.dictionaryData);
  }
});

/* if user leaves panel open and right clicks new word
fire evnt automatically when background updates storage */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if(namespace === 'session' && changes.dictionaryData) {
    updateUI(changes.dictionaryData.newValue);
  }
})