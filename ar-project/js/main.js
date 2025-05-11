document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const instructions = document.getElementById('instructions');
    const startButton = document.getElementById('startButton');
    const arScene = document.getElementById('arScene');
    
    let resourcesLoaded = false;
    
    // Simulate loading resources
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
    
    // Wait for A-Frame to be initialized
    if (typeof AFRAME !== 'undefined') {
        // Register marker event components after AFRAME is available
        AFRAME.registerComponent('marker-handler', {
            init: function() {
                const marker = this.el;
                const dragonModel = document.getElementById('dragonModel');
                const dragonRoar = document.getElementById('dragon-roar');
                
                marker.addEventListener('markerFound', function() {
                    console.log('Marker detected');
                    
                    // Play roar sound
                    dragonRoar.play();
                    
                    // Add animation or effects
                    dragonModel.setAttribute('animation-mixer', {
                        clip: 'idle',
                        loop: 'repeat'
                    });
                });
                
                marker.addEventListener('markerLost', function() {
                    console.log('Marker lost');
                });
            }
        });
    } else {
        console.error('A-Frame not initialized correctly');
    }
});