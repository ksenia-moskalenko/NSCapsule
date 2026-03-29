krutilka();

import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { RectAreaLightUniformsLib } from "RectAreaLightUniformsLib";

// Глобальная переменная для хранения загруженной модели
let currentModel = null;

RectAreaLightUniformsLib.init();

document.addEventListener("DOMContentLoaded", () => {
  initThree();
});

function initThree() {
  const model = document.querySelector(".threedCap");
  if (!model) {
    console.error("Элемент .threedCap не найден!");
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffffff");

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(2, 0.5, 2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  model.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);

  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(-50, -50, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 4);
  light2.position.set(50, 100, 0);
  scene.add(light2);

  const loader = new GLTFLoader();
  loader.load(
    "./models/capsule.glb",
    (gltf) => {
      currentModel = gltf.scene;
      currentModel.scale.set(0.15, 0.15, 0.15);
      scene.add(currentModel);
    },
    (progress) => {},
    (error) => console.error("❌ Ошибка загрузки модели:", error),
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;

  function formatAngle(radians) {
    let degrees = radians * (180 / Math.PI);
    degrees = ((degrees % 360) + 360) % 360;
    const deg = Math.floor(degrees);
    const minutesTotal = (degrees - deg) * 60;
    const min = Math.floor(minutesTotal);
    const sec = Math.floor((minutesTotal - min) * 60);
    const hundredths = Math.floor(((minutesTotal - min) * 60 - sec) * 100);
    return `${deg.toString().padStart(2, "0")}∘${min.toString().padStart(2, "0")}′${sec.toString().padStart(2, "0")}′′${hundredths.toString().padStart(2, "0")}`;
  }

  function updateRotationDisplay() {
    if (!currentModel) return;
    const dx = camera.position.x;
    const dy = camera.position.y;
    const dz = camera.position.z;
    let azimuth = Math.atan2(dz, dx) * (180 / Math.PI);
    let polar =
      Math.asin(dy / Math.sqrt(dx * dx + dy * dy + dz * dz)) * (180 / Math.PI);
    azimuth = ((azimuth % 360) + 360) % 360;
    polar = ((polar % 360) + 360) % 360;
    const formattedX = formatAngle((polar * Math.PI) / 180);
    const formattedY = formatAngle((azimuth * Math.PI) / 180);
    const rotXElem = document.getElementById("rotationX");
    const rotYElem = document.getElementById("rotationY");
    if (rotXElem) rotXElem.textContent = formattedX;
    if (rotYElem) rotYElem.textContent = formattedY;
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateRotationDisplay();
  }
  animate();

  function adjustForScreenSize() {
    if (!currentModel) return;
    const width = window.innerWidth;
    const scaleFactor = width / 1920;
    camera.position.set(2 * scaleFactor, 0.5 * scaleFactor, 2 * scaleFactor);
    currentModel.scale.set(
      0.15 * scaleFactor,
      0.15 * scaleFactor,
      0.15 * scaleFactor,
    );
    controls.target.set(0, 0, 0);
    controls.update();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustForScreenSize();
  });
}

// ========== ПЛАВНАЯ ПРОКРУТКА МЕНЮ ==========
document.addEventListener("DOMContentLoaded", function () {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  function smoothScrollToElement(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const menubar = document.querySelector(".menubar");
      let offset = menubar ? menubar.offsetHeight + 10 : 0;
      const offsetPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      if (targetId) smoothScrollToElement(targetId);
    });
  });
});

