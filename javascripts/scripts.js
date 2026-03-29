krutilka();

import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { RectAreaLightUniformsLib } from "RectAreaLightUniformsLib";

// Глобальная переменная для хранения загруженной модели
let currentModel = null;

// Инициализируем библиотеку для RectAreaLight
RectAreaLightUniformsLib.init();

// Запускаем после загрузки страницы
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
  scene.background = new THREE.Color("#ffffff");

  // Создаём камеру
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  camera.position.set(2, 0.5, 2);

  // Создаём рендерер
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  model.appendChild(renderer.domElement);

  // Добавляем свет
  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);

  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(-50, -50, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 4);
  light2.position.set(50, 100, 0);
  scene.add(light2);

  // Загружаем модель
  const loader = new GLTFLoader();

  loader.load(
    "./models/capsule.glb",
    (gltf) => {
      currentModel = gltf.scene; // ← СОХРАНЯЕМ В ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ
      currentModel.scale.set(0.15, 0.15, 0.15);
      scene.add(currentModel);
    },
    (progress) => {},
    (error) => {
      console.error("❌ Ошибка загрузки модели:", error);
    },
  );

  // Управление моделью
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;

  // Функция для форматирования радиан в градусы с минутами и секундами
  function formatAngle(radians) {
    // Преобразуем радианы в градусы
    let degrees = radians * (180 / Math.PI);

    // Нормализуем в диапазон 0-360
    degrees = ((degrees % 360) + 360) % 360;

    // Получаем градусы, минуты, секунды
    const deg = Math.floor(degrees);
    const minutesTotal = (degrees - deg) * 60;
    const min = Math.floor(minutesTotal);
    const sec = Math.floor((minutesTotal - min) * 60);
    const hundredths = Math.floor(((minutesTotal - min) * 60 - sec) * 100);

    // Форматируем с ведущими нулями
    return `${deg.toString().padStart(2, "0")}∘${min.toString().padStart(2, "0")}′${sec.toString().padStart(2, "0")}′′${hundredths.toString().padStart(2, "0")}`;
  }

  // Функция обновления цифр на странице
  function updateRotationDisplay() {
    if (!currentModel) return;

    // Получаем углы поворота модели в радианах
    const rotationXRad = currentModel.rotation.x;
    const rotationYRad = currentModel.rotation.y;

    // Форматируем
    const formattedX = formatAngle(rotationXRad);
    const formattedY = formatAngle(rotationYRad);

    // Обновляем HTML элементы
    const rotXElem = document.getElementById("rotationX");
    const rotYElem = document.getElementById("rotationY");

    if (rotXElem) rotXElem.textContent = formattedX;
    if (rotYElem) rotYElem.textContent = formattedY;
  }
  // Функция обновления цифр на странице
  // Функция обновления цифр на странице
  function updateRotationDisplay() {
    if (!currentModel) return;

    // Вычисляем углы камеры относительно центра модели
    const dx = camera.position.x;
    const dy = camera.position.y;
    const dz = camera.position.z;

    // Горизонтальный угол (азимут) в градусах
    let azimuth = Math.atan2(dz, dx) * (180 / Math.PI);
    // Вертикальный угол (полярный) в градусах
    let polar =
      Math.asin(dy / Math.sqrt(dx * dx + dy * dy + dz * dz)) * (180 / Math.PI);

    // Нормализуем
    azimuth = ((azimuth % 360) + 360) % 360;
    polar = ((polar % 360) + 360) % 360;

    // Форматируем
    const formattedX = formatAngle((polar * Math.PI) / 180);
    const formattedY = formatAngle((azimuth * Math.PI) / 180);

    // Обновляем HTML элементы
    const rotXElem = document.getElementById("rotationX");
    const rotYElem = document.getElementById("rotationY");

    if (rotXElem) rotXElem.textContent = formattedX;
    if (rotYElem) rotYElem.textContent = formattedY;

    console.log(`Азимут: ${formattedY}, Полярный: ${formattedX}`);
  }
  // Анимация
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // Обновляем отображение углов поворота
    updateRotationDisplay();
  }
  animate();
  // Функция корректировки камеры и масштаба
  function adjustCameraToContainer() {
    if (!currentModel || !camera || !controls) return;

    const container = document.querySelector(".threedCap");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const containerWidth = containerRect.width;

    if (containerHeight === 0 || containerWidth === 0) return;

    // Базовая высота контейнера (в пикселях) - подберите под вашу модель
    const baseHeight = 500;

    // Рассчитываем коэффициент масштабирования относительно высоты
    let scaleFactor = containerHeight / baseHeight;
    // Ограничиваем коэффициент, чтобы модель не стала слишком маленькой или большой
    scaleFactor = Math.min(1.2, Math.max(0.6, scaleFactor));

    // Масштабируем модель
    const baseScale = 0.15;
    const newScale = baseScale * scaleFactor;
    currentModel.scale.set(newScale, newScale, newScale);

    // Рассчитываем расстояние камеры (чем меньше контейнер, тем ближе камера)
    let distance = 2.2 * scaleFactor;
    // Ограничиваем расстояние, чтобы модель не обрезалась
    distance = Math.min(3, Math.max(1.5, distance));

    // Устанавливаем позицию камеры
    camera.position.set(distance, distance * 0.4, distance);

    // ОБЯЗАТЕЛЬНО обновляем target и смотрим на центр модели
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    controls.update();
  }
  // Функция для корректировки камеры и модели при изменении размера
  function adjustForScreenSize() {
    if (!currentModel) return;

    // Получаем ширину экрана в пикселях
    const width = window.innerWidth;

    // Базовая ширина, для которой настроена исходная позиция камеры (обычно 1920px)
    const baseWidth = 1920;

    // Рассчитываем коэффициент масштабирования относительно базовой ширины
    const scaleFactor = width / baseWidth;

    // Корректируем позицию камеры
    // Исходная позиция: x: 2, y: 0.5, z: 2
    camera.position.set(
      2 * scaleFactor, // X масштабируем
      0.5 * scaleFactor, // Y масштабируем
      2 * scaleFactor, // Z масштабируем
    );

    // Корректируем масштаб модели
    // Исходный масштаб: 0.15
    const baseScale = 0.15;
    const newScale = baseScale * scaleFactor;
    currentModel.scale.set(newScale, newScale, newScale);

    // Обновляем контроллер, чтобы он учитывал новую позицию камеры
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // Заменяем существующий обработчик изменения размера окна
  window.removeEventListener("resize", onWindowResize); // Удаляем старый, если был
  window.addEventListener("resize", () => {
    // Обновляем aspect и размер рендерера
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Корректируем позицию камеры и масштаб модели
    adjustForScreenSize();
  });
  // Обработка изменения размера окна
  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// ========== МЕНЮБАР С ПЛАВНОЙ ПРОКРУТКОЙ =========

document.addEventListener("DOMContentLoaded", function () {
  // Находим все ссылки в меню, которые ведут на якоря (#)
  const menuLinks = document.querySelectorAll(
    '.menubar a[href^="#"], .menu a[href^="#"], nav a[href^="#"]',
  );

  // Если нет ссылок в меню, пробуем найти любые якорные ссылки на странице
  const anchorLinks =
    menuLinks.length > 0
      ? menuLinks
      : document.querySelectorAll('a[href^="#"]');

  // Функция плавной прокрутки к элементу
  function smoothScrollToElement(targetId) {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Получаем высоту фиксированного менюбара (если есть)
      const menubar = document.querySelector(".menubar, .menu, nav");
      let offset = 0;

      if (menubar) {
        const menubarHeight = menubar.offsetHeight;
        offset = menubarHeight + 10; // +10 для небольшого отступа
      }

      // Вычисляем позицию для прокрутки
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      // Плавная прокрутка
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }

  // Обработчик клика для всех якорных ссылок
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Отменяем стандартное поведение

      // Получаем id цели из атрибута href
      const href = this.getAttribute("href");
      const targetId = href.substring(1); // Убираем символ #

      if (targetId) {
        smoothScrollToElement(targetId);

        // Опционально: обновляем URL без прокрутки (для истории)
        if (history.pushState) {
          history.pushState(null, null, href);
        } else {
          location.hash = href;
        }
      }
    });
  });

  // ========== АКТИВНОЕ СОСТОЯНИЕ ПУНКТОВ МЕНЮ ПРИ ПРОКРУТКЕ ==========
  // Находим все секции, на которые ведут ссылки
  const sections = [];
  anchorLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const targetId = href.substring(1);
    if (targetId) {
      const section = document.getElementById(targetId);
      if (section) {
        sections.push({
          id: targetId,
          element: section,
          link: link,
        });
      }
    }
  });

  // Функция обновления активного пункта меню
  function updateActiveMenuItem() {
    const scrollPosition = window.scrollY + 100; // +100 для учета отступа

    let currentSection = null;

    // Находим текущую видимую секцию
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].element;
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = sections[i];
        break;
      }
    }

    // Обновляем класс active на ссылках
    sections.forEach((section) => {
      if (section.link) {
        // Удаляем класс active у всех ссылок
        section.link.classList.remove("active");

        // Если это текущая секция - добавляем класс active
        if (currentSection && section.id === currentSection.id) {
          section.link.classList.add("active");
        }
      }
    });
  }

  // Слушаем событие прокрутки
  if (sections.length > 0) {
    window.addEventListener("scroll", updateActiveMenuItem);
    updateActiveMenuItem(); // Вызываем один раз при загрузке
  }
});
// секция2
// числа
// Генерация случайного четырехзначного числа
function randomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Разбиваем число на отдельные цифры
function splitDigits(num) {
  return num.toString().padStart(4, "0").split("").map(Number);
}

