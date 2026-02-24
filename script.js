const CLOUD_NAME = "djqmdd52k";
const UPLOAD_PRESET = "ar_magnet_preset";
const SHEET_NAME = "Sheet1";

/**
 * JEWELS-AI | Advanced Backend Video Handler
 * Synchronizes Google Sheets data with Cloudinary CDN for ultra-fast AR loading.
 */
function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const responses = e.values; 
  
  if (!responses) {
    console.error("JEWELS-AI Error: No form responses found."); [cite: 7]
    return;
  }

  // Column mapping: [1] Product/Target ID, [2] Drive Video URL
  const productId = responses[1].toLowerCase().trim(); [cite: 7]
  const fileUrl = responses[2]; 

  if (!fileUrl.includes('id=')) {
    console.error("JEWELS-AI Error: Invalid Drive URL format."); [cite: 7]
    return;
  }

  try {
    // 1. Fetching the high-quality video blob from Google Drive
    const fileId = fileUrl.split('id=')[1].split('&')[0]; // Enhanced split to handle extra parameters 
    const file = DriveApp.getFileById(fileId); [cite: 7]
    const blob = file.getBlob(); [cite: 7]

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`; [cite: 7]
    
    // 2. Preparing the payload for the Cloudinary high-speed CDN
    const payload = {
      file: blob,
      upload_preset: UPLOAD_PRESET,
      public_id: productId, // Maps the video directly to your AR marker ID 
      resource_type: "video",
      overwrite: true // Ensures you can update the video for a specific marker 
    };

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true [cite: 7]
    };

    // 3. Executing the upload
    console.log(`Starting sync for Product ID: ${productId}...`); [cite: 7]
    const response = UrlFetchApp.fetch(cloudinaryUrl, options); [cite: 7]
    const result = JSON.parse(response.getContentText()); [cite: 7]
    
    if (result.secure_url) {
      // 4. Updating the sheet with the fast-loading CDN link
      const lastRow = sheet.getLastRow(); [cite: 7]
      sheet.getRange(lastRow, 3).setValue(result.secure_url); [cite: 7]
      console.log("SUCCESS! Asset available on CDN: " + result.secure_url); [cite: 7]
    } else {
      console.error("Cloudinary Sync Rejected: " + response.getContentText()); [cite: 7]
    }

  } catch (error) {
    console.error("Critical Backend Error: " + error.toString()); [cite: 7]
  }
}