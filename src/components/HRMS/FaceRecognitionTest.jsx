// import React, { useState } from "react";
// import FaceCapture from "./FaceCapture";
// import { Camera, CheckCircle } from "lucide-react";

// /**
//  * Test component to verify face capture functionality
//  * This can be used to test the face capture system independently
//  */
// const FaceRecognitionTest = () => {
//   const [showCapture, setShowCapture] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [capturedFile, setCapturedFile] = useState(null);

//   const handleCapture = (file, preview) => {
//     setCapturedFile(file);
//     setCapturedImage(preview);
//     setShowCapture(false);
//     console.log("Captured file:", file);
//     console.log("File size:", file.size, "bytes");
//     console.log("File type:", file.type);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             Face Recognition Test
//           </h1>
//           <p className="text-gray-600 mb-8">
//             Test the face capture functionality before using in production
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Capture Section */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Capture Face
//               </h2>
//               <button
//                 onClick={() => setShowCapture(true)}
//                 className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
//               >
//                 <Camera className="w-5 h-5 mr-2" />
//                 Open Camera
//               </button>

//               {capturedFile && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex items-center text-green-800 mb-2">
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                     <span className="font-semibold">Image Captured!</span>
//                   </div>
//                   <div className="text-sm text-green-700 space-y-1">
//                     <p>File name: {capturedFile.name}</p>
//                     <p>File size: {(capturedFile.size / 1024).toFixed(2)} KB</p>
//                     <p>File type: {capturedFile.type}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Preview Section */}
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
//                 {capturedImage ? (
//                   <img
//                     src={capturedImage}
//                     alt="Captured face"
//                     className="max-w-full max-h-[400px] rounded-lg"
//                   />
//                 ) : (
//                   <div className="text-center text-gray-400">
//                     <Camera className="w-16 h-16 mx-auto mb-2" />
//                     <p>No image captured yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Instructions */}
//           <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
//             <h3 className="text-lg font-semibold text-blue-800 mb-3">
//               Testing Instructions
//             </h3>
//             <ol className="list-decimal list-inside space-y-2 text-blue-700">
//               <li>Click "Open Camera" to start the face capture</li>
//               <li>Allow camera permissions when prompted</li>
//               <li>Position your face in the camera view</li>
//               <li>Click "Capture Photo" when ready</li>
//               <li>Review the captured image</li>
//               <li>Click "Use This Photo" to confirm</li>
//               <li>Check the file details displayed</li>
//             </ol>
//           </div>

//           {/* System Check */}
//           <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-3">
//               System Check
//             </h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex items-center">
//                 <span className="w-40 text-gray-600">Camera Access:</span>
//                 <span className="text-gray-800">
//                   {navigator.mediaDevices ? "✓ Available" : "✗ Not Available"}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <span className="w-40 text-gray-600">HTTPS:</span>
//                 <span className="text-gray-800">
//                   {window.location.protocol === "https:"
//                     ? "✓ Secure"
//                     : "⚠ Not Secure (Camera may not work)"}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <span className="w-40 text-gray-600">Browser:</span>
//                 <span className="text-gray-800">
//                   {navigator.userAgent.includes("Chrome")
//                     ? "Chrome"
//                     : navigator.userAgent.includes("Firefox")
//                     ? "Firefox"
//                     : navigator.userAgent.includes("Safari")
//                     ? "Safari"
//                     : navigator.userAgent.includes("Edge")
//                     ? "Edge"
//                     : "Other"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Face Capture Modal */}
//       {showCapture && (
//         <FaceCapture
//           onCapture={handleCapture}
//           onClose={() => setShowCapture(false)}
//           employeeName="Test User"
//         />
//       )}
//     </div>
//   );
// };

// export default FaceRecognitionTest;

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/**
 * Test component to verify face capture functionality
 * This can be used to test the face capture system independently
 */