// Создаем структуру для анимации цифр
function setupAnimatedNumbers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentValue = parseInt(container.textContent) || 0;
  container.setAttribute("data-value", currentValue);

  // Очищаем контейнер
  container.innerHTML = "";

  // Создаем span для каждой цифры
  const digits = splitDigits(currentValue);
  digits.forEach((digit, index) => {
    const digitSpan = document.createElement("span");
    digitSpan.className = "counter-digit";
    digitSpan.setAttribute("data-digit", digit);
    digitSpan.setAttribute("data-index", index);
    digitSpan.textContent = digit;
    container.appendChild(digitSpan);
  });
}

// Анимация одной цифры (прокрутка)
function animateDigitTo(digitElement, targetDigit, currentDigit) {
  return new Promise((resolve) => {
    if (currentDigit === targetDigit) {
      resolve();
      return;
    }

    const steps = Math.abs(targetDigit - currentDigit);
    const stepTime = 50; // 50ms на шаг
    let currentStep = 0;
    let currentVal = currentDigit;

    // Определяем направление прокрутки
    const direction = targetDigit > currentDigit ? 1 : -1;

    const interval = setInterval(() => {
      currentVal += direction;
      currentStep++;

      // Обновляем отображаемую цифру
      digitElement.textContent = currentVal;
      digitElement.classList.add("scrolling");

      // Если дошли до целевой цифры или прошли все шаги
      if (currentVal === targetDigit || currentStep >= steps) {
        clearInterval(interval);
        digitElement.textContent = targetDigit;
        setTimeout(() => {
          digitElement.classList.remove("scrolling");
        }, 100);
        resolve();
      }
    }, stepTime);
  });
}