// ========== АНИМАЦИЯ ЦИФР ==========
function randomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}
function splitDigits(num) {
  return num.toString().padStart(4, "0").split("").map(Number);
}
function setupAnimatedNumbers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const currentValue = parseInt(container.textContent) || 0;
  container.setAttribute("data-value", currentValue);
  container.innerHTML = "";
  splitDigits(currentValue).forEach((digit) => {
    const span = document.createElement("span");
    span.className = "counter-digit";
    span.textContent = digit;
    container.appendChild(span);
  });
}
async function animateToNumber(containerId, targetNumber) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const currentValue = parseInt(container.getAttribute("data-value")) || 0;
  if (currentValue === targetNumber) return;
  const currentDigits = splitDigits(currentValue);
  const targetDigits = splitDigits(targetNumber);
  const digitElements = container.querySelectorAll(".counter-digit");
  const promises = [];
  digitElements.forEach((el, i) => {
    const start = currentDigits[i];
    const end = targetDigits[i];
    if (start === end) return;
    const steps = Math.abs(end - start);
    let current = start;
    const dir = end > start ? 1 : -1;
    const interval = setInterval(() => {
      current += dir;
      el.textContent = current;
      if (current === end) clearInterval(interval);
    }, 50);
    promises.push(new Promise((resolve) => setTimeout(resolve, steps * 50)));
  });
  await Promise.all(promises);
  container.setAttribute("data-value", targetNumber);
}
async function rollNumber(containerId, targetNumber) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const current = parseInt(container.getAttribute("data-value")) || 0;
  const diff = targetNumber - current;
  const steps = Math.min(Math.abs(diff), 20);
  for (let i = 1; i <= steps; i++) {
    const intermediate = Math.round(current + diff * (i / steps));
    await animateToNumber(containerId, intermediate);
    await new Promise((r) => setTimeout(r, 30));
  }
  await animateToNumber(containerId, targetNumber);
}
function setupMainAnimatedNumbers() {
  setupAnimatedNumbers("randomNumber1");
  setupAnimatedNumbers("randomNumber2");
  let busy = false;
  async function update() {
    if (busy) return;
    busy = true;
    await Promise.all([
      rollNumber("randomNumber1", randomFourDigit()),
      rollNumber("randomNumber2", randomFourDigit()),
    ]);
    busy = false;
  }
  setInterval(update, 2600);
  setTimeout(update, 100);
}
document.addEventListener("DOMContentLoaded", setupMainAnimatedNumbers);

// ========== СЛАЙДЕР ==========
const sliderEl = document.querySelector(".stepped-slider");
const thumbEl = document.querySelector(".slider-thumb");
const marksEl = document.querySelectorAll(".mark");
const fillEl = document.querySelector(".slider-fill");
let isDraggingSlider = false;
function calcPositions() {
  const w = sliderEl.offsetWidth;
  return Array.from(marksEl).map((_, i, arr) => (w / (arr.length - 1)) * i);
}
let positions = calcPositions();
function setThumb(clientX) {
  const rect = sliderEl.getBoundingClientRect();
  let x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const closest = positions.reduce((a, b) =>
    Math.abs(b - x) < Math.abs(a - x) ? b : a,
  );
  thumbEl.style.left = `${closest}px`;
  fillEl.style.width = `${closest}px`;
}
sliderEl.addEventListener("click", (e) => setThumb(e.clientX));
sliderEl.addEventListener("mousedown", (e) => {
  isDraggingSlider = true;
  setThumb(e.clientX);
});
document.addEventListener("mousemove", (e) => {
  if (isDraggingSlider) setThumb(e.clientX);
});
document.addEventListener("mouseup", () => (isDraggingSlider = false));
window.addEventListener("resize", () => {
  positions = calcPositions();
  const left = parseFloat(thumbEl.style.left);
  if (!isNaN(left)) {
    const closest = positions.reduce((a, b) =>
      Math.abs(b - left) < Math.abs(a - left) ? b : a,
    );
    thumbEl.style.left = `${closest}px`;
    fillEl.style.width = `${closest}px`;
  }
});
setThumb(positions[0]);

// ========== КРУТИЛКА ДЛЯ ЧАСОВ ==========
function krutilka() {
  const clocks = document.querySelectorAll(".clock");
  const AMPLITUDE = 2.5;
  document.addEventListener("mousemove", (e) => {
    clocks.forEach((clock) => {
      const rect = clock.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const deg = Math.atan2(dy, dx) * (180 / Math.PI) * AMPLITUDE;
      clock.style.transform = `rotate(${deg}deg)`;
    });
  });
}

