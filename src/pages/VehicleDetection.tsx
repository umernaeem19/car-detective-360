
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Camera, Play, Square, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const VehicleDetection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        setError(null);
        
        // Display the video in the player
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(file);
        }
      } else {
        setError("Please select a valid video file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        setError(null);
        
        // Display the video in the player
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(file);
        }
      } else {
        setError("Please select a valid video file");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsLiveMode(true);
        setError(null);
      }
    } catch (err) {
      setError("Failed to access webcam. Please ensure you have granted camera permissions.");
      console.error("Error accessing webcam:", err);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsLiveMode(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const processVideo = async () => {
    if (!videoFile && !isLiveMode) {
      setError("Please select a video file or enable webcam first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      // If we're in live mode, capture a frame from the webcam
      if (isLiveMode && videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          const dataURL = canvasRef.current.toDataURL('image/jpeg');
          const blob = await (await fetch(dataURL)).blob();
          const frameFile = new File([blob], "webcam-frame.jpg", { type: "image/jpeg" });
          
          await sendToBackend(frameFile, true);
        }
      } else if (videoFile) {
        // Process the uploaded video file
        await sendToBackend(videoFile, false);
      }
    } catch (err) {
      console.error("Error processing video:", err);
      setError("Failed to process video. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToBackend = async (file: File, isFrame: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_frame', isFrame.toString());
    
    try {
      // Simulate progress (in a real app, you'd use a proper progress API)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Send to backend (adjust the URL to match your Flask backend)
      const response = await fetch('http://localhost:5000/process-video', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setDetectionResults(data.results || []);
      
      toast({
        title: "Processing complete",
        description: `Detected ${data.results?.length || 0} vehicles in the video.`,
      });
      
      // Optionally navigate to results page or show results in this component
      // navigate("/dashboard", { state: { results: data.results } });
    } catch (err) {
      console.error("Backend error:", err);
      setError("Failed to communicate with the backend server. Make sure it's running at http://localhost:5000");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container px-4 py-16 mx-auto max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Vehicle Detection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a video or use your webcam to detect and analyze vehicles in real-time.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm overflow-hidden bg-white h-full">
              <CardHeader>
                <CardTitle>Video Source</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls={!isLiveMode}
                    autoPlay={isLiveMode}
                    playsInline
                    muted={isLiveMode}
                  ></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  
                  {!videoFile && !isLiveMode && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="h-12 w-12 text-blue-500 mb-4" />
                      <p className="text-gray-500 mb-2">Drag and drop a video file here</p>
                      <p className="text-gray-400 text-sm mb-4">or</p>
                      <div className="flex space-x-4">
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Select Video
                        </Button>
                        <Button
                          variant="outline"
                          onClick={startWebcam}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Use Webcam
                        </Button>
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <div className="space-x-2">
                    {!isLiveMode ? (
                      <Button 
                        variant="outline" 
                        onClick={startWebcam}
                        disabled={isProcessing}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Use Webcam
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={stopWebcam}
                        disabled={isProcessing}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop Webcam
                      </Button>
                    )}
                    {!isLiveMode && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setVideoFile(null);
                          if (videoRef.current) {
                            videoRef.current.src = "";
                          }
                          fileInputRef.current?.click();
                        }}
                        disabled={isProcessing}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Video
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    onClick={processVideo}
                    disabled={isProcessing || (!videoFile && !isLiveMode)}
                  >
                    {isProcessing ? 'Processing...' : 'Detect Vehicles'}
                    {!isProcessing && <Play className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
                
                {isProcessing && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Processing video...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border-0 shadow-sm overflow-hidden bg-white h-full">
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
              </CardHeader>
              <CardContent>
                {detectionResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Detected {detectionResults.length} vehicles
                    </p>
                    
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {detectionResults.map((vehicle, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 border border-gray-100 rounded-lg mb-2 hover:bg-gray-50"
                        >
                          {vehicle.image_data && (
                            <div className="w-12 h-12 bg-gray-200 rounded mr-3 overflow-hidden">
                              <img 
                                src={`data:image/jpeg;base64,${vehicle.image_data}`} 
                                alt={`Vehicle ${index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {vehicle.type || "Vehicle"} {vehicle.color && `(${vehicle.color})`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Confidence: {Math.round(vehicle.confidence * 100)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => {
                        // Here you could save results to localStorage or 
                        // send to another endpoint
                        toast({
                          title: "Results saved",
                          description: "Vehicle detection results have been saved.",
                        });
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Results
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full inline-flex justify-center items-center mb-4">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                    <p className="text-sm text-gray-500">
                      Upload a video or use your webcam and click "Detect Vehicles" to see results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>Upload a video file or use your webcam to capture footage.</span>
            </p>
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>Our AI backend analyzes the video to detect vehicles.</span>
            </p>
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>View detailed information about each detected vehicle including type and confidence score.</span>
            </p>
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>Make sure your Flask backend is running at http://localhost:5000 for this feature to work.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetection;