// Анимация всего числа (все цифры прокручиваются одновременно)
async function animateToNumber(containerId, targetNumber) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentValue = parseInt(container.getAttribute("data-value")) || 0;
  if (currentValue === targetNumber) return;

  const currentDigits = splitDigits(currentValue);
  const targetDigits = splitDigits(targetNumber);
  const digitElements = container.querySelectorAll(".counter-digit");

  // Анимируем каждую цифру
  const animations = [];
  digitElements.forEach((digitEl, index) => {
    const animation = animateDigitTo(
      digitEl,
      targetDigits[index],
      currentDigits[index],
    );
    animations.push(animation);
  });

  await Promise.all(animations);
  container.setAttribute("data-value", targetNumber);
}

// Эффект "быстрого счетчика" (прокрутка через промежуточные значения)
async function rollNumber(containerId, targetNumber, duration = 800) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentValue = parseInt(container.getAttribute("data-value")) || 0;
  const difference = targetNumber - currentValue;
  const steps = Math.min(Math.abs(difference), 20); // Максимум 20 промежуточных шагов
  const stepTime = duration / steps;

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const intermediateValue = Math.round(currentValue + difference * progress);
    await animateToNumber(containerId, intermediateValue);
    await new Promise((resolve) => setTimeout(resolve, stepTime));
  }

  await animateToNumber(containerId, targetNumber);
}

// Основная функция
function setupMainAnimatedNumbers() {
  // Настраиваем оба блока
  setupAnimatedNumbers("randomNumber1");
  setupAnimatedNumbers("randomNumber2");

  let isAnimating = false;

  async function updateNumbers() {
    if (isAnimating) return;
    isAnimating = true;

    const newNumber1 = randomFourDigit();
    const newNumber2 = randomFourDigit();

    // Запускаем анимацию параллельно
    await Promise.all([
      rollNumber("randomNumber1", newNumber1, 600),
      rollNumber("randomNumber2", newNumber2, 600),
    ]);

    isAnimating = false;
  }

  // Первая анимация
  setTimeout(() => updateNumbers(), 100);

  // Периодическое обновление
  setInterval(() => updateNumbers(), 2600);
}

// Запуск после загрузки страницы
document.addEventListener("DOMContentLoaded", setupMainAnimatedNumbers);

// ползунок
const slider = document.querySelector(".stepped-slider");
const thumb = document.querySelector(".slider-thumb");
const marks = document.querySelectorAll(".mark");
const fill = document.querySelector(".slider-fill");
let isDragging = false;

// Рассчитываем позиции для каждой метки
function calculatePositions() {
  const sliderWidth = slider.offsetWidth;
  return Array.from(marks).map((mark, index, arr) => {
    return (sliderWidth / (arr.length - 1)) * index;
  });
}

let positions = calculatePositions();

function setThumbPosition(clientX) {
  const rect = slider.getBoundingClientRect();
  let x = clientX - rect.left;

  // Ограничиваем x в пределах слайдера
  x = Math.max(0, Math.min(rect.width, x));

  // Находим ближайшую позицию метки
  const closest = positions.reduce((prev, curr) =>
    Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev,
  );

  // Устанавливаем позицию ползунка
  thumb.style.left = `${closest}px`;

  // Обновляем заливку трека (цветная линия за ползунком)
  fill.style.width = `${closest}px`;

  // Определяем значение (номер шага)
  const value = positions.indexOf(closest);

  // Отправляем кастомное событие
  const event = new CustomEvent("slider-change", {
    detail: { value: value + 1 },
  });
  slider.dispatchEvent(event);
}

// Обработчик клика по слайдеру
slider.addEventListener("click", (e) => {
  setThumbPosition(e.clientX);
});

// Обработчик начала перетаскивания
slider.addEventListener("mousedown", (e) => {
  isDragging = true;
  setThumbPosition(e.clientX);
});

// Обработчик перемещения мыши
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  setThumbPosition(e.clientX);
});

// Обработчик окончания перетаскивания
document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Обработчик изменения значения слайдера
slider.addEventListener("slider-change", (e) => {
  // Здесь можно добавить логику при изменении значения
});

// Обновление позиций при изменении размера окна
window.addEventListener("resize", () => {
  // Пересчитываем позиции меток
  positions = calculatePositions();

  // Получаем текущую позицию ползунка
  const currentLeft = parseFloat(thumb.style.left);

  // Если позиция определена, находим ближайшую метку
  if (!isNaN(currentLeft)) {
    const closest = positions.reduce((prev, curr) =>
      Math.abs(curr - currentLeft) < Math.abs(prev - currentLeft) ? curr : prev,
    );

    // Обновляем позицию ползунка и заливку
    thumb.style.left = `${closest}px`;
    fill.style.width = `${closest}px`;
  }
});

// Инициализация: устанавливаем начальную позицию (первая метка)
setThumbPosition(positions[0]);

// числа2

