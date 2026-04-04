//const { createElement } = require("react");

const wordText = document.getElementById("word-text");
const pronounceText = document.getElementById("pronounce-text");
const definitonContainer = document.querySelector('.definition-container');
const originContainer = document.getElementById("origin-container");
const originText = document.getElementById("origin-text");

const partOfSpeech = document.getElementById("partOfSpeech");

const wordMainContainer = document.querySelector('.word-main-container');
let currentAudioUrl = null;
const audioButton = document.querySelector('.audio-bttn');
audioButton.addEventListener("click", () => {
  if(currentAudioUrl) {
    const player = new Audio(currentAudioUrl);
    player.play();
  } else {
    console.log("No audio file available / Corrupted File");
  }
});
function updateUI(data) {
  console.log(data);
  console.log(data.meanings);
  if(data.error) {
    wordText.innerText = data.message;
    wordMainContainer.innerHTML = "";
    return;
  }
  clearOldValues(wordText, pronounceText, originText, definitonContainer);

  // set main word
  wordText.innerText = data.word;

  // set new pronounciation text
  if(data?.pronunciation) {
    // set new pronounciation text
    pronounceText.style.display = "block";
    pronounceText.innerText = data?.pronunciation;
  } else {
    pronounceText.style.display = "none";
  }

  if(data?.audioRec?.length > 0) {
    currentAudioUrl = data.audioRec[0];
    audioButton.style.display = "block";
  } else {
    audioButton.style.display = "none";
  }

  // set new origin text
  if(data?.origin) {
    originContainer.style.display = "block";
    originText.innerHTML = `Origin: ${data.origin}`;
  } else {
    originContainer.style.display = "none";
  }
  
  let lastPOS = " ";
  const lengthOfMeanings = data.meanings.length;
  data.meanings.forEach((m, count) => {
    if(m.partOfSpeech !== lastPOS) {
      const posHeader = document.createElement("h2");
      posHeader.classList.add("partOfSpeech");
      posHeader.innerText = `${m.partOfSpeech}`;
      definitonContainer.appendChild(posHeader);
      // update lasPOS
      lastPOS = m.partOfSpeech;
    }

    const newDefDiv = document.createElement("div");
    newDefDiv.innerHTML = `
      ${lengthOfMeanings > 1 ? `<p id = "definiton-text">${++count}. ${m.definition}</p>` : `<p id = "definiton-text">${m.definition}</p>`}
      ${m.example ? `<p id = "example-text">"${m.example}"</p>` : ""}
    `;
    
    if(m?.synonyms && (m.synonyms.length > 0)) {
      const newSynonymDiv = document.createElement("div");
      newSynonymDiv.classList.add("synonym-row");
      newSynonymDiv.innerHTML = `
        <span class = "similar-label">
          Similar: 
        </span>
      `;
      m.synonyms.forEach((syn) => {
        // !IMPORTANT: Use += to not write over previously written HTML
        newSynonymDiv.innerHTML += `
         <button class = "synonym-text">${syn}</button>
        `;
      });
      newDefDiv.appendChild(newSynonymDiv);
    }
    definitonContainer.appendChild(newDefDiv);
  });
}

// clear out old data values
function clearOldValues(wordText, pronounceText, originText, definitonContainer) {
  wordText.innerText = "";
  pronounceText.innerText = "";
  originText.innerText = "";
  currentAudioUrl = null; 
  definitonContainer.innerHTML = "";
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
});