const FaceRecognitionTest = () => {
  const [showCapture, setShowCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);

  const handleCapture = (file, preview, descriptor) => {
    setCapturedFile(file);
    setCapturedImage(preview);
    setShowCapture(false);
    console.log("✅ Image captured successfully:");
    console.log("File:", file);
    console.log("File size:", file.size, "bytes");
    console.log("File type:", file.type);
    console.log("Face descriptor:", descriptor ? "Generated" : "Not available");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Face Recognition Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the face capture functionality before using in production
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capture Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Capture Face
              </h2>
              <button
                onClick={() => setShowCapture(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </button>

              {capturedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">
                      Image Captured Successfully!
                    </span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>File name: {capturedFile.name}</p>
                    <p>File size: {(capturedFile.size / 1024).toFixed(2)} KB</p>
                    <p>File type: {capturedFile.type}</p>
                    <p>Resolution: {capturedImage ? "640x480" : "Unknown"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
                {capturedImage ? (
                  <div className="text-center">
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="max-w-full max-h-[250px] rounded-lg mx-auto mb-3 border-2 border-green-200"
                    />
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Image ready for use
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>No image captured yet</p>
                    <p className="text-xs mt-1">Click "Open Camera" to start</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Testing Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Click "Open Camera" to start the face capture</li>
              <li>Allow camera permissions when prompted</li>
              <li>Position your face in the camera view</li>
              <li>Click "Capture Photo" when ready</li>
              <li>Review the captured image</li>
              <li>Click "Use This Photo" to confirm</li>
              <li>Check the file details displayed</li>
            </ol>
          </div>

          {/* System Check */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              System Check
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-40 text-gray-600">Camera Access:</span>
                <span className="text-gray-800">
                  {navigator.mediaDevices ? "✅ Available" : "❌ Not Available"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-gray-600">HTTPS:</span>
                <span className="text-gray-800">
                  {window.location.protocol === "https:"
                    ? "✅ Secure"
                    : "⚠ Not Secure (Camera may not work)"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-gray-600">Browser:</span>
                <span className="text-gray-800">
                  {navigator.userAgent.includes("Chrome")
                    ? "Chrome ✅"
                    : navigator.userAgent.includes("Firefox")
                    ? "Firefox ✅"
                    : navigator.userAgent.includes("Safari")
                    ? "Safari ✅"
                    : navigator.userAgent.includes("Edge")
                    ? "Edge ✅"
                    : "Other ⚠"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Face Capture Modal */}
      {showCapture && (
        <FaceCapture
          onCapture={handleCapture}
          onClose={() => setShowCapture(false)}
          employeeName="Test User"
        />
      )}
    </div>
  );
};

// Improved FaceCapture Component with better camera handling
const FaceCapture = ({ onCapture, onClose, employeeName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setStatus("Accessing camera...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          console.log("Camera ready with dimensions:", {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          setCameraReady(true);
          setStatus("Camera ready - Position your face and click Capture");
        };

        videoRef.current.onplay = () => {
          console.log("Video stream started playing");
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      let errorMessage = "Camera access failed. ";

      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions and refresh the page.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotSupportedError") {
        errorMessage += "Camera not supported on this browser.";
      } else {
        errorMessage += err.message || "Please check your camera settings.";
      }

      setError(errorMessage);
      setStatus("Camera not available");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraReady) {
      setError("Camera not ready. Please wait...");
      return;
    }

    setCapturing(true);
    setStatus("Capturing photo...");

    try {
      // Create canvas to capture high-quality image
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get high-quality JPEG image
      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      setCapturedImage(imageData);
      setStatus("Photo captured! Review and confirm.");
      setCapturing(false);

      console.log(
        "Image captured with dimensions:",
        canvas.width,
        "x",
        canvas.height
      );
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo. Please try again.");
      setStatus("Capture failed");
      setCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    setStatus("Camera ready - Position your face and click Capture");
  };

  const confirmCapture = async () => {
    if (!capturedImage) {
      setError("No image to confirm");
      return;
    }

    setCapturing(true);
    setStatus("Processing image...");

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create file from blob
      const file = new File(
        [blob],
        `${employeeName || "user"}_face_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      console.log("File created:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Call parent callback with file and image data
      onCapture(file, capturedImage, null);
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process image");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Capture Face Photo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={capturing}>
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {employeeName && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">
              Capturing for: {employeeName}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Camera Section */}
        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 mx-auto"
          style={{
            width: "100%",
            maxWidth: "640px",
            height: "480px",
          }}>
          {!capturedImage ? (
            // Live Camera View
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }} // Mirror effect
              />

              {/* Camera Overlay */}
              {!cameraReady && !error && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}

              {/* Face Guide Overlay */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-green-400 border-dashed rounded-full w-48 h-48 opacity-70"></div>
                </div>
              )}
            </>
          ) : (
            // Captured Image Preview
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }} // Mirror to match camera view
            />
          )}

          {capturing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Processing...</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <p
            className={`font-medium ${
              status.includes("ready") || status.includes("captured")
                ? "text-green-600"
                : status.includes("failed") || status.includes("error")
                ? "text-red-600"
                : "text-gray-600"
            }`}>
            {status}
          </p>
        </div>

        <div className="flex space-x-3">
          {!capturedImage ? (
            <>
              <button
                onClick={capturePhoto}
                disabled={capturing || !cameraReady || error}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                {capturing ? "Capturing..." : "Capture Photo"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                disabled={capturing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                {capturing ? "Processing..." : "Use This Photo"}
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600 text-center space-y-1">
          <p className="font-medium">💡 Tips for best photo:</p>
          <p>• Ensure good lighting on your face</p>
          <p>• Look directly at the camera</p>
          <p>• Keep your face centered in the circle</p>
          <p>• Maintain a neutral expression</p>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionTest;