// крутилка
function krutilka() {
  const clocks = document.querySelectorAll(".clock");

  // Настройки амплитуды
  const AMPLITUDE = 2.5; // ← УВЕЛИЧЬТЕ ЭТО ЧИСЛО ДЛЯ БОЛЬШЕГО ПОВОРОТА (2 = в 2 раза больше, 3 = в 3 раза и т.д.)
  // Можно поставить 3, 4, 5 - чем больше, тем сильнее будет поворачиваться стрелка

  document.addEventListener("mousemove", (event) => {
    clocks.forEach((clock) => {
      const rect = clock.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Вычисляем угол к курсору
      let deltaX = event.clientX - centerX;
      let deltaY = event.clientY - centerY;
      let angle = Math.atan2(deltaY, deltaX);

      // УМНОЖАЕМ УГОЛ НА АМПЛИТУДУ!
      let deg = angle * (180 / Math.PI) * AMPLITUDE;

      // Применяем поворот
      clock.style.transform = `rotate(${deg}deg)`;
    });
  });
}

// альбомы

// летающие капсул

(function () {
  // НАСТРОЙКИ
  const CONTAINER_ID = "arena";
  const IMAGE_SIZE_VW = 2; // ← МЕНЯЙТЕ ЗДЕСЬ РАЗМЕР (8 = 8% от ширины экрана)
  const IMAGE_MIN_SIZE = 2; // Минимальный размер в px
  const IMAGE_MAX_SIZE = 20; // Максимальный размер в px
  const MIN_ROTATION = -180; // Минимальный угол поворота (в градусах)
  const MAX_ROTATION = 100; // Максимальный угол поворота (в градусах)

  class FlyingImage {
    constructor(element, index, containerRect, viewportWidth) {
      this.el = element;
      this.index = index;

      // Вычисляем размер
      const sizeInPx = (viewportWidth * IMAGE_SIZE_VW) / 100;
      this.width = Math.min(Math.max(sizeInPx, IMAGE_MIN_SIZE), IMAGE_MAX_SIZE);
      this.height = this.width;

      // Применяем размер
      this.el.style.width = this.width + "px";
      this.el.style.height = this.height + "px";

      // Генерируем случайный угол поворота
      this.rotation =
        Math.random() * (MAX_ROTATION - MIN_ROTATION) + MIN_ROTATION;
      this.applyRotation();

      // Начальная позиция
      const maxX = Math.max(0, containerRect.width - this.width);
      const maxY = Math.max(0, containerRect.height - this.height);
      this.x = Math.random() * maxX;
      this.y = Math.random() * maxY;

      // Скорость
      this.vx = (Math.random() * 3 + 1.2) * (Math.random() > 0.5 ? 1 : -1);
      this.vy = (Math.random() * 3 + 1.2) * (Math.random() > 0.5 ? 1 : -1);

      if (Math.abs(this.vx) > 4.5) this.vx = this.vx > 0 ? 4.2 : -4.2;
      if (Math.abs(this.vy) > 4.5) this.vy = this.vy > 0 ? 4.2 : -4.2;

      this.isPaused = false;
      this.applyPosition();
    }

    applyRotation() {
      if (!this.el) return;
      this.el.style.transform = `rotate(${this.rotation}deg)`;
      // Сохраняем transform-origin по центру для плавного поворота
      this.el.style.transformOrigin = "center center";
    }

    applyPosition() {
      if (!this.el) return;
      this.el.style.left = this.x + "px";
      this.el.style.top = this.y + "px";
    }

    update(containerRect) {
      if (this.isPaused) return;
      if (!containerRect) return;

      this.x += this.vx;
      this.y += this.vy;

      if (this.x <= 0) {
        this.x = 0;
        this.vx = -this.vx;
      }
      if (this.x + this.width >= containerRect.width) {
        this.x = containerRect.width - this.width;
        this.vx = -this.vx;
      }
      if (this.y <= 0) {
        this.y = 0;
        this.vy = -this.vy;
      }
      if (this.y + this.height >= containerRect.height) {
        this.y = containerRect.height - this.height;
        this.vy = -this.vy;
      }

      this.applyPosition();
    }

    setPause(paused) {
      this.isPaused = paused;
      if (paused) {
        this.el.classList.add("paused");
      } else {
        this.el.classList.remove("paused");
      }
    }

    shake() {
      if (!this.el) return;
      // Сохраняем текущий поворот перед анимацией
      const currentRotation = this.rotation;
      this.el.classList.add("shake");

      // Временно добавляем анимацию тряски, сохраняя поворот
      this.el.style.transform = `rotate(${currentRotation}deg)`;

      setTimeout(() => {
        if (this.el) {
          this.el.classList.remove("shake");
          // Восстанавливаем поворот после тряски
          this.el.style.transform = `rotate(${currentRotation}deg)`;
        }
      }, 260);
    }
  }

  class FlyingArena {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) throw new Error("Container not found");

      this.items = [];
      this.animationId = null;
      this.containerRect = this.container.getBoundingClientRect();

      this.boundResize = this.handleResize.bind(this);
      window.addEventListener("resize", this.boundResize);

      this.initImages();
      this.startAnimation();
    }

    initImages() {
      // Берем существующие картинки из HTML
      const wrapperElements = this.container.querySelectorAll(".floating-img");
      const viewportWidth = window.innerWidth;

      for (let idx = 0; idx < wrapperElements.length; idx++) {
        const el = wrapperElements[idx];
        const flying = new FlyingImage(
          el,
          idx,
          this.containerRect,
          viewportWidth,
        );

        // Корректируем позицию
        let maxX = this.containerRect.width - flying.width;
        let maxY = this.containerRect.height - flying.height;
        if (flying.x > maxX) flying.x = maxX > 0 ? maxX : 0;
        if (flying.y > maxY) flying.y = maxY > 0 ? maxY : 0;
        flying.applyPosition();

        // События
        el.addEventListener("mouseenter", () => flying.setPause(true));
        el.addEventListener("mouseleave", () => flying.setPause(false));
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          flying.shake();
          if ("vibrate" in navigator) navigator.vibrate(40);
        });

        this.items.push(flying);
      }
    }

    handleResize() {
      const newRect = this.container.getBoundingClientRect();
      if (!newRect.width || !newRect.height) return;

      const viewportWidth = window.innerWidth;
      const sizeInPx = (viewportWidth * IMAGE_SIZE_VW) / 100;
      const newSize = Math.min(
        Math.max(sizeInPx, IMAGE_MIN_SIZE),
        IMAGE_MAX_SIZE,
      );

      // Обновляем размеры всех картинок
      for (let item of this.items) {
        item.width = newSize;
        item.height = newSize;
        item.el.style.width = newSize + "px";
        item.el.style.height = newSize + "px";

        // Повторно применяем поворот (на случай, если CSS сбросился)
        item.applyRotation();

        // Корректируем позицию
        const maxX = newRect.width - item.width;
        const maxY = newRect.height - item.height;
        if (item.x > maxX) item.x = Math.max(0, maxX);
        if (item.y > maxY) item.y = Math.max(0, maxY);
        item.applyPosition();
      }

      this.containerRect = newRect;
    }

    startAnimation() {
      const animate = () => {
        const currentRect = this.container.getBoundingClientRect();
        if (
          currentRect.width !== this.containerRect.width ||
          currentRect.height !== this.containerRect.height
        ) {
          this.containerRect = currentRect;
          for (let item of this.items) {
            const maxX = this.containerRect.width - item.width;
            const maxY = this.containerRect.height - item.height;
            if (item.x > maxX) item.x = Math.max(0, maxX);
            if (item.y > maxY) item.y = Math.max(0, maxY);
            item.applyPosition();
          }
        }

        for (let item of this.items) {
          item.update(this.containerRect);
        }
        this.animationId = requestAnimationFrame(animate);
      };
      this.animationId = requestAnimationFrame(animate);
    }

    destroy() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      window.removeEventListener("resize", this.boundResize);
      this.items = [];
    }
  }

  // Запуск
  window.addEventListener("DOMContentLoaded", () => {
    const arenaApp = new FlyingArena(CONTAINER_ID);
    window.flyingArena = arenaApp;
  });
})();
// звуковая волна

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("wave-button");
  const waveBars = document.querySelectorAll(".waveBar");

  // Исходные значения высоты (как в CSS)
  const originalHeights = Array.from(waveBars).map((bar) => {
    // Получаем вычисленную высоту в пикселях и переводим в vw для консистентности
    const computedHeight = window.getComputedStyle(bar).height;
    return parseFloat(computedHeight);
  });

  // Целевые значения высоты для анимации (возрастающая последовательность)
  const targetHeights = [];
  const minHeight = 5; // минимальная высота в vw
  const maxHeight = 30; // максимальная высота в vw

  // Создаем плавно возрастающую последовательность от меньшего к большему
  for (let i = 0; i < waveBars.length; i++) {
    // Используем синусоидальную или линейную прогрессию для плавного роста
    const progress = i / (waveBars.length - 1); // от 0 до 1
    // Линейный рост от minHeight до maxHeight
    const height = minHeight + (maxHeight - minHeight) * progress;
    targetHeights.push(height);
  }

  let isAnimating = false;
  let animationFrameId = null;

  function animateRandomWave() {
    if (isAnimating) return;

    isAnimating = true;
    const steps = 12; // количество шагов анимации
    let currentStep = 0;

    function step() {
      if (currentStep >= steps) {
        // Финальный шаг - выстраиваем в правильную последовательность
        waveBars.forEach((bar, index) => {
          bar.style.height = `${targetHeights[index]}vw`;
          bar.style.transition = "height 200ms ease-out";
        });
        setTimeout(() => {
          isAnimating = false;
        }, 200);
        return;
      }

      // Промежуточные случайные высоты
      waveBars.forEach((bar, index) => {
        const randomFactor = 0.3 + Math.random() * 0.7;
        const randomHeight = targetHeights[index] * randomFactor;
        bar.style.height = `${randomHeight}vw`;
        bar.style.transition = "height 80ms ease-out";
      });

      currentStep++;
      setTimeout(step, 80);
    }

    step();
  }
  button.addEventListener("click", animateRandomWave);
});

