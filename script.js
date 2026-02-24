/* ===============================
   JEWELS-AI | AR INTERACTION LOGIC
   "Shield-Reveal" Version
================================ */
window.addEventListener("load", async () => {
  const videoEl = document.querySelector("#ar-video") || document.querySelector("#driveVideo");
  const videoPlane = document.querySelector("#videoPlane"); 
  const target = document.querySelector("#example-target") || document.querySelector("#target1");
  const playBtn = document.querySelector("#playBtn");
  const ui = document.querySelector("#ui");
  const curtain = document.querySelector("#blackCurtain");
  const sceneEl = document.querySelector('a-scene');

  let videoReady = false;
  let isRevealed = false;

  // 1. REVEAL FUNCTION: Fades out the black shield
  const revealScanner = () => {
    if (isRevealed) return;
    isRevealed = true;
    
    if (curtain) {
      curtain.style.opacity = "0";
      setTimeout(() => {
        curtain.style.display = "none";
        if (ui) ui.style.display = "block"; // Show the START button
      }, 500);
    }
  };

  // 2. SAFETY TIMER: If arReady fails to fire in 6 seconds, force reveal.
  // This allows you to see camera permission pop-ups or errors.
  const safetyTimeout = setTimeout(() => {
    console.log("JEWELS-AI: Safety trigger opening curtain.");
    revealScanner();
  }, 6000);

  // 3. READY LISTENERS: Open curtain when engine OR camera is ready
  sceneEl.addEventListener("arReady", () => {
    console.log("JEWELS-AI: AR Ready.");
    clearTimeout(safetyTimeout);
    revealScanner();
  });

  sceneEl.addEventListener("renderstart", () => {
    console.log("JEWELS-AI: Rendering started.");
    clearTimeout(safetyTimeout);
    revealScanner();
  });

  // 4. VIDEO LOGIC
  videoEl.addEventListener('playing', () => {
    if (videoPlane) videoPlane.setAttribute('visible', 'true');
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      videoEl.play();
      playBtn.parentElement.style.display = "none"; 
    });
  }
});