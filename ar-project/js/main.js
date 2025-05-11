// Main AR application script
let scene, camera, renderer, arToolkitSource, arToolkitContext;
let dragonModel, mixer, clock;
let isModelLoaded = false;
let lastPlayedTime = 0;
let particlesActive = false;
let particleSystem;

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the AR experience
    initialize();
});

function initialize() {
    // Create the clock for animations
    clock = new THREE.Clock();
    
    // Create the Three.js scene
    scene = new THREE.Scene();
    
    // Create the camera
    camera = new THREE.Camera();
    scene.add(camera);
    
    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);
    
    // Create and configure AR source (the camera feed)
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });
    
    // Handle window resize
    arToolkitSource.init(() => {
        setTimeout(() => {
            onResize();
        }, 1000);
    });
    
    // Handle window resize event
    window.addEventListener('resize', () => {
        onResize();
    });
    
    // Create and configure AR context
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 30,
        canvasWidth: 640,
        canvasHeight: 480,
    });
    
    // Initialize AR context
    arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
    
    // Create AR marker controls
    const markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
        type: 'pattern',
        patternUrl: 'assets/markers/marker1.patt',
        changeMatrixMode: 'cameraTransformMatrix'
    });
    
    // Create a group to hold our model
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);
    
    // Add lighting to the scene
    addLights();
    
    // Load the 3D dragon model
    loadDragonModel(markerRoot);
    
    // Start animation loop
    animate();
}

function addLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);
    
    // Add point light (fire-like glow for dragon)
    const pointLight = new THREE.PointLight(0xff7700, 1, 10);
    pointLight.position.set(0, 0.5, 0);
    scene.add(pointLight);
}

function loadDragonModel(group) {
    // Load the GLB model using GLTFLoader
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        // Resource URL
        'assets/models/black_dragon_with_idle_animation.glb',
        
        // Called when the resource is loaded
        (gltf) => {
            dragonModel = gltf.scene;
            
            // Scale and position the model appropriately
            dragonModel.scale.set(0.05, 0.05, 0.05);
            dragonModel.position.set(0, 0, 0);
            dragonModel.rotation.x = -Math.PI/2;
            
            // Add the model to the marker group
            group.add(dragonModel);
            
            // Set up animations if they exist
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(dragonModel);
                
                // Play idle animation
                const idleAnimation = mixer.clipAction(gltf.animations[0]);
                idleAnimation.play();
            }
            
            isModelLoaded = true;
            
            // Hide loading screen
            document.getElementById('loading').style.opacity = 0;
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 500);
            
            // Setup interaction
            setupInteraction(group);
        },
        
        // Called while loading is progressing
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        
        // Called when loading has errors
        (error) => {
            console.error('An error happened while loading the model:', error);
        }
    );
}

function setupInteraction(group) {
    // Create fire particle system
    setupParticles(group);
    
    // Add event listener for model visibility
    document.addEventListener('markerFound', () => {
        // Model is visible, play roar sound if it hasn't played recently
        const currentTime = Date.now();
        if (currentTime - lastPlayedTime > 5000) { // Only play every 5 seconds
            playDragonRoar();
            lastPlayedTime = currentTime;
            
            // Activate particles
            particlesActive = true;
            setTimeout(() => {
                particlesActive = false;
            }, 2000);
        }
    });
    
    document.addEventListener('markerLost', () => {
        // Model is no longer visible
        particlesActive = false;
    });
}

