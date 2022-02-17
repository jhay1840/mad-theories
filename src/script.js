import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import * as POSTPROCESSING from "postprocessing";

var rellax = new Rellax(".rellax");

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d0f);
// scene.background = new THREE.Color(0x06524e);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// -----------------------------------------------------------------------objects-----------------------------------------------

// New object sun
let circleGeo = new THREE.CircleGeometry(1.2, 32);
let circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
let circle = new THREE.Mesh(circleGeo, circleMat);
circle.position.set(0, 3, -3);
scene.add(circle);
// post processing for the sun
let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, circle, {
  resolutionScale: 1,
  density: 0.8,
  decay: 0.95,
  weight: 0.9,
  samples: 100,
});
let renderPass = new POSTPROCESSING.RenderPass(scene, camera);
let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);
effectPass.renderToScreen = true;
let composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(effectPass);
function animate() {
  composer.render(0.1);
  requestAnimationFrame(animate);
}

// New object planet
let planetGeo = new THREE.CircleGeometry(1.4, 32);
// const planetTexture = new THREE.TextureLoader().load(
//   "textures/dark_globe.jpg"
// );
let planetMat = new THREE.MeshBasicMaterial({
  // map: planetTexture,
  color: 0x0b0d0f,
  // color: 0x000000,
});
let planet = new THREE.Mesh(planetGeo, planetMat);
planet.position.set(0, 0.8, -2);
scene.add(planet);

// clouds
let cloudGeo,
  cloudMaterial,
  cloudParticles = [];
const action = () => {
  let loader = new THREE.TextureLoader();
  loader.load("textures/smoke-1.png", function (texture) {
    cloudGeo = new THREE.PlaneBufferGeometry(100, 100);
    cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      // color: 0x000000,
    });
    for (let p = 0; p < 100; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * (300 - 11) + 11,
        -66,
        Math.random() * (-150 - -400) + -400
      );

      cloud.rotation.z = Math.random() * 360;

      cloud.material.opacity = 0.55;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
    for (let p = 0; p < 50; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * (-119 - -243) + -243,
        -28,
        Math.random() * (-150 - -400) + -400
      );

      cloud.rotation.z = Math.random() * 2 * Math.PI;

      cloud.material.opacity = 0.55;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
    // gui.add(cloud.rotation, "y").min(-200).max(300);
    // gui.add(cloud.rotation, "x").min(-300).max(300);
    // gui.add(cloud.rotation, "z").min(-300).max(300);
  });
};
action();

// -----------------------------------------------------------------------objects end-----------------------------------------------

// Lights;
let ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);
scene.fog = new THREE.FogExp2(0x03544e, 0.001);
renderer.setClearColor(scene.fog.color);

let directionalLight = new THREE.DirectionalLight(0x1b1d1f);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);
// let orangeLight = new THREE.PointLight(0xcc6600, 50, 450, 1.7);
// orangeLight.position.set(200, 300, 100);
// scene.add(orangeLight);
// let redLight = new THREE.PointLight(0xd8547e, 50, 450, 1.7);
// redLight.position.set(100, 300, 100);
// scene.add(redLight);
// let blueLight = new THREE.PointLight(0x3677ac, 50, 450, 1.7);
// blueLight.position.set(300, 300, 200);
// scene.add(blueLight);

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

// directional light

// let directionalLight = new THREE.DirectionalLight(0xffccaa, 3);
// directionalLight.position.set(0, 0, -1);
// scene.add(directionalLight);

// Controls;
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

var mouseTolerance = 0.0001;
var mouseTolerance2 = 0.0003;
var mouseTolerance3 = 0.0008;

document.onmousemove = function (e) {
  var centerX = window.innerWidth * 0.5;
  var centerY = window.innerHeight * 0.5;

  planet.position.x = (e.clientX - centerX) * mouseTolerance2;
  planet.position.y = 0.8 + -1 * (e.clientY - centerY) * mouseTolerance3;
  circle.position.y = 3 + (e.clientY - centerY) * mouseTolerance3;

  circle.position.x = -1 * (e.clientX - centerX) * mouseTolerance;
};

gui.add(camera.position, "y").min(-5).max(10);
gui.add(camera.position, "x").min(-5).max(10);
window.addEventListener("wheel", onMouseWheel);
let y = 0;
let position = 0;
function onMouseWheel(event) {
  y = -1 * (event.deltaY * 0.0007);
}
/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  let delta = clock.getDelta();
  // Update objects
  // planet.rotation.y = 0.03 * elapsedTime;

  position += y;
  y *= 0.9;

  if (position < 0) {
    camera.position.y = position;
  } else {
    position = 0;
  }
  if (position <= -2) {
    position = -2;
  }
  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.001;
  });
  // console.log(planetPos);

  // if (planetPos > 2 && planetPos < 2.8) {
  //   planetPos += 0.007;
  // } else if (planetPos > 2.8) {
  //   planetPos += 0.0005;
  // } else {
  //   planetPos += 0.0005;
  // }

  // if (planetPos > 4.4) {
  //   planetPos = 0.3;
  // }
  // planet.position.y = planetPos;

  // Update Orbital Controls
  // controls.update();

  // Render
  composer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// jquery
$(document).on("mousemove", function (e) {
  const x = ($(window).innerWidth() - e.pageX) / 100;
  const y = ($(window).innerHeight() - e.pageY - 3000) / 100;
  $(".parallax").css({ transform: "translate(" + x + "px, " + y + "px)" });
});
