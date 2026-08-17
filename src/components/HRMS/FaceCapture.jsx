import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Camera, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const FaceCapture = ({ onCapture, onClose, employeeName }) => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
    return () => {
      // Cleanup
    };
  }, []);

  const loadModels = async () => {
    try {
      setStatus("Loading face detection models...");

      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      setStatus("Ready to capture. Please look at the camera.");
    } catch (error) {
      console.error("Error loading models:", error);
      setError(
        "Face detection models not available. You can still capture the image."
      );
      setModelsLoaded(true); // Allow capture even without models
      setStatus("Ready to capture (face detection disabled)");
    }
  };

  const detectFace = async (imageSrc) => {
    try {
      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection;
    } catch (error) {
      console.error("Face detection error:", error);
      return null;
    }
  };

  const capturePhoto = async () => {
    if (!webcamRef.current) return;

    setCapturing(true);
    setStatus("Capturing...");

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setError("Failed to capture image");
      setCapturing(false);
      return;
    }

    setCapturedImage(imageSrc);

    // Try to detect face
    if (modelsLoaded && !error) {
      setStatus("Detecting face...");
      const detection = await detectFace(imageSrc);

      if (detection) {
        setFaceDetected(true);
        setStatus("Face detected successfully!");
      } else {
        setFaceDetected(false);
        setStatus("No face detected. You can still use this image or retake.");
      }
    } else {
      setStatus("Image captured. Face detection not available.");
    }

    setCapturing(false);
  };

  const retake = () => {
    setCapturedImage(null);
    setFaceDetected(false);
    setStatus("Ready to capture. Please look at the camera.");
  };

  const confirmCapture = async () => {
    if (capturedImage) {
      try {
        setStatus("Processing face data...");

        // Convert base64 to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `${employeeName || "employee"}_face.jpg`,
          { type: "image/jpeg" }
        );

        // Generate face descriptor if models are loaded
        let faceDescriptor = null;
        if (modelsLoaded && !error) {
          try {
            const img = await faceapi.fetchImage(capturedImage);
            const detection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              faceDescriptor = Array.from(detection.descriptor);
              console.log("✅ Face descriptor generated successfully");
            }
          } catch (descriptorError) {
            console.warn(
              "Could not generate face descriptor:",
              descriptorError
            );
          }
        }

        // Pass both file and descriptor to parent
        onCapture(file, capturedImage, faceDescriptor);
      } catch (error) {
        console.error("Error processing captured image:", error);
        setError("Failed to process captured image");
      }
    }
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Capture Employee Face
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={capturing}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {employeeName && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">
              Employee: {employeeName}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <div
          className="relative bg-gray-200 rounded-lg overflow-hidden mb-4"
          style={{ height: "400px" }}
        >
          {!capturedImage ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
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

          {capturedImage && faceDetected && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Face Detected
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <p
            className={`font-medium ${
              status.includes("success")
                ? "text-green-600"
                : status.includes("No face")
                ? "text-yellow-600"
                : "text-gray-600"
            }`}
          >
            {status}
          </p>
        </div>

        <div className="flex space-x-3">
          {!capturedImage ? (
            <>
              <button
                onClick={capturePhoto}
                disabled={capturing || !modelsLoaded}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                {capturing ? "Capturing..." : "Capture Photo"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Use This Photo
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Tips: Ensure good lighting and look directly at the camera</p>
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;
