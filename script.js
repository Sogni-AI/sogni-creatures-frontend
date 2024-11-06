const animals = [
  "ant", "bear", "bee", "butterfly", "caterpillar", "cat", "crab", "crocodile",
  "deer", "dog", "dolphin", "dragon", "dragonfly", "eagle", "elephant", "fish",
  "fox", "giraffe", "gorilla", "horse", "jellyfish", "kangaroo", "koala",
  "ladybug", "lion", "lobster", "mantis", "monkey", "octopus", "owl", "panda",
  "penguin", "rabbit", "scorpion", "seal", "seahorse", "shark", "shrimp",
  "squid", "squirrel", "starfish", "spider", "tiger", "turtle", "whale", "zebra"
];
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'grey', 'brown'];
const personalities = ['loyal', 'courageous', 'free-spirited', 'majestic', 'wise', 'energetic', 'curious', 'icy', 'fiery', 'psychic', 'degen', 'fairy', 'fighting', 'techno'];

const colorCodes = {
  red: '#ffcccc',
  blue: '#ccccff',
  green: '#ccffcc',
  yellow: '#ffffcc',
  purple: '#e6ccff',
  orange: '#ffe6cc',
  pink: '#ffe6ff',
  black: '#e6e6e6',
  white: '#ffffff',
  grey: '#f2f2f2',
  brown: '#f5e6cc'
};