// перемещение обложек альбомов

(function () {
  // Получаем элементы капсул
  const lightCapsule = document.querySelector(
    ".capsulePill-light.animated-capsule",
  );
  const blueCapsule = document.querySelector(
    ".capsulePill-blue.animated-capsule",
  );
  const assembleBtn = document.getElementById("assembleCapsuleBtn");

  let isAssembled = false;

  // Функция сборки капсулы
  function assembleCapsule() {
    if (isAssembled) return;

    // Добавляем класс для анимации
    lightCapsule.classList.add("assembled");
    blueCapsule.classList.add("assembled");

    isAssembled = true;
  }

  // Функция сброса капсул в исходное положение
  function resetCapsule() {
    if (!isAssembled) return;

    lightCapsule.classList.remove("assembled");
    blueCapsule.classList.remove("assembled");

    isAssembled = false;
  }

  // Добавляем обработчик на кнопку сборки
  if (assembleBtn) {
    assembleBtn.addEventListener("click", assembleCapsule);
  }

  // Функционал перемещения обложек (если нужен)
  const container = document.querySelector(".capsuleSection-inner");
  const draggableItems = document.querySelectorAll(".albumCover");

  let activeElement = null;
  let isDragging = false;
  let startMouseX = 0,
    startMouseY = 0;
  let startElementLeft = 0,
    startElementTop = 0;

  function getElementPosition(element) {
    let left = parseFloat(element.style.left);
    let top = parseFloat(element.style.top);

    if (isNaN(left)) {
      const computedLeft = window.getComputedStyle(element).left;
      left = parseFloat(computedLeft);
    }
    if (isNaN(top)) {
      const computedTop = window.getComputedStyle(element).top;
      top = parseFloat(computedTop);
    }

    if (isNaN(left) || isNaN(top)) {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      left = rect.left - containerRect.left;
      top = rect.top - containerRect.top;
    }

    return { left: isNaN(left) ? 0 : left, top: isNaN(top) ? 0 : top };
  }

  function setElementPosition(element, left, top) {
    element.style.left = left + "px";
    element.style.top = top + "px";
    if (element.style.right && element.style.right !== "auto") {
      element.style.right = "auto";
    }
  }

  function clampPosition(element, left, top) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const maxLeft = containerRect.width - elementRect.width;
    const maxTop = containerRect.height - elementRect.height;
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    };
  }

  draggableItems.forEach((item) => {
    item.setAttribute("draggable", "false");

    const rect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    item.style.position = "absolute";
    setElementPosition(
      item,
      rect.left - containerRect.left,
      rect.top - containerRect.top,
    );

    item.addEventListener("mousedown", onMouseDown);
    item.addEventListener("dragstart", (e) => e.preventDefault());
  });

  function onMouseDown(e) {
    const targetElement = e.target.closest(".albumCover");
    if (!targetElement) return;

    e.preventDefault();
    e.stopPropagation();

    if (isDragging) finishDrag();

    activeElement = targetElement;
    const pos = getElementPosition(activeElement);
    startElementLeft = pos.left;
    startElementTop = pos.top;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    isDragging = true;
    activeElement.classList.add("dragging");

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
  }

  function onMouseMove(e) {
    if (!isDragging || !activeElement) return;
    e.preventDefault();

    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;
    const clamped = clampPosition(
      activeElement,
      startElementLeft + deltaX,
      startElementTop + deltaY,
    );
    setElementPosition(activeElement, clamped.left, clamped.top);
  }

  function onMouseUp() {
    finishDrag();
  }

  function finishDrag() {
    if (activeElement) activeElement.classList.remove("dragging");
    isDragging = false;
    activeElement = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "";
  }

  window.addEventListener("resize", () => {
    draggableItems.forEach((item) => {
      const left = parseFloat(item.style.left);
      const top = parseFloat(item.style.top);
      if (!isNaN(left) && !isNaN(top)) {
        const clamped = clampPosition(item, left, top);
        setElementPosition(item, clamped.left, clamped.top);
      }
    });
  });
})();

