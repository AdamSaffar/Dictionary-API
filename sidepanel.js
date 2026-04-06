//const { createElement } = require("react");

/*
// CAN'T USE GLOBAL VARS
// When back button is pressed, these global vars are stil pointing to
// the old, detached elements. Its writing defintions into ghost HTML 

const wordText = document.getElementById("word-text");
const pronounceText = document.getElementById("pronounce-text");
const definitonContainer = document.querySelector('.definition-container');
const originContainer = document.getElementById("origin-container");
const originText = document.getElementById("origin-text");

const headerContainer = document.querySelector('.header-container');
const wordMainContainer = document.querySelector('.word-main-container');
let currentAudioUrl = null;
const audioButton = document.querySelector('.audio-bttn');
*/

let currentAudioUrl = null;
// keeps track of HTML state for back button
let htmlTracker = []; // LIFO stack logic
/*
goBackButton.addEventListener('click', () => {
  loadPreviousHTML();
});
audioButton.addEventListener("click", () => {
  if(currentAudioUrl) {
    const player = new Audio(currentAudioUrl);
    player.play();
  } else {
    console.log("No audio file available / Corrupted File");
  }
});
*/
function updateUI(data) {
  // move global vars here to make sure we are grabbing live HTML
  const wordText = document.getElementById("word-text");
  const pronounceText = document.getElementById("pronounce-text");
  const definitonContainer = document.querySelector('.definition-container');
  const originContainer = document.getElementById("origin-container");
  const originText = document.getElementById("origin-text");
  //const headerContainer = document.querySelector('.header-container');
  //const wordMainContainer = document.querySelector('.word-main-container');
  const audioButton = document.querySelector('.audio-bttn');
  const goBackButton = document.querySelector('.go-back-bttn');

  console.log("Structred Data:", data);
  if(data.error) {
    clearOldValues(wordText, pronounceText, originText, definitonContainer, goBackButton);
    audioButton.style.display = "none";
    wordText.innerText = data.message;
    return;
  }
   clearOldValues(wordText, pronounceText, originText, definitonContainer, goBackButton);

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
      /*
      newSynonymDiv.addEventListener("click", (event) => {
        saveCurrentHTML();
        if(event.target.classList.contains("synonym-text")) {
          const clickedWord = event.target.innerText;
          console.log("Selected new word: ", clickedWord);

          performNewSearch(clickedWord);
        }
      });
      */
      newDefDiv.appendChild(newSynonymDiv);
    }
    definitonContainer.appendChild(newDefDiv);
  });
}

// clear out old data values
function clearOldValues(wordText, pronounceText, originText, definitonContainer, goBackButton) {
  wordText.innerText = "";
  pronounceText.innerText = "";
  originText.innerText = "";
  currentAudioUrl = null; 
  definitonContainer.innerHTML = "";
  goBackButton.display = "none";
}

function performNewSearch(newWord) {
  //chrome.local.storage.set({lastWord: currentWord}); 

  const goBackButton = document.querySelector('.go-back-bttn');
  if(goBackButton) {
    goBackButton.style.display = "block";
  }
  chrome.runtime.sendMessage({type: "SEARCH_WORD", data: newWord});  
  // scroll back to top of page
  window.scrollTo(0,0);
}

function saveCurrentHTML() {
  const htmlText = document.documentElement.outerHTML;
  //const doc = new DOMParser().parseFromString(htmlText, 'text/html');
  htmlTracker.push({
    htmlText: htmlText,
    audio: currentAudioUrl
  });
}

function loadPreviousHTML() {
  console.log("Popping off a page from the stack");
  if(htmlTracker.length > 0) {
  
    const state = htmlTracker.pop();
    const doc = new DOMParser().parseFromString(state.htmlText, 'text/html');
    // doc.location.reload(); // refresh HTML
    const newBodyContent = doc.body.innerHTML;
    currentAudioUrl = state.audio;
    document.body.innerHTML = newBodyContent;
    
    const goBackButton = document.querySelector('.go-back-bttn');
    if(htmlTracker.length === 0 && goBackButton) {
      goBackButton.style.display = "none";
    }
    //wakeUpHtml();
   /*
   const previousHTML = htmlTracker.pop();
   document.open(); // this clears current page
   document.write(previousHTML); // writes old HTML string to docuemnt
   document.close();

   wakeUpHtml();
   */ 
  }
}
/*
function wakeUpHtml() {
  
  // wake up back button 
  const backButton = document.querySelector('.go-back-bttn');
  if(backButton) {
    backButton.onclick = () => loadPreviousHTML();
  }
  // wake up audio bttn
  const audioBttn = document.querySelector('.audio-bttn');
    audioBttn.onclick = () => {
      if(currentAudioUrl) {
        new Audio(currentAudioUrl).play();
      }
    };
}
*/
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


document.addEventListener("click", (event) => {
  if(event.target.classList.contains("synonym-text")) {
    // save before moving away
    saveCurrentHTML();
    
    //search
    const clickedWord = event.target.innerText;
    performNewSearch(clickedWord);
    return;
  }
  // use closest() instead of classList to also capture tooltip text
  if(event.target.closest(".audio-bttn")) {
    if(currentAudioUrl) {
      new Audio(currentAudioUrl).play();
    } else {
      console.log('audio not found / corrupted file');
    }
    return;
  }

  if(event.target.closest(".go-back-bttn")) {
    loadPreviousHTML();
    return;
  }
});