// ========== ЛЕТАЮЩИЕ КАПСУЛЫ ==========
(function () {
  const CONTAINER_ID = "arena";
  const IMAGE_SIZE_VW = 2;
  const IMAGE_MIN_SIZE = 2;
  const IMAGE_MAX_SIZE = 20;
  const MIN_ROTATION = -180;
  const MAX_ROTATION = 100;

  class FlyingImage {
    constructor(el, idx, containerRect, viewportWidth) {
      this.el = el;
      const sizePx = (viewportWidth * IMAGE_SIZE_VW) / 100;
      this.w = Math.min(Math.max(sizePx, IMAGE_MIN_SIZE), IMAGE_MAX_SIZE);
      this.h = this.w;
      this.el.style.width = this.w + "px";
      this.el.style.height = this.h + "px";
      this.rot = Math.random() * (MAX_ROTATION - MIN_ROTATION) + MIN_ROTATION;
      this.el.style.transform = `rotate(${this.rot}deg)`;
      this.x = Math.random() * Math.max(0, containerRect.width - this.w);
      this.y = Math.random() * Math.max(0, containerRect.height - this.h);
      this.vx = (Math.random() * 3 + 1.2) * (Math.random() > 0.5 ? 1 : -1);
      this.vy = (Math.random() * 3 + 1.2) * (Math.random() > 0.5 ? 1 : -1);
      this.paused = false;
      this.applyPos();
    }
    applyPos() {
      this.el.style.left = this.x + "px";
      this.el.style.top = this.y + "px";
    }
    update(rect) {
      if (this.paused) return;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x <= 0) {
        this.x = 0;
        this.vx = -this.vx;
      }
      if (this.x + this.w >= rect.width) {
        this.x = rect.width - this.w;
        this.vx = -this.vx;
      }
      if (this.y <= 0) {
        this.y = 0;
        this.vy = -this.vy;
      }
      if (this.y + this.h >= rect.height) {
        this.y = rect.height - this.h;
        this.vy = -this.vy;
      }
      this.applyPos();
    }
    setPause(p) {
      this.paused = p;
      this.el.classList.toggle("paused", p);
    }
    shake() {
      this.el.classList.add("shake");
      setTimeout(() => this.el.classList.remove("shake"), 260);
      if ("vibrate" in navigator) navigator.vibrate(40);
    }
  }

  const container = document.getElementById(CONTAINER_ID);
  if (container) {
    let items = [];
    let rect = container.getBoundingClientRect();
    const imgs = container.querySelectorAll(".floating-img");
    const viewW = window.innerWidth;
    imgs.forEach((img, i) => {
      const f = new FlyingImage(img, i, rect, viewW);
      items.push(f);
      img.addEventListener("mouseenter", () => f.setPause(true));
      img.addEventListener("mouseleave", () => f.setPause(false));
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        f.shake();
      });
    });
    function animate() {
      const newRect = container.getBoundingClientRect();
      items.forEach((item) => item.update(newRect));
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener("resize", () => {
      const newRect = container.getBoundingClientRect();
      const newSize = Math.min(
        Math.max((window.innerWidth * IMAGE_SIZE_VW) / 100, IMAGE_MIN_SIZE),
        IMAGE_MAX_SIZE,
      );
      items.forEach((item) => {
        item.w = newSize;
        item.h = newSize;
        item.el.style.width = newSize + "px";
        item.el.style.height = newSize + "px";
        if (item.x + item.w > newRect.width)
          item.x = Math.max(0, newRect.width - item.w);
        if (item.y + item.h > newRect.height)
          item.y = Math.max(0, newRect.height - item.h);
        item.applyPos();
      });
    });
  }
})();

// ========== ЗВУКОВАЯ ВОЛНА ==========
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("wave-button");
  const bars = document.querySelectorAll(".waveBar");
  const targetHeights = Array.from(bars).map(
    (_, i) => 5 + (30 - 5) * (i / (bars.length - 1)),
  );
  let animating = false;
  btn.addEventListener("click", () => {
    if (animating) return;
    animating = true;
    let step = 0;
    function next() {
      if (step >= 12) {
        bars.forEach((bar, i) => {
          bar.style.height = `${targetHeights[i]}vw`;
          bar.style.transition = "height 200ms ease-out";
        });
        setTimeout(() => {
          animating = false;
        }, 200);
        return;
      }
      bars.forEach((bar, i) => {
        bar.style.height = `${targetHeights[i] * (0.3 + Math.random() * 0.7)}vw`;
        bar.style.transition = "height 80ms ease-out";
      });
      step++;
      setTimeout(next, 80);
    }
    next();
  });
});