// курсор
const root = document.documentElement;
function setVar(name, val) {
  root.style.setProperty(name, val);
}

function updateSVG() {
  const freq = parseFloat(document.getElementById("noise-frequency").value);
  const scale = document.getElementById("distortion-strength").value;
  document
    .querySelector("feTurbulence")
    .setAttribute("baseFrequency", `${freq} ${freq}`);
  document.querySelector("feDisplacementMap").setAttribute("scale", scale);
}

const follower = document.querySelector(".box");
document.addEventListener("mousemove", (e) => {
  follower.style.left = e.clientX - 100 + "px";
  follower.style.top = e.clientY + "px";
});

function renderLine(text, baseX, baseY, distort) {
  let x = baseX;
  const chars = [...text];
  const t = performance.now();
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const charWave = Math.sin(i * 0.45 + t * 0.003) * distort * 0.6;
    const charVert = Math.cos(i * 0.2 + t * 0.002) * distort * 0.4;
    ctx.fillText(c, x + charWave, baseY + charVert);
    x += ctx.measureText(c).width;
  }
}

function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  // ctx.fillStyle = 'blue'
  var grd = ctx.createLinearGradient(0, 0, innerWidth, 0);
  grd.addColorStop(0, "blue");
  grd.addColorStop(1, "#b0b6e8");

  ctx.fillStyle = grd;
  ctx.font = "3vw Arial";
  ctx.textBaseline = "top";

  for (let i = 0; i < leftText.length; i++) {
    const y = startY + i * lineH;
    const norm = y / innerHeight;
    const distort = Math.pow(norm, 1.5) * 56;
    renderLine(leftText[i], 20, y, distort);
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// окно1снизу
// ========== МОДАЛЬНОЕ ОКНО С ДИНАМИЧЕСКИМ КОНТЕНТОМ ==========
document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("show-button");
  const closeIcon = document.getElementById("closeIconBtn");
  const popup = document.getElementById("popupSection");
  const overlay = document.getElementById("overlay");
  const popupTitle = document.getElementById("popupTitle");
  const popupImage = document.getElementById("popupImage");
  const extraTextContainer = document.getElementById("extraText");

  // Элементы слайдеров из section7
  const sliderThumb = document.querySelector(".stepped-slider .slider-thumb");
  const sliderTrack = document.querySelector(".stepped-slider .slider-track");
  const grustnoCheckbox = document.querySelector(".grustno .switch_input");
  const veseloCheckbox = document.querySelector(".veselo .switch_input");

  let currentMgValue = 0;
  let isGrustno = false;
  let isVeselo = false;
  let changeTimer = null;
  let isContentChanged = false;
  let scrollbarWidth = 0;

  // Путь к картинке-загрузке
  const LOADING_IMAGE = "images/strelka.svg";

  // Функция для получения ширины скроллбара
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  // Функция остановки анимации вращения
  function stopSpinning() {
    if (popupImage) {
      popupImage.classList.remove("spinning");
    }
  }

  // Функция запуска анимации вращения
  function startSpinning() {
    if (popupImage) {
      popupImage.classList.add("spinning");
    }
  }

  // Функция получения текущего значения ползунка (0-25 мг)
  function getSliderMgValue() {
    if (!sliderThumb || !sliderTrack) return 0;
    const trackRect = sliderTrack.getBoundingClientRect();
    const thumbRect = sliderThumb.getBoundingClientRect();
    const percent = (thumbRect.left - trackRect.left) / trackRect.width;
    const mgValue = Math.round(percent * 25);
    return Math.min(25, Math.max(0, mgValue));
  }

  // Функция обновления значений из слайдеров
  function updateSliderValues() {
    currentMgValue = getSliderMgValue();
    if (grustnoCheckbox) isGrustno = grustnoCheckbox.checked;
    if (veseloCheckbox) isVeselo = veseloCheckbox.checked;
  }

  // Функция определения картинки и текста на основе выбора (только для результата)
  function getResultContent() {
    updateSliderValues();

    let mood = "neutral";
    if (isGrustno && !isVeselo) mood = "sad";
    if (!isGrustno && isVeselo) mood = "happy";
    if (isGrustno && isVeselo) mood = "mixed";

    let dosage = "";
    if (currentMgValue <= 8) dosage = "low";
    else if (currentMgValue <= 17) dosage = "medium";
    else dosage = "high";

    let imagePath = "images/";
    let text = "";
    let title = "ВАМ ПОДХОДИТ КАПСУЛА:";

    if (mood === "sad") {
      if (dosage === "low") {
        imagePath += "capsuleBlue5.png";
        text = "КАПСУЛА SOMNIA";
      } else if (dosage === "medium") {
        imagePath += "capsuleBlue-Green3.svg";
        text = "КАПСУЛА ECHO";
      } else {
        imagePath += "capsuleGreen2.svg";
        text = "КАПСУЛА KAIRO";
      }
    } else if (mood === "happy") {
      if (dosage === "low") {
        imagePath += "capsuleOrange1.svg";
        text = "КАПСУЛА NOVA";
      } else if (dosage === "medium") {
        imagePath += "capsulePeach4.svg";
        text = "КАПСУЛА ARBO";
      } else {
        imagePath += "capsulePink6.png";
        text = "КАПСУЛА MOLIRA";
      }
    } else if (mood === "mixed") {
      imagePath += "capsuleBlue-Green3.svg";
      text = "КАПСУЛА ECHO";
    } else {
      imagePath += "capsulePeach4.svg";
      text = "КАПСУЛА ARBO";
    }

    return { imagePath, text, title };
  }

  // Функция отображения загрузочного состояния
  function showLoadingState() {
    console.log("🔄 Показываем загрузочное состояние");
    if (popupTitle) {
      popupTitle.textContent = "ИДЁТ ПОДБОР...";
      popupTitle.style.color = "#000000";
    }

    if (popupImage) {
      popupImage.src = LOADING_IMAGE;
      popupImage.style.opacity = "1";
      popupImage.style.transform = "scale(1)";
      // Запускаем анимацию вращения
      startSpinning();
    }

    if (extraTextContainer) {
      extraTextContainer.innerHTML = "";
    }

    isContentChanged = false;
  }

  // Функция отображения результата (капсула + текст)
  function showResultState() {
    if (isContentChanged) {
      console.log("Результат уже показан, просто обновляем капсулу");
      const content = getResultContent();

      if (popupImage) {
        // Останавливаем вращение перед сменой картинки
        stopSpinning();
        popupImage.src = content.imagePath;
        popupImage.style.opacity = "0";
        setTimeout(() => {
          popupImage.style.opacity = "1";
        }, 50);
      }

      if (extraTextContainer && content.text) {
        extraTextContainer.innerHTML = `
          <div class="recommendation-card">
            <p>${content.text}</p>
            <div class="recommendation-footer"></div>
          </div>
        `;
      }
      return;
    }

    console.log("🎉 Показываем результат после 5 секунд");
    const content = getResultContent();

    if (popupTitle) {
      popupTitle.textContent = content.title;
      popupTitle.style.color = "#000000";
    }

    if (popupImage) {
      // Останавливаем вращение перед сменой картинки
      stopSpinning();
      popupImage.src = content.imagePath;
      popupImage.style.opacity = "0";
      setTimeout(() => {
        popupImage.style.opacity = "1";
      }, 50);
    }

    if (extraTextContainer && content.text) {
      extraTextContainer.innerHTML = `
        <div class="recommendation-card">
          <p>${content.text}</p>
          <div class="recommendation-footer"></div>
        </div>
      `;
    }

    isContentChanged = true;
  }

  // Функция для отслеживания изменений слайдеров
  function setupSliderListeners() {
    if (sliderThumb) {
      const observer = new MutationObserver(() => {
        if (
          isContentChanged &&
          document.body.classList.contains("modal-open")
        ) {
          console.log("🔄 Ползунок изменился, обновляем капсулу");
          showResultState();
        }
      });
      observer.observe(sliderThumb, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    if (grustnoCheckbox) {
      grustnoCheckbox.addEventListener("change", function () {
        if (
          isContentChanged &&
          document.body.classList.contains("modal-open")
        ) {
          console.log(
            '🔄 Переключатель "грустно" изменился, обновляем капсулу',
          );
          showResultState();
        }
      });
    }

    if (veseloCheckbox) {
      veseloCheckbox.addEventListener("change", function () {
        if (
          isContentChanged &&
          document.body.classList.contains("modal-open")
        ) {
          console.log('🔄 Переключатель "весело" изменился, обновляем капсулу');
          showResultState();
        }
      });
    }
  }

  // Функция открытия окна
  function openPopup() {
    console.log("✅ Открываем окно");

    // Сохраняем ширину скроллбара
    scrollbarWidth = getScrollbarWidth();

    // Добавляем отступ справа, чтобы компенсировать пропадание скроллбара
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + "px";
    }

    // Показываем загрузочное состояние
    showLoadingState();

    // Открываем окно
    document.body.classList.add("modal-open");

    // Очищаем предыдущий таймер
    if (changeTimer) {
      clearTimeout(changeTimer);
    }

    // Запускаем таймер на 5 секунд
    changeTimer = setTimeout(function () {
      if (document.body.classList.contains("modal-open")) {
        console.log("⏰ Прошло 5 секунд, показываем результат");
        showResultState();
      }
    }, 5000);
  }

  // Функция закрытия окна
  function closePopup() {
    console.log("❌ Закрываем окно");
    document.body.classList.remove("modal-open");

    // Убираем компенсационный отступ
    document.body.style.paddingRight = "";

    // Останавливаем вращение
    stopSpinning();

    if (changeTimer) {
      clearTimeout(changeTimer);
      changeTimer = null;
    }

    // Сбрасываем флаг
    isContentChanged = false;
  }

  // Настраиваем слушатели слайдеров
  setupSliderListeners();

  // Добавляем обработчики для модального окна
  if (openBtn) {
    openBtn.addEventListener("click", openPopup);
    console.log("✅ Обработчик добавлен для кнопки открытия");
  } else {
    console.error('❌ Кнопка с id="show-button" не найдена!');
  }

  // Обработчик для крестика
  if (closeIcon) {
    console.log("✅ Крестик найден, добавляем обработчик");
    closeIcon.addEventListener("click", function (e) {
      console.log("🖱️ Клик по крестику!");
      e.stopPropagation();
      closePopup();
    });
  } else {
    console.error('❌ Крестик с id="closeIconBtn" не найден!');
  }

  if (overlay) {
    overlay.addEventListener("click", function (e) {
      console.log("🖱️ Клик по оверлею");
      closePopup();
    });
    console.log("✅ Обработчик добавлен для оверлея");
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("modal-open")) {
      console.log("⌨️ Нажата клавиша Escape");
      closePopup();
    }
  });
});

