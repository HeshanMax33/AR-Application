// main.js
document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const loadingScreen = document.getElementById('loading-screen');
    const instructions = document.getElementById('instructions');
    const closeInstructionsBtn = document.getElementById('close-instructions');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
    
    // Audio elements setup
    const dragonRoarSound = new Audio('assets/audio/dragon-roar.mp3');
    dragonRoarSound.volume = 0.7;
    let soundEnabled = true;
    
    // AR scene and markers
    const scene = document.querySelector('a-scene');
    const dragonMarker = document.getElementById('dragon-marker');
    const dragonModel = document.getElementById('dragon-model');
    const fireParticles = document.getElementById('fire-particles');
    
    // Hide loading screen when the scene is loaded
    scene.addEventListener('loaded', function () {
        loadingScreen.style.display = 'none';
    });
    
    // Close instructions
    closeInstructionsBtn.addEventListener('click', function() {
        instructions.style.display = 'none';
    });
    
    // Sound toggle
    soundToggleBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        soundToggleBtn.innerHTML = soundEnabled ? '🔊' : '🔇';
    });
    
    // Fullscreen toggle
    fullscreenToggleBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Marker detection events
    dragonMarker.addEventListener('markerFound', function() {
        console.log('Dragon marker found!');
        
        // Play sound when marker is found (if sound is enabled)
        if (soundEnabled) {
            dragonRoarSound.play();
        }
        
        // Add animation to the dragon
        dragonModel.setAttribute('animation', {
            property: 'scale',
            to: '1.2 1.2 1.2',
            dur: 1000,
            easing: 'easeOutElastic'
        });
        
        // Create fire particle effect
        createFireEffect();
    });
    
    dragonMarker.addEventListener('markerLost', function() {
        console.log('Dragon marker lost!');
        
        // Reset animations
        dragonModel.removeAttribute('animation');
        dragonModel.setAttribute('scale', '1 1 1');
        
        // Clear fire effect
        while (fireParticles.firstChild) {
            fireParticles.removeChild(fireParticles.firstChild);
        }
    });
    
    // Create fire particle effect function
    function createFireEffect() {
        // Create particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('color', '#ff4500');
            particle.setAttribute('radius', '0.05');
            particle.setAttribute('position', {
                x: (Math.random() * 0.2) - 0.1,
                y: 0,
                z: (Math.random() * 0.2) - 0.1
            });
            
            // Animate particles
            particle.setAttribute('animation', {
                property: 'position',
                to: `${(Math.random() * 0.4) - 0.2} 0.5 ${(Math.random() * 0.4) - 0.2}`,
                dur: 1000 + Math.random() * 1000,
                easing: 'easeOutQuad'
            });
            
            particle.setAttribute('animation__opacity', {
                property: 'opacity',
                from: '1',
                to: '0',
                dur: 1000 + Math.random() * 1000
            });
            
            // Add to fire particles entity
            fireParticles.appendChild(particle);
            
            // Remove after animation completes
            setTimeout(() => {
                if (particle.parentNode === fireParticles) {
                    fireParticles.removeChild(particle);
                }
            }, 2000);
        }
    }
    
    // Handle user interaction
    document.addEventListener('click', function(event) {
        if (dragonMarker.object3D.visible === true) {
            // Make the dragon rotate on click
            dragonModel.setAttribute('animation__rotate', {
                property: 'rotation',
                to: '0 360 0',
                dur: 2000,
                easing: 'linear'
            });
            
            // Play roar sound if enabled
            if (soundEnabled) {
                dragonRoarSound.currentTime = 0;
                dragonRoarSound.play();
            }
        }
    });
    
    // Add ambient background effect
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', '#445');
    ambientLight.setAttribute('intensity', '0.4');
    scene.appendChild(ambientLight);
    
    // Add directional light
    const directionalLight = document.createElement('a-light');
    directionalLight.setAttribute('type', 'directional');
    directionalLight.setAttribute('color', '#fff');
    directionalLight.setAttribute('intensity', '0.6');
    directionalLight.setAttribute('position', '-1 1 1');
    scene.appendChild(directionalLight);
    
    // Log that the application is ready
    console.log('Dragon Fantasy AR Experience is ready!');
});