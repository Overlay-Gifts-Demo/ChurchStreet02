/* ======================================================
   JEWELS-AI | ULTRA FAST DRIVE AR ENGINE
   "Loop-Breaker" Version - Permissions Fix
====================================================== */

const API_KEY = "AIzaSyC35sqqZA1YaxZ-F4PJaDqQpKBxPyMKOzw";
const FOLDER_ID = "1fDj4lVzWcrXJnIQnljrC4-_SBEEV1dlz";

/* ===============================
   OPTIMIZED CHROMA KEY SHADER
================================ */
AFRAME.registerShader('chromakey', {
  schema: {
    src: { type: 'map' },
    color: { type: 'color', default: '#00FF00' },
    threshold: { type: 'number', default: 0.3 },
    smoothness: { type: 'number', default: 0.05 }
  },
  init: function (data) {
    const videoTexture = new THREE.VideoTexture(data.src);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: videoTexture },
        keyColor: { value: new THREE.Color(data.color) },
        similarity: { value: data.threshold },
        smoothness: { value: data.smoothness }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tex;
        uniform vec3 keyColor;
        uniform float similarity;
        uniform float smoothness;
        varying vec2 vUv;
        void main() {
          vec4 videoColor = texture2D(tex, vUv);
          float diff = distance(videoColor.rgb, keyColor);
          float alpha = smoothstep(similarity, similarity + smoothness, diff);
          float dToCenter = distance(vUv, vec2(0.5, 0.5));
          if (alpha < 0.1 || dToCenter > 0.5) discard;
          gl_FragColor = vec4(videoColor.rgb, alpha);
        }
      `,
      transparent: true
    });
  }
});

/* ===============================
   FAST DRIVE FETCH
================================ */
async function getLatestVideo() {
  try {
    const cachedId = localStorage.getItem("latestVideoId");
    if (cachedId) return cachedId;
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'video/'&orderBy=modifiedTime desc&pageSize=1&fields=files(id)&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      const fileId = data.files[0].id;
      localStorage.setItem("latestVideoId", fileId);
      return fileId;
    }
    return null;
  } catch (error) {
    console.error("Drive Fetch Error:", error);
    return null;
  }
}

/* ===============================
   AR INTERACTION LOGIC
================================ */
window.addEventListener("load", async () => {
  const videoEl = document.querySelector("#ar-video") || document.querySelector("#driveVideo");
  const videoPlane = document.querySelector("#videoPlane") || document.querySelector("#videoCircle");
  const target = document.querySelector("#example-target") || document.querySelector("#target1");
  const playBtn = document.querySelector("#playBtn");
  const ui = document.querySelector("#ui") || document.querySelector("#planButtons");
  const curtain = document.querySelector("#blackCurtain");
  const sceneEl = document.querySelector('a-scene');

  let isRevealed = false;
  let videoLoaded = false;

  // 1. REVEAL FUNCTION: Safely fades out the curtain
  const revealScanner = () => {
    if (isRevealed) return;
    isRevealed = true;
    if (curtain) {
      curtain.style.opacity = "0";
      setTimeout(() => {
        curtain.style.display = "none";
        if (ui) ui.style.display = "block"; 
      }, 500);
    }
  };

  // 2. THE LOOP BREAKER: Force reveal after 4 seconds to show permissions
  const loopBreaker = setTimeout(() => {
    console.warn("JEWELS-AI: Triggering loop breaker for permissions.");
    revealScanner();
  }, 4000);

  // 3. READY LISTENERS
  sceneEl.addEventListener("arReady", () => {
    clearTimeout(loopBreaker);
    revealScanner();
  });

  sceneEl.addEventListener("renderstart", () => {
    clearTimeout(loopBreaker);
    revealScanner();
  });

  // Handle errors (like user clicking 'Block')
  sceneEl.addEventListener("arError", () => {
    clearTimeout(loopBreaker);
    revealScanner();
    console.error("JEWELS-AI: AR Error - Check camera permissions.");
  });

  // 4. VIDEO & TRACKING LOGIC
  videoEl.addEventListener('playing', () => {
    if (videoPlane) videoPlane.setAttribute('visible', 'true');
  });

  target.addEventListener("targetFound", async () => {
    if (!videoLoaded) {
      const fileId = await getLatestVideo();
      if (fileId) {
        videoEl.src = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
        videoEl.load();
        videoLoaded = true;
      }
    }
  });

  target.addEventListener("targetLost", () => {
    videoEl.pause();
    if (videoPlane) videoPlane.setAttribute('visible', 'false'); 
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      videoEl.play();
      ui.style.display = "none"; 
    });
  }
});

document.addEventListener("contextmenu", (e) => e.preventDefault());