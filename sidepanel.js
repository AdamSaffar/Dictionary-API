//const { createElement } = require("react");

const wordText = document.getElementById("word-text");
const pronounceContainer = document.getElementById("pronounce-container");
const definitonContainer = document.getElementById("definition-container");
const originContainer = document.getElementById("origin-container");
let currentAudioUrl = null;
const audioButton = document.querySelector('.audio-bttn');
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
    wordText.innerText = data.message;
    definitonContainer.innerText = "";
    audioButton.style.display = "none"; // hide button
    return;
  }
  clearOldValues(pronounceContainer, originContainer, definitonContainer);

  // set main word
  wordText.innerText = data.word;

  // set new pronounciation text
  pronounceContainer.innerText = data.phonetics?.[0]?.pronounce;
  // set new origin text
  originContainer.innerText = data.origin;

  // set new audio
  if(data.phonetics?.[0]?.audioRec) {
    currentAudioUrl = data.phonetics[0].audioRec;
    audioButton.style.display = "inline-block"; // reveal audio if available
  } else {
    audioButton.style.display = "none";
  }

  data.meanings.forEach((m) => {
    const newDiv = document.createElement("div");
    newDiv.classList.add("main-definiton-container");
    
    newDiv.innerHTML = `
      <strong>${m.partOfSpeech}</strong>
      <p>${m.definition}</p>
      ${m.example ? `<p>Example: ${m.example}</p>` : ""}
      ${m.synonyms && m.synonyms.length > 0 ? `<p>Synonym: ${m.synonyms}` : ""}
    `;

    definitonContainer.appendChild(newDiv);
  });
}

// clear out old data values
function clearOldValues(pronounceContainer, originContainer, definitonContainer) {
  pronounceContainer.innerText = "";
  originContainer.innerText = "";
  currentAudioUrl = null; 
  definitonContainer.innerText = "";
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