// You can create a separate js/main.js file with this code
document.addEventListener('DOMContentLoaded', function() {
    console.log('AR application initializing...');
    
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
        alert('WebGL not supported. The AR experience may not work properly.');
        console.error('WebGL not supported');
    } else {
        console.log('WebGL supported');
    }
    
    // Check camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            console.log('Camera access granted');
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(function(error) {
            console.error('Camera access error:', error);
            alert('Camera access denied. Please enable camera permissions.');
        });
    
    // Function to verify model path
    function checkModelPath(path) {
        fetch(path)
            .then(response => {
                if (response.ok) {
                    console.log(`Model at ${path} is accessible`);
                } else {
                    console.error(`Model at ${path} returned ${response.status}`);
                    alert(`Cannot access model at ${path}. Status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error(`Error accessing model at ${path}:`, error);
                alert(`Cannot access model at ${path}. Error: ${error.message}`);
            });
    }
    
    // Check your model path
    checkModelPath('./assets/models/black_dragon_with_idle_animation.glb');
});