//const { createElement } = require("react");

const wordText = document.getElementById("word-text");
const pronounceText = document.getElementById("pronounce-text");
const definitonContainer = document.querySelector('.definition-container');
const originContainer = document.getElementById("origin-container");
const originText = document.getElementById("origin-text");

const headerContainer = document.getElementById('.header-container');
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
  console.log("Structred Data:", data);
  if(data.error) {
    clearOldValues(wordText, pronounceText, originText, definitonContainer);
    audioButton.style.display = "none";
    wordText.innerText = data.message;
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
      newSynonymDiv.addEventListener("click", (event) => {
        if(event.target.classList.contains("synonym-text")) {
          const clickedWord = event.target.innerText;
          console.log("Selected new word: ", clickedWord);
          const currentWord = data.word;
          performNewSearch(clickedWord, currentWord);
        }
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

function performNewSearch(newWord, currentWord) {
  //chrome.local.storage.set({lastWord: currentWord}); 
  chrome.runtime.sendMessage({type: "SEARCH_WORD", data: newWord});  
  // scroll back to top of page
  window.scrollTo(0,0);
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