// секция2скарттинками
// ========== ОВЕРЛЕЙ ДЛЯ КАРТОЧЕК НАСТРОЕНИЯ ==========
// Получаем элементы
const moodCards = document.querySelectorAll(".moodCard");
const overlay = document.getElementById("fullscreenOverlay");
const closeBtn = document.getElementById("closeBtn");
const fullscreenBackground = document.getElementById("fullscreenBackground");
const floatingImage = document.getElementById("floatingImage");
const floatingTitle = document.getElementById("floatingTitle");
const floatingDescription = document.getElementById("floatingDescription");

// Данные для каждого настроения
const moodData = {
  0: {
    title: "КАПСУЛА ECHO",
    backgroundImage: "images/photoCalm.jpg",
    cardImage: "images/capsuleGreen2.svg",
    description: "позволяет нам ясно мыслить и принимать взвешенные решения",
  },
  1: {
    title: "КАПСУЛА NOVA",
    backgroundImage: "images/photoHappy.jpg",
    cardImage: "images/capsuleOrange1.svg",
    description: "делает жизнь ярче и наполняет её смыслом",
  },
  2: {
    title: "КАПСУЛА SOMNIA",
    backgroundImage: "images/photoSad.jpg",
    cardImage: "images/capsuleBlue5.png",
    description: "поможет сомредоточиться на работе и учёбе",
  },
  3: {
    title: "КАПСУЛА MOLIRA",
    backgroundImage: "images/photoNostalgic.jpg",
    cardImage: "images/capsulePink6.png",
    description:
      "связывает нас с важными моментами прошлого, которые сформировали нас сегодня",
  },
};