// ========== ПЕРЕМЕЩЕНИЕ ОБЛОЖЕК ==========
(function () {
  const light = document.querySelector(".capsulePill-light.animated-capsule");
  const blue = document.querySelector(".capsulePill-blue.animated-capsule");
  const assembleBtn = document.getElementById("assembleCapsuleBtn");
  let assembled = false;
  if (assembleBtn) {
    assembleBtn.addEventListener("click", () => {
      if (assembled) return;
      light.classList.add("assembled");
      blue.classList.add("assembled");
      assembled = true;
    });
  }
  const container = document.querySelector(".capsuleSection-inner");
  const draggables = document.querySelectorAll(".albumCover");
  let active = null,
    dragging = false,
    startX = 0,
    startY = 0,
    startLeft = 0,
    startTop = 0;
  function getPos(el) {
    let l = parseFloat(el.style.left);
    let t = parseFloat(el.style.top);
    if (isNaN(l) || isNaN(t)) {
      const rect = el.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      l = rect.left - cr.left;
      t = rect.top - cr.top;
    }
    return { left: isNaN(l) ? 0 : l, top: isNaN(t) ? 0 : t };
  }
  function setPos(el, l, t) {
    el.style.left = l + "px";
    el.style.top = t + "px";
    if (el.style.right !== "auto") el.style.right = "auto";
  }
  function clamp(el, l, t) {
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return {
      left: Math.min(Math.max(l, 0), cr.width - er.width),
      top: Math.min(Math.max(t, 0), cr.height - er.height),
    };
  }
  draggables.forEach((el) => {
    el.setAttribute("draggable", "false");
    const rect = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    el.style.position = "absolute";
    setPos(el, rect.left - cr.left, rect.top - cr.top);
    el.addEventListener("mousedown", (e) => {
      const target = e.target.closest(".albumCover");
      if (!target) return;
      e.preventDefault();
      if (dragging) finish();
      active = target;
      const p = getPos(active);
      startLeft = p.left;
      startTop = p.top;
      startX = e.clientX;
      startY = e.clientY;
      dragging = true;
      active.classList.add("dragging");
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      document.body.style.userSelect = "none";
    });
    el.addEventListener("dragstart", (e) => e.preventDefault());
  });
  function onMove(e) {
    if (!dragging || !active) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const clamped = clamp(active, startLeft + dx, startTop + dy);
    setPos(active, clamped.left, clamped.top);
  }
  function onUp() {
    finish();
  }
  function finish() {
    if (active) active.classList.remove("dragging");
    dragging = false;
    active = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    document.body.style.userSelect = "";
  }
})();

// ========== ПЛАВАЮЩАЯ ФИГУРА (КУРСОР) ==========
const box = document.querySelector(".box");
if (box) {
  document.addEventListener("mousemove", (e) => {
    box.style.left = e.clientX - 100 + "px";
    box.style.top = e.clientY + "px";
  });
}

