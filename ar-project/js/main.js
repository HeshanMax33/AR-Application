// Main AR application script
document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const loadingScreen = document.getElementById('loading');
    const dragonRoar = document.getElementById('dragonRoar');
    let lastPlayedTime = 0;
    
    // Create instructions element
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.innerHTML = '<p>Point your camera at the dragon marker to see the magic!</p>';
    instructions.style.display = 'none';
    document.body.appendChild(instructions);
    
    // Wait for model to load before hiding the loading screen
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', () => {
        console.log('A-Frame scene loaded');
        
        // Hide loading screen after a short delay to ensure everything is ready
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                instructions.style.display = 'block';
            }, 500);
        }, 2000);
    });
    
    // Handle marker detection events
    const dragonMarker = document.getElementById('dragon-marker');
    const fireParticles = document.getElementById('fire-particles');
    
    dragonMarker.addEventListener('markerFound', () => {
        console.log('Dragon marker found');
        instructions.style.display = 'none';
        
        // Play dragon roar sound if it hasn't played recently
        const currentTime = Date.now();
        if (currentTime - lastPlayedTime > 5000) { // Only play every 5 seconds
            playDragonRoar();
            lastPlayedTime = currentTime;
            
            // Show fire particles
            fireParticles.setAttribute('visible', 'true');
            
            // Hide particles after a short time
            setTimeout(() => {
                fireParticles.setAttribute('visible', 'false');
            }, 3000);
        }
    });
    
    dragonMarker.addEventListener('markerLost', () => {
        console.log('Dragon marker lost');
        instructions.style.display = 'block';
        
        // Hide fire particles
        fireParticles.setAttribute('visible', 'false');
    });
    
    // Add a custom AR overlay to show when dragon is active
    const arOverlay = document.createElement('div');
    arOverlay.className = 'ar-overlay';
    arOverlay.style.display = 'none';
    arOverlay.innerHTML = '<p>🔥 Dragon activated! 🔥</p>';
    document.body.appendChild(arOverlay);
    
    // Show/hide overlay based on marker detection
    dragonMarker.addEventListener('markerFound', () => {
        arOverlay.style.display = 'block';
    });
    
    dragonMarker.addEventListener('markerLost', () => {
        arOverlay.style.display = 'none';
    });
});

// Function to play dragon roar sound
function playDragonRoar() {
    const audio = document.getElementById('dragonRoar');
    
    // Reset audio to beginning
    audio.currentTime = 0;
    
    // Play the sound
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        
        // User interaction might be required for audio to play
        document.addEventListener('click', () => {
            audio.play().catch(e => console.error('Error playing audio after user interaction:', e));
        }, { once: true });
    });
}

// Fix for iOS devices
window.addEventListener('click', () => {
    // iOS requires user interaction to play audio
    const audio = document.getElementById('dragonRoar');
    audio.load();
}, { once: true });

// Add debugging information
console.log('Dragon World AR application initialized');
console.log('Waiting for marker detection...');