// Функция открытия
function openFullscreen(index) {
  const data = moodData[index];
  if (data) {
    // Сохраняем текущую прокрутку
    const scrollY = window.scrollY;

    // Фоновое изображение на весь экран
    fullscreenBackground.style.backgroundImage = `url('${data.backgroundImage}')`;

    // Маленькая картинка в белом блоке
    floatingImage.src = data.cardImage;

    // Текст
    floatingTitle.textContent = data.title;
    floatingDescription.textContent = data.description;

    // Добавляем класс active
    overlay.classList.add("active");

    // Блокируем прокрутку без изменения ширины страницы
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }
}

// Функция закрытия
function closeFullscreen() {
  // Получаем сохраненную позицию прокрутки
  const scrollY = document.body.style.top;

  // Убираем класс active
  overlay.classList.remove("active");

  // Возвращаем прокрутку
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  // Восстанавливаем прокрутку
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  }

  // Очищаем фон
  setTimeout(() => {
    if (!overlay.classList.contains("active")) {
      fullscreenBackground.style.backgroundImage = "";
      floatingImage.src = "";
    }
  }, 300);
}

// Добавляем обработчики кликов
moodCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    openFullscreen(index);
  });
});

// Закрытие по кнопке
if (closeBtn) {
  closeBtn.addEventListener("click", closeFullscreen);
}

// Закрытие по клику на фон
if (overlay) {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeFullscreen();
    }
  });
}

// Закрытие по ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay && overlay.classList.contains("active")) {
    closeFullscreen();
  }
});
