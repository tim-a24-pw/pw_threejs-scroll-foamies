import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Experience {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.canvas = document.querySelector('.webgl');
    this.gltfLoader = new GLTFLoader();
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    window.addEventListener('resize', this.resize.bind(this));
    const observer = new IntersectionObserver(this.observe.bind(this), {
      rootMargin: '-45% 0px',
    });

    this.createCamera();
    this.createLights();
    this.createObjects();
    this.createRenderer();
    this.animate();

    const experiences = document.querySelectorAll('.js-experience');
    for (let i = 0; i < experiences.length; i++) {
      const element = experiences[i];
      observer.observe(element);
    }
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height
    );
    this.camera.position.z = 8;
    this.scene.add(this.camera);
  }

  createLights() {
    const ambiantLight = new THREE.AmbientLight('#ffffff', 0.8);
    this.scene.add(ambiantLight);

    const directionalLight = new THREE.DirectionalLight('#ffffff', 4);
    directionalLight.position.set(1, 2, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.render(this.scene, this.camera);
  }

  createObjects() {
    const geometry = new THREE.BoxGeometry(2, 2, 2, 2);
    const material = new THREE.MeshMatcapMaterial({
      color: '#ff0000',
    });
    this.cube = new THREE.Mesh(geometry, material); // on applique la forme et le materiel pour faire un mesh
    this.cube.position.x = 2;
    // this.scene.add(this.cube);

    this.gltfLoader.load('assets/models/ac/scene.gltf', (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(0.005, 0.005, 0.005);
      this.model.rotation.x = 1.5;
      this.scene.add(this.model);
    });
  }

  resize() {
    // Update sizes
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);

    this.cube.rotation.y = 0.5 * elapsedTime;

    window.requestAnimationFrame(this.animate.bind(this));
  }

  observe(entries) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const target = entry.target;

      if (entry.isIntersecting && this.model) {
        gsap.to(this.model.position, {
          duration: 0.5,
          ease: 'power2.inOut',
          x: target.dataset.p,
        });

        gsap.to(this.model.rotation, {
          duration: 0.5,
          ease: 'power2.inOut',
          x: target.dataset.rX,
          y: target.dataset.rY,
          z: target.dataset.rZ,
        });

        const cameraZ = 'cZ' in target.dataset ? target.dataset.cZ : 8;
        gsap.to(this.camera.position, {
          duration: 0.5,
          ease: 'power2.inOut',
          z: cameraZ,
        });
      }
    }
  }
}
