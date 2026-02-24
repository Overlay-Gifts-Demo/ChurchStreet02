/* ======================================================
   JEWELS-AI | FINAL STABLE DRIVE AR ENGINE
   Manual MindAR Start + Clean Permission Flow
====================================================== */

const API_KEY = "AIzaSyC35sqqZA1YaxZ-F4PJaDqQpKBxPyMKOzw";
const FOLDER_ID = "1fDj4lVzWcrXJnIQnljrC4-_SBEEV1dlz";

/* ===============================
   GOOGLE DRIVE FETCH
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
   MAIN AR ENGINE
================================ */
window.addEventListener("DOMContentLoaded", () => {

  const sceneEl    = document.querySelector("#ar-scene");
  const videoEl    = document.querySelector("#ar-video");
  const videoPlane = document.querySelector("#videoPlane");
  const target     = document.querySelector("#example-target");
  const curtain    = document.querySelector("#blackCurtain");
  const ui         = document.querySelector("#ui");
  const playBtn    = document.querySelector("#playBtn");

  let videoLoaded = false;
  let curtainRemoved = false;

  /* ===============================
     REVEAL FUNCTION
  =================================*/
  function revealScanner() {
    if (curtainRemoved) return;
    curtainRemoved = true;

    curtain.style.opacity = "0";
    setTimeout(() => {
      curtain.style.display = "none";
      if (ui) ui.style.display = "block";
    }, 500);
  }

  /* ===============================
     SAFETY TIMER (Fallback)
  =================================*/
  const safetyTimer = setTimeout(() => {
    console.warn("JEWELS-AI: Safety reveal triggered.");
    revealScanner();
  }, 6000);

  /* ===============================
     MANUAL MINDAR START
  =================================*/
  sceneEl.addEventListener("loaded", async () => {

    const mindarSystem = sceneEl.systems["mindar-image"];

    try {
      await mindarSystem.start();
      console.log("MindAR Started Successfully");
    } catch (err) {
      console.error("MindAR Start Error:", err);
      revealScanner();
    }
  });

  /* ===============================
     MINDAR EVENTS
  =================================*/
  sceneEl.addEventListener("arReady", () => {
    console.log("AR Ready");
    clearTimeout(safetyTimer);
    revealScanner();
  });

  sceneEl.addEventListener("renderstart", () => {
    console.log("Camera Render Started");
    clearTimeout(safetyTimer);
    revealScanner();
  });

  sceneEl.addEventListener("arError", () => {
    console.error("AR Error - Camera permission denied?");
    clearTimeout(safetyTimer);
    revealScanner();
  });

  /* ===============================
     TARGET TRACKING
  =================================*/
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
    videoPlane.setAttribute("visible", false);
  });

  /* ===============================
     VIDEO PLAY CONTROL
  =================================*/
  videoEl.addEventListener("playing", () => {
    videoPlane.setAttribute("visible", true);
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      videoEl.play();
      ui.style.display = "none";
    });
  }

});

/* ===============================
   DISABLE RIGHT CLICK
================================ */
document.addEventListener("contextmenu", (e) => e.preventDefault());