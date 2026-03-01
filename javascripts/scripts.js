import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { RectAreaLightUniformsLib } from "RectAreaLightUniformsLib";

// Инициализируем библиотеку для RectAreaLight (если будете использовать)
RectAreaLightUniformsLib.init();

document.addEventListener("DOMContentLoaded", () => {
  initThree();
});

function initThree() {
  // Находим html-контейнер
  const model = document.querySelector(".threedCap");

  if (!model) {
    console.error("Элемент .threedCap не найден!");
    return;
  }

  // Создаём сцену
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ebebeb");

  // Создаём камеру
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1, // far plane лучше сделать меньше
    1000, // far plane лучше сделать больше
  );

  camera.position.set(2, 0.5, 2);

  // Создаём рендерер
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  model.appendChild(renderer.domElement);

  // Добавляем свет
  // 1. Ambient light
  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);

  // 2. Directional lights
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(-80, 1, 1);
  light1.lookAt(1, 1, 0);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(50, 100, 0);
  light2.lookAt(100, 100, 0);
  scene.add(light2);

  // Добавляем вспомогательную сетку для ориентации (удалите после отладки)
  const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
  scene.add(gridHelper);

  // Загружаем модель
  const loader = new GLTFLoader();

  console.log("Начинаем загрузку модели..."); // Отладочное сообщение

  loader.load(
    "./models/capsule.glb", // Путь к модели
    (gltf) => {
      // onLoad - успешная загрузка
      console.log("✅ Модель успешно загружена!", gltf);

      const loadedModel = gltf.scene;

      // Включаем тени для всех частей модели
      loadedModel.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // Масштабируем при необходимости
      // loadedModel.scale.set(2, 2, 2);

      scene.add(loadedModel);
      console.log("✅ Модель добавлена в сцену");
    },
    (progress) => {
      // onProgress - ход загрузки
      console.log(
        `Загрузка: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`,
      );
    },
    (error) => {
      // onError - ошибка загрузки
      console.error("❌ Ошибка загрузки модели:", error);
    },
  );

  // Управление моделью
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true; // Включите для отладки
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minAzimuthAngle = -0.1;
  controls.maxAzimuthAngle = Math.PI / 2;

  // Анимация
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Обработка изменения размера окна
  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