// ========== МОДАЛЬНОЕ ОКНО "ПОДБЕРИ КАПСУЛУ" ==========
document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("show-button");
  const closeIcon = document.getElementById("closeIconBtn");
  const modalOverlay = document.getElementById("overlay");
  const popupSection = document.getElementById("popupSection");
  const popupTitle = document.getElementById("popupTitle");
  const popupImage = document.getElementById("popupImage");
  const extraText = document.getElementById("extraText");

  const sliderThumb = document.querySelector(".stepped-slider .slider-thumb");
  const sliderTrack = document.querySelector(".stepped-slider .slider-track");
  const grustno = document.querySelector(".grustno .switch_input");
  const veselo = document.querySelector(".veselo .switch_input");

  let contentReady = false;

  function getMg() {
    if (!sliderThumb || !sliderTrack) return 0;
    const trackRect = sliderTrack.getBoundingClientRect();
    const thumbRect = sliderThumb.getBoundingClientRect();
    const percent = (thumbRect.left - trackRect.left) / trackRect.width;
    return Math.min(25, Math.max(0, Math.round(percent * 25)));
  }

  function getResult() {
    const mg = getMg();
    const isGrustno = grustno ? grustno.checked : false;
    const isVeselo = veselo ? veselo.checked : false;
    let mood = "neutral";
    if (isGrustno && !isVeselo) mood = "sad";
    if (!isGrustno && isVeselo) mood = "happy";
    let dosage = mg <= 8 ? "low" : mg <= 17 ? "medium" : "high";
    const map = {
      sad_low: { img: "capsuleBlue5.png", text: "КАПСУЛА SOMNIA" },
      sad_medium: { img: "capsuleBlue-Green3.svg", text: "КАПСУЛА ECHO" },
      sad_high: { img: "capsuleGreen2.svg", text: "КАПСУЛА KAIRO" },
      happy_low: { img: "capsuleOrange1.svg", text: "КАПСУЛА NOVA" },
      happy_medium: { img: "capsulePeach4.svg", text: "КАПСУЛА ARBO" },
      happy_high: { img: "capsulePink6.png", text: "КАПСУЛА MOLIRA" },
    };
    const key = `${mood}_${dosage}`;
    const fallback = { img: "capsulePeach4.svg", text: "КАПСУЛА ARBO" };
    return map[key] || fallback;
  }

  function showLoading() {
    if (popupTitle) popupTitle.textContent = "ИДЁТ ПОДБОР...";
    if (popupImage) {
      popupImage.src = "images/strelka.svg";
      popupImage.classList.add("spinning");
    }
    if (extraText) extraText.innerHTML = "";
    contentReady = false;
  }

  function showResult() {
    const res = getResult();
    if (popupTitle) popupTitle.textContent = "ВАМ ПОДХОДИТ КАПСУЛА:";
    if (popupImage) {
      popupImage.classList.remove("spinning");
      popupImage.src = `images/${res.img}`;
    }
    if (extraText)
      extraText.innerHTML = `<div class="recommendation-card"><p>${res.text}</p></div>`;
    contentReady = true;
  }

  function openModal() {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = scrollbarWidth + "px";
    document.body.classList.add("modal-open");
    showLoading();
    setTimeout(() => {
      if (document.body.classList.contains("modal-open")) showResult();
    }, 3000);
  }

  function closeModal() {
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    if (popupImage) popupImage.classList.remove("spinning");
    contentReady = false;
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeIcon) closeIcon.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("modal-open"))
      closeModal();
  });

  // Обновление результата при изменении слайдеров (если окно открыто)
  const updateIfOpen = () => {
    if (document.body.classList.contains("modal-open") && contentReady)
      showResult();
  };
  if (sliderThumb) {
    new MutationObserver(updateIfOpen).observe(sliderThumb, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
  if (grustno) grustno.addEventListener("change", updateIfOpen);
  if (veselo) veselo.addEventListener("change", updateIfOpen);
});

// ========== ОВЕРЛЕЙ КАРТОЧЕК НАСТРОЕНИЯ ==========
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".moodCard");
  const overlay = document.getElementById("fullscreenOverlay");
  const bg = document.getElementById("fullscreenBackground");
  const floatingImg = document.getElementById("floatingImage");
  const title = document.getElementById("floatingTitle");
  const desc = document.getElementById("floatingDescription");
  const closeBtn = document.getElementById("closeBtn");

  const data = {
    0: {
      title: "КАПСУЛА ECHO",
      bg: "images/photoCalm.jpg",
      img: "images/capsuleGreen2.svg",
      desc: "позволяет нам ясно мыслить и принимать взвешенные решения",
    },
    1: {
      title: "КАПСУЛА NOVA",
      bg: "images/photoHappy.jpg",
      img: "images/capsuleOrange1.svg",
      desc: "делает жизнь ярче и наполняет её смыслом",
    },
    2: {
      title: "КАПСУЛА SOMNIA",
      bg: "images/photoSad.jpg",
      img: "images/capsuleBlue5.png",
      desc: "поможет сомредоточиться на работе и учёбе",
    },
    3: {
      title: "КАПСУЛА MOLIRA",
      bg: "images/photoNostalgic.jpg",
      img: "images/capsulePink6.png",
      desc: "связывает нас с важными моментами прошлого",
    },
  };

  function openOverlay(idx) {
    const d = data[idx];
    if (!d || !overlay) return;
    const scrollY = window.scrollY;
    bg.style.backgroundImage = `url('${d.bg}')`;
    floatingImg.src = d.img;
    title.textContent = d.title;
    desc.textContent = d.desc;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }

  function closeOverlay() {
    if (!overlay) return;
    const scrollY = document.body.style.top;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    setTimeout(() => {
      if (!overlay.classList.contains("active")) bg.style.backgroundImage = "";
    }, 300);
  }

  cards.forEach((card, i) =>
    card.addEventListener("click", () => openOverlay(i)),
  );
  if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
  if (overlay)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("active"))
      closeOverlay();
  });
});
