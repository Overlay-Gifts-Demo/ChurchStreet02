const CLOUD_NAME = "djqmdd52k";
const UPLOAD_PRESET = "ar_magnet_preset";
const SHEET_NAME = "Sheet1";

/**
 * JEWELS-AI | Backend Video Handler
 * Optimized for seamless AR transition
 */
function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const responses = e.values; 
  if (!responses) {
    console.error("No form responses found."); [cite: 7]
    return;
  }

  // productId corresponds to the marker/target ID for the AR engine
  const productId = responses[1].toLowerCase().trim(); [cite: 7]
  const fileUrl = responses[2]; 

  try {
    // Extracting the Google Drive ID to fetch the video blob
    const fileId = fileUrl.split('id=')[1]; [cite: 7]
    const file = DriveApp.getFileById(fileId); [cite: 7]
    const blob = file.getBlob(); [cite: 7]

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`; [cite: 7]
    
    const payload = {
      file: blob,
      upload_preset: UPLOAD_PRESET,
      public_id: productId, // Ensures the video is mapped to the correct AR target
      resource_type: "video" 
    };

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true [cite: 7]
    };

    const response = UrlFetchApp.fetch(cloudinaryUrl, options); [cite: 7]
    const result = JSON.parse(response.getContentText()); [cite: 7]
    
    if (result.secure_url) {
      // Save the high-speed CDN link back to the sheet for the AR engine to fetch
      const lastRow = sheet.getLastRow(); [cite: 7]
      sheet.getRange(lastRow, 3).setValue(result.secure_url); [cite: 7]
      console.log("SUCCESS! JEWELS-AI Asset Synced: " + result.secure_url); [cite: 7]
    } else {
      // Detailed logging to debug upload rejections
      console.error("CLOUDINARY REJECTED UPLOAD: " + response.getContentText()); [cite: 7]
    }

  } catch (error) {
    // Catch-all for Drive permissions or network issues
    console.error("JEWELS-AI SCRIPT ERROR: " + error.toString()); [cite: 7]
  }
}