// Wait for everything to load
window.addEventListener('load', function() {
    // Reference to DOM elements
    const loadingScreen = document.getElementById('loadingScreen');
    const soundToggle = document.getElementById('soundToggle');
    const rotateModelBtn = document.getElementById('rotateModel');
    const scaleUpBtn = document.getElementById('scaleUp');
    const scaleDownBtn = document.getElementById('scaleDown');
    const dragonMarker = document.getElementById('dragonMarker');
    const scene = document.querySelector('a-scene');
    
    // Model attributes
    let modelRotating = false;
    let soundEnabled = true;
    let modelScale = 0.5;
    let markerVisible = false;
    
    // Create marker detected notification
    const markerDetectedMsg = document.createElement('div');
    markerDetectedMsg.className = 'marker-detected';
    markerDetectedMsg.textContent = 'Dragon Detected!';
    document.body.appendChild(markerDetectedMsg);
    
    // Hide loading screen when scene loaded
    scene.addEventListener('loaded', function() {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    });
    
    // Setup the dragon model
    const dragonEntity = document.getElementById('dragonModel');
    dragonEntity.setAttribute('gltf-model', 'assets/models/black_dragon_with_idle_animation.glb');
    
    // Create particle system for fire breath effect
    const particleSystem = document.createElement('a-entity');
    particleSystem.setAttribute('particle-system', {
        preset: 'fire',
        particleCount: 100,
        size: 0.5,
        color: '#ff3300',
        opacity: 0.7,
        maxAge: 1
    });
    particleSystem.setAttribute('position', '0 0.5 0.5');
    particleSystem.setAttribute('scale', '0.2 0.2 0.2');
    particleSystem.setAttribute('visible', 'false');
    dragonEntity.appendChild(particleSystem);
    
    // Marker events
    dragonMarker.addEventListener('markerFound', function() {
        markerVisible = true;
        dragonEntity.setAttribute('visible', 'true');
        dragonMarker.appendChild(dragonEntity);
        
        // Show marker detected message
        markerDetectedMsg.classList.add('visible');
        setTimeout(() => {
            markerDetectedMsg.classList.remove('visible');
        }, 2000);
        
        // Play roar sound if enabled
        if (soundEnabled) {
            const roarSound = document.getElementById('roarSound');
            roarSound.components.sound.playSound();
            
            // Activate fire particles briefly
            particleSystem.setAttribute('visible', 'true');
            setTimeout(() => {
                particleSystem.setAttribute('visible', 'false');
            }, 2000);
        }
    });
    
    dragonMarker.addEventListener('markerLost', function() {
        markerVisible = false;
        dragonEntity.setAttribute('visible', 'false');
    });
    
    // Control buttons functionality
    soundToggle.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    });
    
    rotateModelBtn.addEventListener('click', function() {
        modelRotating = !modelRotating;
        if (modelRotating) {
            dragonEntity.setAttribute('animation__rotate', {
                property: 'rotation',
                to: '0 360 0',
                dur: 5000,
                easing: 'linear',
                loop: true
            });
        } else {
            dragonEntity.removeAttribute('animation__rotate');
            dragonEntity.setAttribute('rotation', '0 0 0');
        }
    });
    
    scaleUpBtn.addEventListener('click', function() {
        if (modelScale < 1.5) {
            modelScale += 0.1;
            dragonEntity.setAttribute('scale', `${modelScale} ${modelScale} ${modelScale}`);
        }
    });
    
    scaleDownBtn.addEventListener('click', function() {
        if (modelScale > 0.2) {
            modelScale -= 0.1;
            dragonEntity.setAttribute('scale', `${modelScale} ${modelScale} ${modelScale}`);
        }
    });
    
    // Tap on model to trigger roar and fire
    dragonEntity.addEventListener('click', function() {
        if (markerVisible && soundEnabled) {
            const roarSound = document.getElementById('roarSound');
            roarSound.components.sound.playSound();
            
            // Show fire breath effect
            particleSystem.setAttribute('visible', 'true');
            setTimeout(() => {
                particleSystem.setAttribute('visible', 'false');
            }, 2000);
        }
    });
    
    // Create and add a simple instruction panel
    const instructionPanel = document.createElement('div');
    instructionPanel.style.position = 'fixed';
    instructionPanel.style.top = '10px';
    instructionPanel.style.left = '10px';
    instructionPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
    instructionPanel.style.color = 'white';
    instructionPanel.style.padding = '10px';
    instructionPanel.style.borderRadius = '5px';
    instructionPanel.style.maxWidth = '300px';
    instructionPanel.style.zIndex = '100';
    instructionPanel.innerHTML = `
        <h3>Dragon AR Controls:</h3>
        <p>🔊/🔇: Toggle sound</p>
        <p>🔄: Rotate dragon</p>
        <p>➕: Increase size</p>
        <p>➖: Decrease size</p>
        <p>Tap on dragon for special effect!</p>
    `;
    document.body.appendChild(instructionPanel);
    
    // Add help button to toggle instructions
    const helpButton = document.createElement('button');
    helpButton.textContent = '?';
    helpButton.className = 'control-btn';
    helpButton.style.position = 'fixed';
    helpButton.style.top = '10px';
    helpButton.style.right = '10px';
    
    let instructionsVisible = true;
    helpButton.addEventListener('click', function() {
        instructionsVisible = !instructionsVisible;
        instructionPanel.style.display = instructionsVisible ? 'block' : 'none';
    });
    
    document.body.appendChild(helpButton);
});