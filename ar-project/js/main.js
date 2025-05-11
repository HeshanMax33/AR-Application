document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const instructions = document.getElementById('instructions');
    const startButton = document.getElementById('startButton');
    const arScene = document.getElementById('arScene');
    const dragonMarker = document.getElementById('dragonMarker');
    const dragonModel = document.getElementById('dragonModel');
    const dragonRoar = document.getElementById('dragonRoar');
    
    let markerVisible = false;
    let resourcesLoaded = false;
    
    // Simulate loading resources (you could use actual asset loading events)
    simulateLoading();
    
    function simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            loadingProgress.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                resourcesLoaded = true;
                loadingScreen.style.display = 'none';
                instructions.style.display = 'flex';
            }
        }, 100);
    }
    
    // Start AR experience when button is clicked
    startButton.addEventListener('click', function() {
        if (resourcesLoaded) {
            instructions.style.display = 'none';
            arScene.style.display = 'block';
        }
    });
    
    // Marker detection events
    dragonMarker.addEventListener('markerFound', function() {
        markerVisible = true;
        console.log('Marker detected');
        
        // Play roar sound when marker is first detected
        if (!dragonRoar.played.length) {
            dragonRoar.play();
        }
        
        // Reset model position and animation
        dragonModel.setAttribute('position', '0 0 0');
        dragonModel.setAttribute('scale', '1 1 1');
        dragonModel.setAttribute('animation-mixer', 'clip: idle; loop: true');
    });
    
    dragonMarker.addEventListener('markerLost', function() {
        markerVisible = false;
        console.log('Marker lost');
    });
    
    // Add interactive features with keyboard (for testing)
    document.addEventListener('keydown', function(event) {
        if (!markerVisible) return;
        
        const currentScale = dragonModel.getAttribute('scale');
        const currentRotation = dragonModel.getAttribute('rotation');
        
        switch(event.key) {
            case 'ArrowUp':
                // Increase size
                dragonModel.setAttribute('scale', `${currentScale.x * 1.1} ${currentScale.y * 1.1} ${currentScale.z * 1.1}`);
                break;
            case 'ArrowDown':
                // Decrease size
                dragonModel.setAttribute('scale', `${currentScale.x * 0.9} ${currentScale.y * 0.9} ${currentScale.z * 0.9}`);
                break;
            case 'ArrowLeft':
                // Rotate left
                dragonModel.setAttribute('rotation', `${currentRotation.x} ${currentRotation.y - 10} ${currentRotation.z}`);
                break;
            case 'ArrowRight':
                // Rotate right
                dragonModel.setAttribute('rotation', `${currentRotation.x} ${currentRotation.y + 10} ${currentRotation.z}`);
                break;
            case 'r':
                // Play roar sound
                dragonRoar.currentTime = 0;
                dragonRoar.play();
                break;
        }
    });
    
    // Touch controls for mobile
    document.addEventListener('touchstart', function(event) {
        if (markerVisible) {
            dragonRoar.currentTime = 0;
            dragonRoar.play();
        }
    });
});