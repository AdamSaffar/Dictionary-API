const isAlpha = (char) => {
  return /^[a-z]$/i.test(char);
};

function bannerGeneration() {
  const newDiv = document.createElement("div");
  newDiv.classList.add("main-container");
  newDiv.innerHTML = `
  <div>

  </div>
  `;

  document.appendChild(newDiv);
}
function grabText() {
  // .trim() removes leading and trailing white space 
  const result = [];
  const selectedText = document.getSelection().toString().trim();
  if(selectedText !== "undefined" && selectedText !== "") {
    for(const char of selectedText) {
      // base case: end of word
      if(char === " ") {
        break;
      }
      if(isAlpha(char)) {
        result.push(char)
      }
   }
   console.log(result);
   return result;
  }
}

document.addEventListener("mouseup", () => {
  grabText();
});