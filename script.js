const animals = ['bee', 'crocodile', 'dog', 'jellyfish', 'koala', 'panda', 'scorpion', 'tiger'];
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'grey', 'brown'];
const personalities = ['loyal', 'courageous', 'free-spirited', 'majestic', 'wise', 'energetic', 'curious', 'icy', 'fiery', 'psychic', 'degen', 'fairy', 'fighting', 'techno'];

document.addEventListener('DOMContentLoaded', () => {
  const animalSelect = document.getElementById('animal-select');
  const colorSelect = document.getElementById('color-select');
  const personalitySelect = document.getElementById('personality-select');
  const form = document.getElementById('prompt-form');
  const generatedImage = document.getElementById('generated-image');
  const historyImagesContainer = document.getElementById('history-images');

  // Populate dropdowns
  populateDropdown(animalSelect, animals);
  populateDropdown(colorSelect, colors);
  populateDropdown(personalitySelect, personalities);

  // Randomize selections on page load
  randomizeSelection(animalSelect);
  randomizeSelection(colorSelect);
  randomizeSelection(personalitySelect);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const animal = animalSelect.value;
    const color = colorSelect.value;
    const personality = personalitySelect.value;

    // Send request to API
    try {
      const response = await fetch(`https://creatures-api.sogni.ai/?animal=${animal}&color=${color}&personality=${personality}`);
      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData.errors));
        return;
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Display the generated image
      if (generatedImage.src) {
        addToHistory(generatedImage.src);
      }
      generatedImage.src = imageUrl;
    } catch (error) {
      console.error('Error:', error);
    }
  });

  function populateDropdown(selectElement, options) {
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

  function addToHistory(imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;

    // Add click event to enlarge the image
    img.addEventListener('click', () => {
      generatedImage.src = imageSrc;
    });

    historyImagesContainer.prepend(img);

    // Limit history to 3 images
    if (historyImagesContainer.children.length > 3) {
      historyImagesContainer.removeChild(historyImagesContainer.lastChild);
    }
  }
});
