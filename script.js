const animals = ['bee', 'crocodile', 'dog', 'jellyfish', 'koala', 'panda', 'scorpion', 'tiger'];
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

  // Populate dropdowns
  populateDropdown(animalSelect, animals);
  populateDropdown(colorSelect, colors);
  populateDropdown(personalitySelect, personalities);

  // Initial randomization effect on page load
  randomizePromptMultipleTimes(3, 500, updateMainImageBackground);

  // Assign random muted colors to placeholders
  const placeholders = historyImagesContainer.querySelectorAll('.placeholder');
  placeholders.forEach(placeholder => {
    const randomColor = getRandomMutedColor();
    placeholder.style.backgroundColor = randomColor;
  });

  // Event listener for color change to update background
  colorSelect.addEventListener('change', updateMainImageBackground);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable the button and change its text
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    generateButton.style.backgroundColor = '#6c757d'; // Gray color
    generateButton.style.cursor = 'not-allowed';

    // Move current image to history immediately
    if (generatedImage.src && generatedImage.src.startsWith('blob:')) {
      addToHistory(generatedImage.src, generatedImage.title);
    }

    const animal = animalSelect.value;
    const color = colorSelect.value;
    const personality = personalitySelect.value;

    const prompt = `A cute ${animal} against a solid fill background. Its body is ${color}-colored, with an expression and stance conveying a ${personality} personality.`;

    // Show loader and hide image
    loader.style.display = 'block';
    generatedImage.style.display = 'none';

    // Send request to API
    try {
      const response = await fetch(`https://creatures-api.sogni.ai/?animal=${animal}&color=${color}&personality=${personality}`);
      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData.errors));
        loader.style.display = 'none';
        resetGenerateButton();
        return;
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Set image onload handler
      generatedImage.onload = () => {
        loader.style.display = 'none';
        generatedImage.style.display = 'block';
        
        // Re-enable the button
        resetGenerateButton();

        // Post-render randomization for next prompt
        randomizePromptMultipleTimes(3, 500, updateMainImageBackground);
      };

      generatedImage.src = imageUrl;
      generatedImage.title = prompt;

    } catch (error) {
      console.error('Error:', error);
      loader.style.display = 'none';
      resetGenerateButton();
    }
  });

  function populateDropdown(selectElement, options) {
    selectElement.innerHTML = ''; // Clear existing options
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
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

  function addToHistory(imageSrc, prompt) {
    const placeholder = historyImagesContainer.querySelector('.thumbnail.placeholder');
    if (placeholder) {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.title = prompt;
      img.classList.add('thumbnail');

      img.addEventListener('click', () => {
        generatedImage.src = imageSrc;
        generatedImage.title = prompt;
        updateMainImageBackground();
      });

      historyImagesContainer.replaceChild(img, placeholder);
    } else {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.title = prompt;
      img.classList.add('thumbnail');

      img.addEventListener('click', () => {
        generatedImage.src = imageSrc;
        generatedImage.title = prompt;
        updateMainImageBackground();
      });

      // Add the new image at the top of the history container
      historyImagesContainer.prepend(img);
    }
  }

  function randomizePromptMultipleTimes(times, interval, callback) {
    let count = 0;
    const randomizeInterval = setInterval(() => {
      randomizeSelection(animalSelect);
      randomizeSelection(colorSelect);
      randomizeSelection(personalitySelect);
      count++;
      if (count >= times) {
        clearInterval(randomizeInterval);
        if (callback) callback();
      }
    }, interval);
  }

  function resetGenerateButton() {
    generateButton.disabled = false;
    generateButton.textContent = 'Generate creature!';
    generateButton.style.backgroundColor = '';
    generateButton.style.cursor = 'pointer';
  }

  function getRandomMutedColor() {
    const colors = ['#b3b3b3', '#c0c0c0', '#cccccc', '#d3d3d3', '#d9d9d9'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

});
