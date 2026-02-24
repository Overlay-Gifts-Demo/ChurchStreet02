/* ======================================================
   JEWELS-AI | AR INTERACTION LOGIC
   "Shield-Reveal" Version - FORCE OPEN FIX
====================================================== */
window.addEventListener("load", async () => {
  // Elements
  const videoEl = document.querySelector("#ar-video") || document.querySelector("#driveVideo");
  const videoPlane = document.querySelector("#videoPlane"); 
  const target = document.querySelector("#example-target") || document.querySelector("#target1");
  const playBtn = document.querySelector("#playBtn");
  const ui = document.querySelector("#ui");
  const curtain = document.querySelector("#blackCurtain");
  const sceneEl = document.querySelector('a-scene');

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

  // 2. SAFETY TIMER: Force reveal after 6 seconds if arReady fails.
  // This ensures you see camera permission pop-ups.
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
      // Hide button once experience starts
      playBtn.parentElement.style.display = "none"; 
    });
  }
});