// global var to store cleaned highlighted text
let capturedText = "";
// reusable sleep tool to set small timeout
const sleep = (ms) => new Promise(r => setTimeout(r,ms));

function isAlpha(char) {
  return /^[a-z]$/i.test(char);
}

function bannerGeneration() {
  const divPlacement = document.querySelector('')
  const newDiv = document.createElement("div");
  newDiv.classList.add("main-container");
  newDiv.innerHTML = `
  <div>

  </div>
  `;

  document.appendChild(newDiv);
}
async function grabText() {
  await sleep(10); // wait for browser to finish highlight
  const result = [];
  // .trim() removes leading and trailing white space 
  const selectedText = document.getSelection().toString().trim();

  // handles null and empty strings as well as strings greater than 45 char. 
  if(!selectedText || selectedText.length > 45) {
    // send flag to background so it knows to reset
    chrome.runtime.sendMessage({type: "UPDATE_MENU_TITLE", reset: true});
    return null;
  }
  for(const char of selectedText) {
    // base case: end of word
    if(char === " ") {
      break;
    }
    // only push if character is alpha
    if(isAlpha(char)) {
      result.push(char);
    }
  }

  const resultString = result.join("");
  if(resultString) {
    chrome.runtime.sendMessage({type: "UPDATE_MENU_TITLE", newTitle: resultString, data: resultString});
    return resultString;
  }
  return null;
}

document.addEventListener("mouseup", async () => {
  const finalString = await grabText();
  if(finalString) {
    //console.log(finalString);
  }
});

/*
// generate button that when clicked reveals the side-panel
const sidePanelbutton = document.createElement('button');
sidePanelbutton.textContent = "Open Scraper Panel";
sidePanelbutton.style.cssText = `
  position: fixed;
  top: 50px;
  left: 50px;
  z-index: 9999999;
  background: red;
  color: white;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
`;

sidePanelbutton.addEventListener('click', () => {
  // Sending the shout to the background script
  chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
document.body.appendChild(sidePanelbutton);

*/ 