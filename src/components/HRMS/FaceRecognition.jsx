import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import apiService from "../../services/api";

const FaceRecognition = ({ onFaceMatched, employee, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState("Initializing...");
  const [matchScore, setMatchScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadModelsAndEmployee();
    return () => {
      stopVideo();
    };
  }, [employee]);

  const loadModelsAndEmployee = async () => {
    await loadModels();
    if (employee) {
      await loadEmployeeFaceData();
    }
  };

  const loadModels = async () => {
    try {
      setRecognitionStatus("Loading face recognition models...");
      setIsLoading(true);

      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      console.log("✅ Face recognition models loaded successfully");
      setModelsLoaded(true);
      setRecognitionStatus("Models loaded. Starting camera...");
      startVideo();
    } catch (error) {
      console.error("Error loading models:", error);
      setError(
        "Face detection models not available. Please ensure models are in /public/models/"
      );
      setRecognitionStatus(
        "Models not available. Cannot proceed with face recognition."
      );
      setIsLoading(false);
    }
  };

  const loadEmployeeFaceData = async () => {
    try {
      if (!employee._id) {
        console.error("No employee ID provided");
        return;
      }

      // Try to get stored face descriptor from employee data
      if (employee.faceEmbedding && Array.isArray(employee.faceEmbedding)) {
        setStoredDescriptor(new Float32Array(employee.faceEmbedding));
        console.log("✅ Loaded face descriptor from employee data");
      } else if (employee.faceImage) {
        // If we have face image but no descriptor, generate it
        console.log("Generating descriptor from stored face image...");
        await generateDescriptorFromImage(employee.faceImage);
      } else {
        setError(
          "No face data found for this employee. Please update employee profile with face image."
        );
        setRecognitionStatus("No face data available for verification.");
      }
    } catch (error) {
      console.error("Error loading employee face data:", error);
      setError("Failed to load employee face data");
    }
  };

  const generateDescriptorFromImage = async (imageUrl) => {
    try {
      // Construct full image URL
      const fullImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${apiService.axios.defaults.baseURL.replace(
            "/api",
            ""
          )}/${imageUrl}`;

      const img = await faceapi.fetchImage(fullImageUrl);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setStoredDescriptor(detection.descriptor);
        console.log("✅ Generated descriptor from stored image");
      } else {
        console.warn("No face detected in stored image");
      }
    } catch (error) {
      console.error("Error generating descriptor from image:", error);
    }
  };

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
          setRecognitionStatus('Camera active. Click "Scan Face" to verify.');
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          setRecognitionStatus(
            "Camera access denied. Please allow camera permissions."
          );
          setError("Camera not available");
          setIsLoading(false);
        });
    } else {
      setRecognitionStatus("Camera not supported on this device.");
      setError("Camera not supported");
      setIsLoading(false);
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndRecognize = async () => {
    if (!modelsLoaded) {
      setError("Models not loaded yet. Please wait...");
      return;
    }

    if (!storedDescriptor) {
      setError("No stored face data available for comparison");
      setRecognitionStatus("Cannot verify - no reference face data found");
      return;
    }

    setIsLoading(true);
    setRecognitionStatus("Detecting face...");

    try {
      // Detect face in video
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setRecognitionStatus(
          "No face detected. Please position your face clearly in the camera."
        );
        setIsLoading(false);
        return;
      }

      setRecognitionStatus("Face detected. Comparing...");

      // Calculate distance between descriptors
      const distance = faceapi.euclideanDistance(
        detection.descriptor,
        storedDescriptor
      );

      // Convert distance to confidence score (0-100%)
      // Lower distance = higher match
      // Typical threshold is 0.6 (60% match)
      const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
      const threshold = 60; // 60% confidence threshold

      setMatchScore(confidence);

      console.log("Face matching results:", {
        distance: distance.toFixed(4),
        confidence: confidence.toFixed(2) + "%",
        threshold: threshold + "%",
        matched: confidence >= threshold,
      });

      if (confidence >= threshold) {
        setRecognitionStatus(
          `✅ Face verified! Confidence: ${confidence.toFixed(1)}%`
        );

        // Draw detection on canvas
        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetection = faceapi.resizeResults(
            detection,
            displaySize
          );

          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          // Draw green box for successful match
          faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);
        }

        setTimeout(() => {
          onFaceMatched(true, confidence);
        }, 1500);
      } else {
        setRecognitionStatus(
          `❌ Face does not match. Confidence: ${confidence.toFixed(
            1
          )}% (Required: ${threshold}%)`
        );
        onFaceMatched(false, confidence);
      }
    } catch (error) {
      console.error("Face recognition error:", error);
      setRecognitionStatus("Error during face recognition. Please try again.");
      setError(error.message);
      onFaceMatched(false, 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Face Recognition Verification
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {employee && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">
              Verifying: {employee.name}
            </p>
            <p className="text-sm text-blue-600">
              {employee.designation} - {employee.department}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden mb-4"
          style={{ height: "400px" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Processing...</p>
              </div>
            </div>
          )}

          {!modelsLoaded && !error && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-pulse mb-2">⏳</div>
                <p>Loading AI models...</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p
              className={`font-medium text-lg ${
                recognitionStatus.includes("✅")
                  ? "text-green-600"
                  : recognitionStatus.includes("❌")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {recognitionStatus}
            </p>
            {matchScore > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      matchScore >= 60 ? "bg-green-600" : "bg-red-600"
                    }`}
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Match Confidence: {matchScore.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={captureAndRecognize}
              disabled={isLoading || !modelsLoaded || error}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Scan Face
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 Tips for best results:</p>
            <p>• Ensure good lighting on your face</p>
            <p>• Look directly at the camera</p>
            <p>• Remove glasses or masks if possible</p>
            <p>• Keep your face centered in the frame</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
