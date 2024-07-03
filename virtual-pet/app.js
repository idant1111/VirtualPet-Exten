document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('petCanvas');
    const ctx = canvas.getContext('2d');
    const counter = document.getElementById('counter');
    const petName = document.getElementById('petName');
    const changePetButton = document.getElementById('changePetButton');
    const changePetNameButton = document.getElementById('changePetNameButton');
    const resetButton = document.getElementById('resetButton');

    const petImages = ['pet1.png', 'pet2.png', 'pet3.png', 'pet4.png', 'pet5.png', 'pet6.png']; // Add paths to all pet images here
    let currentPetIndex = 0;

    let clickCount = 0;
    let petX = 100, petY = 240;
    let isDragging = false;
    let direction = 1; // 1 for right, -1 for left
    let petImage = new Image();
    let bgImage = new Image();

    bgImage.src = 'bg.png'; // Path to your background image
    petImage.src = petImages[currentPetIndex];

    // Load saved data
    chrome.storage.local.get(['currentPetIndex', 'petNameText', 'clickCount'], (data) => {
        if (data.currentPetIndex !== undefined) {
            currentPetIndex = data.currentPetIndex;
        }
        if (data.petNameText) {
            petName.textContent = data.petNameText;
        }
        if (data.clickCount !== undefined) {
            clickCount = data.clickCount;
            counter.textContent = `Clicks: ${clickCount}`;
        }
        loadPetImage();
    });

    function loadPetImage() {
        petImage.src = petImages[currentPetIndex];
        petImage.onload = () => {
            drawPet();
            animatePet();
        };
    }

    function animatePet() {
        setInterval(() => {
            // Slow down the random movement on x-axis
            let moveDistance = Math.random() * 3 - 1; // Random number between -1 and 1
            petX += moveDistance;

            // Check boundaries
            if (petX < 0) {
                petX = 0;
                direction = 1; // Move right
            } else if (petX > canvas.width) {
                petX = canvas.width;
                direction = -1; // Move left
            }

            // Flip the pet image based on direction
            direction = moveDistance > 0 ? 1 : -1;

            drawPet();

        }, 1000); // Increase the interval duration to 300 ms for slower movement
    }

    function drawPet() {
        // Draw background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // Draw pet
        ctx.save();
        if (direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(petImage, -petX - petImage.width / 2, petY - petImage.height / 2);
        } else {
            ctx.drawImage(petImage, petX - petImage.width / 2, petY - petImage.height / 2);
        }
        ctx.restore();
        petName.style.left = `${petX - petName.offsetWidth / 2}px`;
        petName.style.top = `${petY + petImage.height / 2 + 5}px`;
    }

    changePetButton.addEventListener('click', changePet);
    changePetNameButton.addEventListener('click', changePetName);
    resetButton.addEventListener('click', resetData);

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 2) {
            isDragging = true;
            canvas.style.cursor = 'grabbing';
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'default';
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            petX = event.clientX - canvas.offsetLeft;
            petY = event.clientY - canvas.offsetTop;
            drawPet();
        }
    });

    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    canvas.addEventListener('click', () => {
        clickCount++;
        counter.textContent = `Clicks: ${clickCount}`;
        chrome.storage.local.set({ clickCount });
        jumpTwice();
    });

    function jumpTwice() {
        let originalY = petY;
        let jumpHeight = 32;
        petY -= jumpHeight;
        drawPet();
        setTimeout(() => {
            petY = originalY;
            drawPet();
            setTimeout(() => {
                petY -= jumpHeight;
                drawPet();
                setTimeout(() => {
                    petY = originalY;
                    drawPet();
                }, 200);
            }, 200);
        }, 200);
    }

    function changePet() {
        currentPetIndex = (currentPetIndex + 1) % petImages.length;
        chrome.storage.local.set({ currentPetIndex });
        loadPetImage();
    }

    function changePetName() {
        const newName = prompt("Enter new pet name:");
        if (newName) {
            petName.textContent = newName;
            chrome.storage.local.set({ petNameText: newName });
        }
    }

    function resetData() {
        currentPetIndex = 0;
        clickCount = 0;
        petName.textContent = "Pet Name";
        counter.textContent = "Clicks: 0";
        petX = 100;
        petY = 250;
        chrome.storage.local.clear();
        loadPetImage();
    }
});