document.addEventListener('DOMContentLoaded', () => {
  const animalSelect = document.getElementById('animal-select');
  const colorSelect = document.getElementById('color-select');
  const personalitySelect = document.getElementById('personality-select');
  const form = document.getElementById('prompt-form');
  const generatedImage = document.getElementById('generated-image');
  const historyImagesContainer = document.querySelector('.history-images');
  const loader = document.getElementById('loader');
  const generateButton = document.getElementById('generate-button');
  const randomButton = document.getElementById('random-button');

  // Populate dropdowns with default selections
  populateDropdown(animalSelect, animals, 'tiger');
  populateDropdown(colorSelect, colors, 'pink');
  populateDropdown(personalitySelect, personalities, 'loyal');

  // Update background color based on default selections
  updateMainImageBackground();

  // Assign random muted colors to placeholders
  assignRandomColorsToPlaceholders();

  // Event listener for color change to update background
  colorSelect.addEventListener('change', updateMainImageBackground);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateCreature();
  });

  // Event listener for Random button
  randomButton.addEventListener('click', async () => {
    await handleRandomButtonClick();
  });

  // Function to scroll to the bottom of the history container
  function scrollToBottom() {
    historyImagesContainer.scrollTop = historyImagesContainer.scrollHeight;
  }

  // Function to populate dropdowns
  function populateDropdown(selectElement, options, defaultOption) {
    selectElement.innerHTML = ''; // Clear existing options
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = capitalize(option);
      if (option === defaultOption) {
        opt.selected = true; // Set default selection
      }
      selectElement.appendChild(opt);
    });
  }

  function randomizeSelection(selectElement) {
    const options = selectElement.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    selectElement.selectedIndex = randomIndex;
  }

  function updateMainImageBackground() {
    const selectedColor = colorSelect.value;
    const bgColor = colorCodes[selectedColor] || '#f0f0f0';
    document.querySelector('.main-image').style.backgroundColor = bgColor;
  }

  function assignRandomColorsToPlaceholders() {
    const placeholders = historyImagesContainer.querySelectorAll('.placeholder');
    placeholders.forEach(placeholder => {
      const randomColor = getRandomMutedColor();
      placeholder.style.backgroundColor = randomColor;
    });
  }

  async function generateCreature() {
    // Disable the buttons and indicate loading
    setButtonsState(true, 'Generating...');

    // Save current image to history if it's a fresh generation
    if (generatedImage.src && generatedImage.dataset.fromHistory === 'false') {
      addToHistory(generatedImage.src, generatedImage.title);
    }

    const promptDetails = {
      animal: animalSelect.value,
      color: colorSelect.value,
      personality: personalitySelect.value
    };

    const prompt = `A cute ${promptDetails.animal} against a solid fill background. ((${promptDetails.color})) body, with an expression and stance conveying a ${promptDetails.personality} personality.`;

    // Show loader and hide image
    loader.style.display = 'block';
    generatedImage.style.display = 'none';

    try {
      const response = await fetch(`https://creatures-api.sogni.ai/?animal=${promptDetails.animal}&color=${promptDetails.color}&personality=${promptDetails.personality}`);
      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData.errors));
        throw new Error('API response not ok');
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Set data-from-history before setting src
      generatedImage.dataset.fromHistory = 'false'; // Freshly generated image

      // Assign onload handler for freshly generated images
      generatedImage.onload = () => {
        loader.style.display = 'none';
        generatedImage.style.display = 'block';

        // Re-enable the buttons
        setButtonsState(false, 'Generate Creature!');
      };

      generatedImage.src = imageUrl;
      generatedImage.title = prompt;

    } catch (error) {
      console.error('Error:', error);
      loader.style.display = 'none';
      setButtonsState(false, 'Generate Creature!');
    }
  }

  function setButtonsState(disabled, generateButtonText) {
    generateButton.disabled = disabled;
    randomButton.disabled = disabled;
    generateButton.textContent = generateButtonText;
    generateButton.style.backgroundColor = disabled ? '#6c757d' : '#007aff';
    randomButton.style.backgroundColor = disabled ? '#6c757d' : '#34c759'; // Maintain color for random button
    generateButton.style.cursor = disabled ? 'not-allowed' : 'pointer';
    randomButton.style.cursor = disabled ? 'not-allowed' : 'pointer';
  }

  async function handleRandomButtonClick() {
    // Disable the buttons and indicate loading
    setButtonsState(true, 'Generating...');

    // Randomize selections with multiple prompts
    await randomizePromptMultipleTimes(3, 500, updateMainImageBackground);

    // Proceed to generate creature based on the final prompt
    await generateCreature();
  }

  function randomizePromptMultipleTimes(times, delay, callback) {
    return new Promise((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        randomizeSelection(animalSelect);
        randomizeSelection(colorSelect);
        randomizeSelection(personalitySelect);
        callback();

        count++;
        if (count >= times) {
          clearInterval(interval);
          resolve(); // Resolve the promise after final randomization
        }
      }, delay);
    });
  }

  function addToHistory(imageSrc, prompt) {
    // Prevent adding duplicates by checking existing history
    if (isImageInHistory(imageSrc)) {
      return; // Image already exists in history
    }

    const placeholder = historyImagesContainer.querySelector('.thumbnail.placeholder');
    const img = document.createElement('img');
    img.src = imageSrc;
    img.title = prompt;
    img.classList.add('thumbnail');
    img.dataset.fromHistory = 'true'; // Mark as from history

    img.addEventListener('click', () => {
      handleHistoryThumbnailClick(img);
    });

    if (placeholder) {
      historyImagesContainer.replaceChild(img, placeholder);
    } else {
      historyImagesContainer.appendChild(img); // Append to bottom
    }

    // Scroll to the bottom after adding the new thumbnail
    scrollToBottom();
  }

  function isImageInHistory(imageSrc) {
    const existingImages = historyImagesContainer.querySelectorAll('img.thumbnail');
    for (let img of existingImages) {
      if (img.src === imageSrc) {
        return true;
      }
    }
    return false;
  }

  function handleHistoryThumbnailClick(thumbnail) {
    // Save current image to history if it's a fresh generation
    if (generatedImage.src && generatedImage.dataset.fromHistory === 'false') {
      addToHistory(generatedImage.src, generatedImage.title);
    }

    // Remove the onload handler to prevent randomization
    generatedImage.onload = null;

    // Set data-from-history before setting src
    generatedImage.dataset.fromHistory = 'true'; // Loading from history

    // Load the clicked thumbnail image
    loader.style.display = 'block';
    generatedImage.style.display = 'none';
    generatedImage.src = thumbnail.src;
    generatedImage.title = thumbnail.title;

    // Update dropdown selections based on the prompt
    parseAndSetPrompt(thumbnail.title);

    // Update background color based on the selected color
    updateMainImageBackground();

    // Hide loader after setting src
    // Use a temporary onload handler to hide the loader
    generatedImage.onload = () => {
      loader.style.display = 'none';
      generatedImage.style.display = 'block';
      // No randomization here
    };
  }

  function parseAndSetPrompt(prompt) {
    // Example prompt: "A cute dog against a solid fill background. ((blue)) body, with an expression and stance conveying a loyal personality."
    const animalMatch = prompt.match(/A cute (\w+) against/);
    const colorMatch = prompt.match(/\(\((\w+)\)\) body/);
    const personalityMatch = prompt.match(/conveying a (\w+) personality/);

    if (animalMatch && animalMatch[1]) {
      setSelectValue(animalSelect, animalMatch[1]);
    }
    if (colorMatch && colorMatch[1]) {
      setSelectValue(colorSelect, colorMatch[1]);
    }
    if (personalityMatch && personalityMatch[1]) {
      setSelectValue(personalitySelect, personalityMatch[1]);
    }
  }

  function setSelectValue(selectElement, value) {
    for (let option of selectElement.options) {
      if (option.value.toLowerCase() === value.toLowerCase()) {
        selectElement.value = option.value;
        return;
      }
    }
  }

  function getRandomMutedColor() {
    const colors = ['#b3b3b3', '#c0c0c0', '#cccccc', '#d3d3d3', '#d9d9d9'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

});
