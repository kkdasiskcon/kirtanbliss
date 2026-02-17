# Google Apps Script Setup for Direct Sheet Updates

## Step 1: Create Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/10qWembXtU9am4Z9olH3MMdtEaM-mar0agktECZJrLUw/edit
2. Click **Extensions** → **Apps Script**
3. Delete any existing code and paste this code:

```javascript
function doPost(e) {
  try {
    // Handle both JSON and form data
    let devoteeName;
    if (e.postData && e.postData.contents) {
      try {
        const jsonData = JSON.parse(e.postData.contents);
        devoteeName = jsonData.devoteeName;
      } catch (e) {
        // Try form data
        const params = e.parameter;
        devoteeName = params.devoteeName;
      }
    } else if (e.parameter) {
      devoteeName = e.parameter.devoteeName;
    }
    
    if (!devoteeName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Devotee name is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "Master" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the row with the devotee name
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nameColIndex = headers.indexOf('Devotee Name') + 1;
    const lastSungColIndex = headers.indexOf('Last Sung Date') + 1;
    const timesSungColIndex = headers.indexOf('Times Sung') + 1;
    
    if (nameColIndex === 0 || lastSungColIndex === 0 || timesSungColIndex === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Required columns not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the row
    const dataRange = sheet.getRange(2, nameColIndex, sheet.getLastRow() - 1, 1);
    const names = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < names.length; i++) {
      if (names[i][0] && names[i][0].toString().trim() === devoteeName.trim()) {
        rowIndex = i + 2; // +2 because header is row 1, and array is 0-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Devotee not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update Last Sung Date
    const today = new Date();
    const dateStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    sheet.getRange(rowIndex, lastSungColIndex).setValue(dateStr);
    
    // Update Times Sung
    const currentTimes = sheet.getRange(rowIndex, timesSungColIndex).getValue();
    const newTimes = (parseInt(currentTimes) || 0) + 1;
    sheet.getRange(rowIndex, timesSungColIndex).setValue(newTimes);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Sheet updated successfully',
      lastSungDate: dateStr,
      timesSung: newTimes
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Google Sheets Update API is running').setMimeType(ContentService.MimeType.TEXT);
}
```

## Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" → **Web app**
3. Set:
   - **Description**: "Kirtan App Update API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (important!)
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this!
6. Click **Authorize access** and grant permissions
7. Click **Done**

## Step 3: Update Your React App

After deployment, you'll get a URL like:
`https://script.google.com/macros/s/AKfycby.../exec`

Add this URL to your `.env` file or directly in App.jsx as `GOOGLE_SCRIPT_URL`

## Security Note

The script will only work if:
- The Google Sheet is owned by you or shared with edit access
- The Web App is deployed with "Anyone" access
- You've authorized the script to run
