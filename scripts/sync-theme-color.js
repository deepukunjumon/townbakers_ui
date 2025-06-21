const fs = require('fs');
const path = require('path');

// Function to extract primary color from theme.js
function extractPrimaryColor() {
  try {
    const themePath = path.join(__dirname, '../src/theme.js');
    const themeContent = fs.readFileSync(themePath, 'utf8');
    
    const primaryColorMatch = themeContent.match(/primary:\s*{\s*main:\s*"([^"]+)"/);
    
    if (primaryColorMatch && primaryColorMatch[1]) {
      return primaryColorMatch[1];
    } else {
      console.error('Could not find primary color in theme.js');
      return '#03A791';
    }
  } catch (error) {
    console.error('Error reading theme.js:', error);
    return '#03A791';
  }
}

// Function to update HTML file
function updateHtmlFile(primaryColor) {
  try {
    const htmlPath = path.join(__dirname, '../public/index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    htmlContent = htmlContent.replace(
      /<meta name="theme-color" content="[^"]*"/,
      `<meta name="theme-color" content="${primaryColor}"`
    );
    
    fs.writeFileSync(htmlPath, htmlContent);
  } catch (error) {
    console.error('Error updating index.html:', error);
  }
}

function updateManifestFile(primaryColor) {
  try {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    manifest.theme_color = primaryColor;
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.error('Error updating manifest.json:', error);
  }
}

// Main function
function syncThemeColor() {
  console.log('Syncing theme color from theme.js...');
  
  const primaryColor = extractPrimaryColor();
  console.log(`Extracted primary color: ${primaryColor}`);
  
  updateHtmlFile(primaryColor);
  updateManifestFile(primaryColor);
  }

// Run the script
syncThemeColor(); 