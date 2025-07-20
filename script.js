const promptInput = document.querySelector('.prompt-input');
const modelSelection = document.querySelector('.model-selection');
const numImgSelection = document.querySelector('.numOFimage-selection');
const sizeImgSelection = document.querySelector('.size-selection');
const generateBtn = document.querySelector('.generate-btn');
const imgGrid = document.querySelector('.image-grid');
const apiKey = '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'; 

// Dark mode toggler, saving and applying preferred theme
function initializeTheme() {

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeToApply = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  if (themeToApply === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  updateThemeToggle();
}

function toggleTheme() {

  document.body.classList.toggle('dark-theme');
  
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'dark' : 'light';
  
  localStorage.setItem('theme', newTheme);
  
  updateThemeToggle();
}

function updateThemeToggle() {
  const themeLogo = document.getElementById('themeLogo');
  const themeName = document.getElementById('themeName');
  
  if(document.body.classList.contains('dark-theme')){
    themeLogo.classList.remove('fa-moon');
    themeLogo.classList.add('fa-sun');
    themeName.textContent = 'Light Mode';
  } else {
    themeLogo.classList.remove('fa-sun');
    themeLogo.classList.add('fa-moon');
    themeName.textContent = 'Dark Mode';
  }
}

document.addEventListener('DOMContentLoaded', initializeTheme);

// Determine width and height based on chosen aspect ratio
function getImageDimensions(aspectRatio, baseSize = 512) {
  const [width, height] = aspectRatio.split('/').map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return {width: calculatedWidth, height: calculatedHeight};
}

// Generating images with post Fetch method, using FOR loop to call the api for each selected image 
async function generateImages(selectedModel, imageCount, aspectRatio, promptText) {
  const {width, height} = getImageDimensions(aspectRatio);
  const imagePlaceholders = document.querySelectorAll('.image-placeholder');
  
  try {
    imagePlaceholders.forEach(placeholder => {
      placeholder.classList.add('generating');
    });

    for (let i = 0; i < imageCount; i++) {
      const response = await fetch(
        `https://router.huggingface.co/replicate/v1/models/${selectedModel}/predictions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: promptText,
            parameters: {
              width: width,
              height: height
            }
          })
        }
      );

      if (!response.ok) {
        const errorMessage = response.status === 402 ? 'Error 402' : `API request failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      const placeholder = imagePlaceholders[i];
      placeholder.classList.remove('generating');
      placeholder.style.backgroundImage = `url(${imageUrl})`;
      placeholder.classList.add('loaded');
    }
  } 
  catch (error) {
    console.error("Error generating images:", error);
    imagePlaceholders.forEach(placeholder => {
      placeholder.classList.remove('generating');
      if(error.message === 'Error 402'){
        placeholder.innerHTML = `<div class="error-text">No more free atempts! Payment is required.</div>`;
      }
      else{
        placeholder.innerHTML = `<div class="error-text">Error generating image</div>`;
      }
    });
  }
}

function createImgCards(selectedModel, imageCount, aspectRatio, promptText) {
  imgGrid.innerHTML = "";
  
  for (let i = 0; i < imageCount; i++) {
    imgGrid.innerHTML += `
      <div class="image-placeholder" style="aspect-ratio: ${aspectRatio}">
        <div class="generating-text">Generating...</div>
        <button class="imgDonwloadBtn">
          <i class="fa-solid fa-download"></i>
        </button>
      </div>`;
  }
  

  generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

// Adding functionality to the Generate button
generateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  const selectedModel = modelSelection.value;
  const imageCount = parseInt(numImgSelection.value);
  const aspectRatio = sizeImgSelection.value;
  const promptText = promptInput.value.trim();

  if (!promptText) {
    alert("Please enter a prompt");
    return;
  }

  createImgCards(selectedModel, imageCount, aspectRatio, promptText);
});

// Add download functionality
document.addEventListener('click', (e) => {
  if (e.target.closest('.imgDonwloadBtn')) {
    const placeholder = e.target.closest('.image-placeholder');
    const bgImage = placeholder.style.backgroundImage;
    
    if (bgImage && bgImage !== 'none') {
      const imageUrl = bgImage.replace('url("', '').replace('")', '');
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});