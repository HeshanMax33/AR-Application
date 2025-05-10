// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to key elements
    const carModel = document.querySelector('#car-model');
    const exhaustEffect = document.querySelector('#exhaust-effect');
    const particleSystem = document.querySelector('#particle-system');
    const carMarker = document.querySelector('#car-marker');
    const carContainer = document.querySelector('#car-container');
    const infoElement = document.querySelector('#info');
    const loadingScreen = document.querySelector('#loading-screen');
    
    // Variables to track state
    let isRevving = false;
    let isExpanded = false;
    let autoRotate = true;
    let userInteracted = false;
    
    // Remove loading screen when everything is loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            // Check if device is mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                console.log('Mobile device detected');
            }
        }, 2000);
    });

    // Log when model is loaded or fails
    carModel.addEventListener('model-loaded', function() {
        console.log('Model loaded successfully!');
        
        // Show a success notification
        showNotification('Model loaded successfully!');
    });
    
    carModel.addEventListener('model-error', function(e) {
        console.error('Model failed to load:', e);
        // Show a more visible error message to the user
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.padding = '20px';
        errorMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        errorMessage.style.color = 'white';
        errorMessage.style.fontFamily = 'Arial, sans-serif';
        errorMessage.style.zIndex = '999';
        errorMessage.innerHTML = 'Failed to load 3D model.<br>Please check your connection and try again.';
        document.body.appendChild(errorMessage);
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    });
    
    // Add marker detection events
    carMarker.addEventListener('markerFound', function() {
        console.log('Marker detected!');
        // Show info text
        infoElement.style.display = 'block';
    });
    
    carMarker.addEventListener('markerLost', function() {
        console.log('Marker lost!');
        // Hide info text
        infoElement.style.display = 'none';
        
        // Stop sound if playing
        if (isRevving) {
            const sound = carModel.components.sound;
            if (sound && sound.isPlaying) {
                sound.pauseSound();
            }
            isRevving = false;
        }
        
        // Hide exhaust effect
        exhaustEffect.setAttribute('visible', false);
        particleSystem.setAttribute('visible', false);
        particleSystem.setAttribute('particle-system', 'enabled', false);
    });
    
    // Function to show notification
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.success-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'success-notification';
            document.body.appendChild(notification);
        }
        
        // Set notification message
        notification.textContent = message;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show-notification');
            setTimeout(() => {
                notification.classList.remove('show-notification');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }, 10);
    }
    
    // Add click interaction to car model
    carModel.addEventListener('click', function(event) {
        console.log('Car clicked!');
        
        // Prevent event bubbling
        if (event) {
            event.stopPropagation();
        }
        
        // Flag that user has interacted
        userInteracted = true;
        
        // Toggle exhaust effect visibility
        const isVisible = exhaustEffect.getAttribute('visible');
        exhaustEffect.setAttribute('visible', !isVisible);
        
        // Toggle particle system
        particleSystem.setAttribute('visible', !isVisible);
        particleSystem.setAttribute('particle-system', 'enabled', !isVisible);
        
        // Trigger pulse animation if showing
        if (!isVisible) {
            const sphere = exhaustEffect.querySelector('a-sphere');
            if (sphere) {
                sphere.emit('showEffect');
            }
        }
        
        // Toggle engine sound
        const sound = carModel.components.sound;
        if (sound) {
            if (!isRevving) {
                try {
                    sound.playSound();
                    showNotification('Engine started!');
                } catch (e) {
                    console.error('Failed to play sound:', e);
                    showNotification('Sound playback failed. Try tapping again.');
                }
            } else {
                try {
                    sound.pauseSound();
                    showNotification('Engine stopped!');
                } catch (e) {
                    console.error('Failed to pause sound:', e);
                }
            }
            isRevving = !isRevving;
        }
        
        // Toggle size on double-click (detect rapid successive clicks)
        const now = Date.now();
        if (!this.lastClick || (now - this.lastClick < 300)) {
            // Double-click detected
            if (!isExpanded) {
                carModel.setAttribute('scale', '1 1 1');
                showNotification('Model enlarged!');
            } else {
                carModel.setAttribute('scale', '0.5 0.5 0.5');
                showNotification('Model returned to normal size!');
            }
            isExpanded = !isExpanded;
        }
        this.lastClick = now;
    });
    
    // Add touch events for mobile compatibility
    carModel.addEventListener('touchstart', function(e) {
        // Prevent default behavior to avoid scrolling
        e.preventDefault();
        
        // Flag that user has interacted
        userInteracted = true;
    });
    
    // Optional: Add keyboard controls for testing on desktop
    document.addEventListener('keydown', function(e) {
        if (e.key === 'p' || e.key === 'P') {
            // Simulate clicking the car
            const clickEvent = new Event('click');
            carModel.dispatchEvent(clickEvent);
        } else if (e.key === 'r' || e.key === 'R') {
            // Toggle auto-rotation
            autoRotate = !autoRotate;
            if (autoRotate) {
                carModel.setAttribute('rotate-model', {speed: 1});
                showNotification('Auto-rotation enabled');
            } else {
                carModel.removeAttribute('rotate-model');
                showNotification('Auto-rotation disabled');
            }
        }
    });
});