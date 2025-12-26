const axios = require('axios');

module.exports = async (req, res) => {
  // 🔥 YAHAN APNA NAAM LIKHO
  const YOUR_NAME = "Paras chourasiya / TG - @Aotpy";
  
  // CORS enable
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Request parameters
  const { 
    url,
    type = 'auto'
  } = req.query;
  
  // Home/Instructions
  if (!url) {
    return res.json({
      status: "READY",
      service: `All Media Downloader by ${YOUR_NAME}`,
      developer: YOUR_NAME,
      version: "3.0",
      timestamp: new Date().toISOString(),
      
      features: [
        "✅ YouTube Videos (1080p/4K)",
        "✅ Instagram Reels/Posts/Stories",
        "✅ Pinterest Pins/Videos",
        "✅ Automatic Platform Detection",
        "✅ Highest Quality Available",
        "✅ No External References"
      ],
      
      how_to_use: {
        basic: "GET /api/download?url=MEDIA_URL",
        examples: {
          youtube: "/api/download?url=https://youtu.be/wCTmWy43HgM",
          instagram: "/api/download?url=https://instagram.com/p/ABC123",
          pinterest: "/api/download?url=https://pinterest.com/pin/123456"
        }
      },
      
      note: "📱 All downloads in maximum available quality"
    });
  }
  
  try {
    let apiUrl;
    let platform;
    
    // Auto-detect platform
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = "YouTube";
      apiUrl = `https://youtube.stormxdark.tech/api/video/download?url=${encodeURIComponent(url)}&quality=max`;
    } 
    else if (url.includes('instagram.com')) {
      platform = "Instagram";
      apiUrl = `https://youtube.stormxdark.tech/api/video/download?url=${encodeURIComponent(url)}&quality=max`;
    }
    else if (url.includes('pinterest.com') || url.includes('pin.it')) {
      platform = "Pinterest";
      apiUrl = `https://socialdown.itz-ashlynn.workers.dev/pinterest?url=${encodeURIComponent(url)}`;
    }
    else {
      return res.status(400).json({
        error: "Unsupported URL",
        supported: ["YouTube", "Instagram", "Pinterest"],
        example: "/api/download?url=https://youtu.be/VIDEO_ID"
      });
    }
    
    // Fetch from external API
    const response = await axios.get(apiUrl, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    // Clean response - remove external references
    const cleanData = cleanExternalReferences(response.data, platform);
    
    // Final response - ONLY YOUR NAME
    const result = {
      status: "SUCCESS",
      service: "Media Downloader",
      hosted_by: YOUR_NAME,
      requested_url: url,
      platform: platform,
      quality: "Maximum Available",
      download_time: new Date().toISOString(),
      download_links: cleanData.download_links || cleanData,
      note: `Download provided by ${YOUR_NAME}'s Media Service`
    };
    
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      service: "Media Downloader",
      hosted_by: YOUR_NAME,
      error: "Download failed. Please check URL.",
      timestamp: new Date().toISOString()
    });
  }
};

// Function to remove all external references
function cleanExternalReferences(data, platform) {
  if (!data || typeof data !== 'object') return data;
  
  const cleanData = { ...data };
  
  // Remove creator/source/author fields
  const fieldsToRemove = [
    'creator', 'author', 'source', 'api_provider',
    'original_source', 'external_api', 'third_party',
    'credit', 'provided_by', 'source_api'
  ];
  
  fieldsToRemove.forEach(field => {
    delete cleanData[field];
  });
  
  // Platform-specific cleaning
  if (platform === "Pinterest") {
    delete cleanData.creator;
    delete cleanData.source;
  }
  
  // Ensure download links are present
  if (!cleanData.download_links && cleanData.url) {
    cleanData.download_links = {
      video: cleanData.url,
      audio: cleanData.audio_url || null,
      thumbnail: cleanData.thumbnail || null
    };
    delete cleanData.url;
  }
  
  return cleanData;
}
