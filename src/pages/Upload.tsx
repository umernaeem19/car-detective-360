
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileVideo, X, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const Upload = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleProcessVideo = useCallback(() => {
    if (file) {
      setProcessing(true);
      
      // Simulate processing with progress updates
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            setProcessing(false);
            toast({
              title: "Processing complete",
              description: "Your video has been successfully processed.",
            });
            navigate("/dashboard", { state: { processed: true, filename: file.name } });
          }, 1000);
        }
        setProgress(currentProgress);
      }, 500);
    }
  }, [file, navigate]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setProcessing(true);
      
      // Simulate processing with progress updates
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            setProcessing(false);
            toast({
              title: "Processing complete",
              description: "The video stream has been successfully processed.",
            });
            navigate("/dashboard", { state: { processed: true, filename: "Stream from URL" } });
          }, 1000);
        }
        setProgress(currentProgress);
      }, 500);
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video stream URL.",
        variant: "destructive",
      });
    }
  }, [urlInput, navigate]);

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container px-4 py-16 mx-auto max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariant}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Video</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a video file or provide a stream URL to detect and analyze vehicles using our advanced AI system.
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariant}
          className="max-w-3xl mx-auto"
        >
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="file" className="text-sm md:text-base">Upload File</TabsTrigger>
              <TabsTrigger value="url" className="text-sm md:text-base">Stream URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file">
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {!file ? (
                    <div 
                      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${
                        isDragging 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <UploadIcon className="h-12 w-12 text-blue-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Drag and drop your video file</h3>
                      <p className="text-gray-500 mb-6 text-center">
                        Or click to browse from your computer
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <FileVideo className="mr-2 h-4 w-4" />
                        Select Video
                      </Button>
                      <input 
                        id="file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <FileVideo className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-md">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-red-500"
                          onClick={handleRemoveFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {processing ? (
                        <div className="space-y-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Processing video...</span>
                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-sm text-gray-500 mt-4">
                            This may take several minutes depending on the file size.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <Alert variant="default" className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Ready to process</AlertTitle>
                            <AlertDescription>
                              Click the button below to start analyzing this video. 
                            </AlertDescription>
                          </Alert>
                          
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={handleProcessVideo}
                          >
                            Process Video
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="url">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleUrlSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="url" className="text-sm font-medium">
                        Video Stream URL
                      </label>
                      <input
                        id="url"
                        type="text"
                        placeholder="https://example.com/stream.mp4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={processing}
                      />
                    </div>
                    
                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Stream Processing</AlertTitle>
                      <AlertDescription>
                        Make sure the provided URL is publicly accessible and points to a video stream.
                      </AlertDescription>
                    </Alert>
                    
                    {processing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Processing stream...</span>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Process Stream
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Processing Information</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>Video analysis can take from 30 seconds to several minutes depending on length.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>Supported formats: MP4, MOV, AVI, WEBM (max 500MB).</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                <span>Results will include vehicle identification, loitering detection, and revisit analysis.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