function setupParticles(group) {
    // Create particle material
    const particleTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAABMpJREFUWMO1l2uMXVUVx39rn3PPuXfuTGfamZZOS6FQCgWkCBQQg4CJCiHRQIwPoolfTKM+wEQ/+EETjbFEjR/QoAYTDQTQlEfiIwpIwQgUaAOFlkLb6WOmc6czd+bO6557zlk+zIxUoTPTx/6079l7r99ee+211xZVfQjYCyMBCmDAHP+t5X8PjSFzX1DVu1X1dlVdp6orRGSBiASAACoa/yqqRpUkSYJkMuKmm276gqrep6p3q+ptqnqtqs5NptPOGGNUZPYvEJmzrz5e8kEUU0RAQFW/LiIXWmvP894fr5VKYx4IU6mMTSbTERD4dLrf++bYpP/KxcAUkMwEFVVFEKgdS3iqBrzzfqKvz4wYYw4opT1a+gGJsEJMesR3HeqZ+Of4vmLvFQBKqdSAc+n+eDLfHU04i9gVQCJQYU+g1CL/Z1i2egxQbQR0Pm/0aw6JExCB3FSdOG/HRXimxSqqVcnvHZHxI3sCGXy7bG95sN2O7Ys6VixoW3AoqoAWnWXnSvOX33XJZuMHQ1XrN9lLTnjgnY8ZH9mHpW/STa/sMNt2XbKgULDzgZWtcQJAoVjS0o69fmLiIJnD0FgTx+fXA6mglgKpD4Fgf3iy+63KxC4yfwAmYPvOC1dOlczqYjFTalUPnP4pGWNCKLzrJHhP1DkvaI3VdqC2HrVXAp3SWmh3AzuDE4U9qH0dCNi6fUW2WGTt6LB0tUoEZ5+CdCabS+UGB6w/eAgJXJuKBSKnzwuEJ4DzQZ2AAfUC9bZwtFDd4SZ2p8wPz9XJicB0bVtPQTj7FHR25jLZbCZr0bHXQMJzgRTMuE+9gNQB7Qc6QJ2AlYZ6/A92Yvs8MzkWsr0fdHsKAM4+BZnOdDqdcXkVPUQsfxJSbw1oVqADtR2onod4ByAiFtCJbLGzf2TTR9MTO/P0bT1QKlULrdbBZ0yBtaRci40ww83UCYGAJSJXgXpAQVNomEbdGCIh6iOIShAN2N7e2vvt7dnxI4UpJt7f1TMDFpYuPtDaVo+zTs2idfOMxIuA80DDRrETsJZYw+Z/RUPUj6Nuj9DfjRyeTnLPJwbeKqaDXOLW9RxM5VLDrRLBGQpiIXDOWnRi04VEzg1VsKjE2FBRqaImwkxVscEkE4f2kB8dNwdfzWSf+02+p1hcMFBojKLVynjaA0IpHUJbV7eYqR2fJkjdo5oETQwUMNsrYDKIT6JuAj3ySvTwS/X0Cy+4bCaTLuQLfXpGFMy6DR11A+nxsRtJHXsSTawANDq0FhPtI/XeK6l8KeifHJ3qnZyM92dH41S5mDwZN6CnM+fEfBo8Xdy/n/qxgwTjn0HcMLAEKAM7IJMpMfDO6NSePUdPFPg5iGcGXE+DMIuCnw2SyWTCTMZkgWvEp28zkV0h0IFIJyrOQP0Y/sjr0fArL6dSP9mwc6c/2Y6hVY7n/jDaY32HsZZbRbhcRJaLyHwRyQNRsplgqliMH/BVe8hNoQhnn4JWrz7+MMIc7+K6ZlEwS+BnfvWsgHnGNdBJ5DmK58w3K5jDTsWzPkxOKlZVXwTGaCCCgTk2cTrtSXwY/wabZskSfB+j0wAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wMS0yM1QxNDo0MDo0NSswMDowMDa7v7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDEtMjNUMTQ6NDA6NDUrMDA6MDBn5gcJAAAAAElFTkSuQmCC');
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff5500,
        size: 0.1,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create particle geometry
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 0.2;
        particlePositions[i3 + 1] = (Math.random()) * 0.5;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Create particle system
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.position.set(0, 0.5, 0);
    particleSystem.visible = false;
    
    group.add(particleSystem);
}

function updateParticles() {
    if (!particleSystem) return;
    
    particleSystem.visible = particlesActive;
    
    if (particlesActive) {
        // Animate particles
        const positions = particleSystem.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Move particle upward
            positions[i3 + 1] += 0.01;
            
            // Reset particle if it goes too high
            if (positions[i3 + 1] > 1) {
                positions[i3] = (Math.random() - 0.5) * 0.2;
                positions[i3 + 1] = 0;
                positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
            }
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
}

function playDragonRoar() {
    // Play dragon roar sound effect
    const audio = document.getElementById('dragonRoar');
    audio.currentTime = 0;
    audio.play();
}

function onResize() {
    // Update AR source dimensions
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update AR toolkit
    if (arToolkitSource.ready) {
        arToolkitContext.update(arToolkitSource.domElement);
    }
    
    // Update animation mixer
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    
    // Update particle effects
    updateParticles();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Helper to create AR marker pattern
function createMarkerPattern() {
    // This function would generate a marker pattern file based on the provided image
    // In a real application, you would use an AR.js marker generator tool
    console.log("This is a placeholder for marker generation.");
}