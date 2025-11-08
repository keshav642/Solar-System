        // Scene, Camera, Renderer setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        // Camera position
        camera.position.set(0, 100, 200);
        camera.lookAt(0, 0, 0);
        
        // Stars background
        function createStars() {
            const starsGeometry = new THREE.BufferGeometry();
            const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
            
            const starsVertices = [];
            for (let i = 0; i < 10000; i++) {
                const x = (Math.random() - 0.5) * 4000;
                const y = (Math.random() - 0.5) * 4000;
                const z = (Math.random() - 0.5) * 4000;
                starsVertices.push(x, y, z);
            }
            
            starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
            const stars = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(stars);
        }
        createStars();
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
        scene.add(pointLight);
        
        // Planet creation function
        function createPlanet(size, color, distance, name, rotationSpeed, orbitSpeed) {
           
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: color,
                emissive: name === "Sun" ? color : 0x000000,
                emissiveIntensity: name === "Sun" ? 0.5 : 0
            });
            const planet = new THREE.Mesh(geometry, material);
            
           
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitPoints = [];
            for (let i = 0; i <= 64; i++) {
                const angle = (i / 64) * Math.PI * 2;
                orbitPoints.push(
                    Math.cos(angle) * distance,
                    0,
                    Math.sin(angle) * distance
                );
            }
            orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            
            if (name !== "Sun") {
                scene.add(orbitLine);
            }
            
            return {
                mesh: planet,
                distance: distance,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: rotationSpeed,
                orbitSpeed: orbitSpeed,
                name: name,
                orbitLine: orbitLine
            };
        }
        
        
        const sun = createPlanet(20, 0xfdb813, 0, "Sun", 0.001, 0);
        scene.add(sun.mesh);
        
        const planets = [
            createPlanet(3, 0x8c7853, 40, "Mercury", 0.01, 0.04),
            createPlanet(6, 0xffc649, 60, "Venus", 0.008, 0.015),
            createPlanet(6.5, 0x0077be, 80, "Earth", 0.01, 0.01),
            createPlanet(4, 0xff6347, 100, "Mars", 0.009, 0.008),
            createPlanet(15, 0xdaa520, 140, "Jupiter", 0.012, 0.004),
            createPlanet(13, 0xffd700, 180, "Saturn", 0.01, 0.003),
            createPlanet(9, 0x4fd0e7, 220, "Uranus", 0.007, 0.002),
            createPlanet(8, 0x4169e1, 260, "Neptune", 0.006, 0.001)
        ];
        
        planets.forEach(planet => scene.add(planet.mesh));
        
     
        const saturnRingGeometry = new THREE.RingGeometry(16, 24, 32);
        const saturnRingMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffd700, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
        saturnRing.rotation.x = Math.PI / 2;
        planets[4].mesh.add(saturnRing); 
        
       
        let speedMultiplier = 1;

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                camera.position.x += deltaX * 0.5;
                camera.position.y -= deltaY * 0.5;
                camera.lookAt(0, 0, 0);
                
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        
        renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 5;
            camera.position.z += e.deltaY * zoomSpeed * 0.01;
            camera.position.z = Math.max(50, Math.min(500, camera.position.z));
        });
        
       
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        renderer.domElement.addEventListener('click', (e) => {
            if (isDragging) return;
            
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            
            const allPlanets = [sun, ...planets];
            const intersects = raycaster.intersectObjects(allPlanets.map(p => p.mesh));
            
            if (intersects.length > 0) {
                const clickedPlanet = allPlanets.find(p => p.mesh === intersects[0].object);
                document.getElementById('planetInfo').textContent = `Selected: ${clickedPlanet.name}`;
            }
        });
        
      
        document.getElementById('speedUp').addEventListener('click', () => {
            speedMultiplier *= 2;
            speedMultiplier = Math.min(speedMultiplier, 16);
        });
        
        document.getElementById('speedDown').addEventListener('click', () => {
            speedMultiplier /= 2;
            speedMultiplier = Math.max(speedMultiplier, 0.25);
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            camera.position.set(0, 100, 200);
            camera.lookAt(0, 0, 0);
            speedMultiplier = 1;
        });
        
   
        function animate() {
            requestAnimationFrame(animate);
            
           
            sun.mesh.rotation.y += sun.rotationSpeed * speedMultiplier;
            
     
            planets.forEach(planet => {
                
                planet.angle += planet.orbitSpeed * speedMultiplier;
                planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
                planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
                
              
                planet.mesh.rotation.y += planet.rotationSpeed * speedMultiplier;
            });
            
            renderer.render(scene, camera);
        }
        
        animate();
        
      
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    