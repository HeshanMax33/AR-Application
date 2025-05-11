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
    const controlButtons = document.querySelector('#control-buttons');
    const rotateLeftBtn = document.querySelector('#rotate-left');
    const rotateRightBtn = document.querySelector('#rotate-right');
    const toggleAutoRotateBtn = document.querySelector('#toggle-auto-rotate');
    
    // Variables to track state
    let isRevving = false;
    let isExpanded = false;
    let autoRotate = true;
    let currentRotation = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Remove loading screen when everything is loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            showNotification("AR experience loaded successfully!");
        }, 2000);
    });

    // Log when model is loaded or fails
    carModel.addEventListener('model-loaded', function() {
        console.log('Model loaded successfully!');
        // Start auto-rotation
        carModel.emit('autoRotate');
    });
    
    carModel.addEventListener('model-error', function(e) {
        console.error('Model failed to load:', e);
        showError('Failed to load 3D model. Please check your connection and try again.');
    });
    
    // Add marker detection events
    carMarker.addEventListener('markerFound', function() {
        console.log('Marker detected!');
        // Show info text and controls
        infoElement.style.display = 'block';
        controlButtons.style.display = 'block';
        
        // Reset car position and animations when marker is found
        carContainer.setAttribute('position', '0 0.1 0');
        
        // Make sure the car is visible
        carModel.setAttribute('visible', true);
        
        // Add a subtle entrance animation
        carModel.setAttribute('animation__appear', {
            property: 'scale',
            from: '0.1 0.1 0.1',
            to: '0.5 0.5 0.5',
            dur: 800,
            easing: 'easeOutElastic'
        });
        
        // Resume auto-rotation if enabled
        if (autoRotate) {
            carModel.emit('autoRotate');
        }
    });
    
    carMarker.addEventListener('markerLost', function() {
        console.log('Marker lost!');
        // Hide info text and controls
        infoElement.style.display = 'none';
        controlButtons.style.display = 'none';
        
        // Pause auto-rotation
        carModel.emit('pauseRotate');
        
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
    
    // Button controls for rotation
    rotateLeftBtn.addEventListener('click', function() {
        // Pause auto-rotation
        autoRotate = false;
        carModel.emit('pauseRotate');
        
        // Manually rotate the model left
        currentRotation = (currentRotation - 30) % 360;
        carModel.setAttribute('rotation', `0 ${currentRotation} 0`);
        toggleAutoRotateBtn.textContent = "Auto ▶";
    });
    
    rotateRightBtn.addEventListener('click', function() {
        // Pause auto-rotation
        autoRotate = false;
        carModel.emit('pauseRotate');
        
        // Manually rotate the model right
        currentRotation = (currentRotation + 30) % 360;
        carModel.setAttribute('rotation', `0 ${currentRotation} 0`);
        toggleAutoRotateBtn.textContent = "Auto ▶";
    });
    
    toggleAutoRotateBtn.addEventListener('click', function() {
        autoRotate = !autoRotate;
        if (autoRotate) {
            carModel.emit('autoRotate');
            toggleAutoRotateBtn.textContent = "Auto ⏸";
        } else {
            carModel.emit('pauseRotate');
            toggleAutoRotateBtn.textContent = "Auto ▶";
        }
    });
    
    // Add touch swipe to rotate the model
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Check if marker is visible
        if (carMarker.object3D.visible) {
            // Calculate swipe distance
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                // Pause auto-rotation
                autoRotate = false;
                carModel.emit('pauseRotate');
                toggleAutoRotateBtn.textContent = "Auto ▶";
                
                // Rotate model based on swipe direction
                if (swipeDistance > 0) {
                    // Swipe right
                    currentRotation = (currentRotation + 15) % 360;
                } else {
                    // Swipe left
                    currentRotation = (currentRotation - 15) % 360;
                }
                
                carModel.setAttribute('rotation', `0 ${currentRotation} 0`);
            }
        }
    }
    
    // Add click interaction to car model
    carModel.addEventListener('click', function(event) {
        console.log('Car clicked!');
        
        // Prevent event bubbling
        event.stopPropagation();
        
        // Toggle exhaust effect visibility
        const isVisible = exhaustEffect.getAttribute('visible');
        exhaustEffect.setAttribute('visible', !isVisible);
        
        // Toggle particle system
        particleSystem.setAttribute('visible', !isVisible);
        particleSystem.setAttribute('particle-system', 'enabled', !isVisible);
        
        // Trigger pulse animation if showing
        if (!isVisible) {
            exhaustEffect.querySelector('a-sphere').emit('showEffect');
        }
        
        // Toggle engine sound
        const sound = carModel.components.sound;
        if (sound) {
            if (!isRevving) {
                sound.playSound();
                showNotification("Engine started!");
            } else {
                sound.pauseSound();
                showNotification("Engine stopped");
            }
            isRevving = !isRevving;
        }
        
        // Toggle size on double-click (detect rapid successive clicks)
        const now = Date.now();
        if (!this.lastClick || (now - this.lastClick < 300)) {
            // Double-click detected
            if (!isExpanded) {
                carModel.setAttribute('scale', '1 1 1');
                showNotification("Model enlarged");
            } else {
                carModel.setAttribute('scale', '0.5 0.5 0.5');
                showNotification("Model reduced");
            }
            isExpanded = !isExpanded;
        }
        this.lastClick = now;
    });
    
    // Add touch events for mobile compatibility
    carModel.addEventListener('touchstart', function(e) {
        // Prevent default behavior to avoid scrolling
        e.preventDefault();
        
        // Trigger click event
        const clickEvent = new Event('click');
        carModel.dispatchEvent(clickEvent);
    });
    
    // Optional: Add keyboard controls for testing on desktop
    document.addEventListener('keydown', function(e) {
        if (carMarker.object3D.visible) {
            if (e.key === 'p' || e.key === 'P') {
                // Simulate clicking the car
                const clickEvent = new Event('click');
                carModel.dispatchEvent(clickEvent);
            } else if (e.key === 'ArrowLeft') {
                // Rotate left
                autoRotate = false;
                carModel.emit('pauseRotate');
                currentRotation = (currentRotation - 15) % 360;
                carModel.setAttribute('rotation', `0 ${currentRotation} 0`);
                toggleAutoRotateBtn.textContent = "Auto ▶";
            } else if (e.key === 'ArrowRight') {
                // Rotate right
                autoRotate = false;
                carModel.emit('pauseRotate');
                currentRotation = (currentRotation + 15) % 360;
                carModel.setAttribute('rotation', `0 ${currentRotation} 0`);
                toggleAutoRotateBtn.textContent = "Auto ▶";
            } else if (e.key === 'a' || e.key === 'A') {
                // Toggle auto-rotation
                autoRotate = !autoRotate;
                if (autoRotate) {
                    carModel.emit('autoRotate');
                    toggleAutoRotateBtn.textContent = "Auto ⏸";
                } else {
                    carModel.emit('pauseRotate');
                    toggleAutoRotateBtn.textContent = "Auto ▶";
                }
            }
        }
    });
    
    // Helper function to show success notifications
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('success-notification');
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show-notification');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show-notification');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Helper function to show error messages
    function showError(message) {
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
        errorMessage.style.borderRadius = '5px';
        errorMessage.innerHTML = message;
        document.body.appendChild(errorMessage);
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                errorMessage.remove();
            }, 500);
        }, 5000);
    }
})