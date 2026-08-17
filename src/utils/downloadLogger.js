// Download logger utility for tracking file downloads
export const logDownload = async (
  source,
  fileName,
  fileType,
  fileSize,
  metadata = {}
) => {
  try {
    const downloadLog = {
      timestamp: new Date().toISOString(),
      source,
      fileName,
      fileType,
      fileSize,
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console for debugging
    console.log("Download logged:", downloadLog);

    // Store in localStorage for local tracking
    const existingLogs = JSON.parse(
      localStorage.getItem("downloadLogs") || "[]"
    );
    existingLogs.push(downloadLog);

    // Keep only last 100 downloads
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem("downloadLogs", JSON.stringify(existingLogs));

    // TODO: Send to analytics service if needed
    // await sendToAnalytics(downloadLog);

    return downloadLog;
  } catch (error) {
    console.error("Error logging download:", error);
  }
};

// Get download history
export const getDownloadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem("downloadLogs") || "[]");
  } catch (error) {
    console.error("Error getting download history:", error);
    return [];
  }
};

// Clear download history
export const clearDownloadHistory = () => {
  try {
    localStorage.removeItem("downloadLogs");
    return true;
  } catch (error) {
    console.error("Error clearing download history:", error);
    return false;
  }
};

// Get download statistics
export const getDownloadStats = () => {
  try {
    const logs = getDownloadHistory();

    const stats = {
      totalDownloads: logs.length,
      totalSize: logs.reduce((sum, log) => sum + (log.fileSize || 0), 0),
      bySource: {},
      byFileType: {},
      recentDownloads: logs.slice(-10).reverse(),
    };

    // Group by source
    logs.forEach((log) => {
      stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
    });

    // Group by file type
    logs.forEach((log) => {
      stats.byFileType[log.fileType] =
        (stats.byFileType[log.fileType] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Error getting download stats:", error);
    return {
      totalDownloads: 0,
      totalSize: 0,
      bySource: {},
      byFileType: {},
      recentDownloads: [],
    };
  }
};
