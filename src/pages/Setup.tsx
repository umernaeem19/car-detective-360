
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Code, 
  Server, 
  Terminal, 
  FileCode, 
  ArrowRight, 
  Copy, 
  CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";

const Setup = () => {
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({...copied, [id]: true});
    setTimeout(() => {
      setCopied({...copied, [id]: false});
    }, 2000);
  };

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
  
  const backendCode = `import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import base64
import time
import tempfile
from ultralytics import YOLO
from groq import Groq
from collections import defaultdict, deque
from deep_sort_realtime.deepsort_tracker import DeepSort
from sklearn.cluster import DBSCAN

app = Flask(__name__)
CORS(app)

# Groq API setup
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "your_groq_api_key")
client = Groq(api_key=GROQ_API_KEY)

# Function to Convert Image to Base64
def encode_image_to_base64(image):
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode("utf-8")

# Function to Get Car Details from Groq
def get_car_details(image):
    try:
        if image.shape[0] < 50 or image.shape[1] < 50:  # Ignore tiny crops
            return "Unknown Vehicle"
        
        image_b64 = encode_image_to_base64(image)
        response = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": "Identify the car's color, make, model, and year from the image. Only respond in this strict format: '<Color> <Make> <Model> <Year>'. If unsure, return 'Unknown Vehicle'."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                ]}
            ],
            temperature=0,
            max_tokens=20,
            top_p=1,
            stream=False,
        )
        return response.choices[0].message.content.strip() if response and response.choices else "Unknown Vehicle"
    except Exception as e:
        print(f"Error getting car details: {e}")
        return "Unknown Vehicle"

# Load YOLO Model
model = YOLO("yolo12n.pt")

# Initialize DeepSORT Tracker
tracker = DeepSort(max_age=30, n_init=3, nn_budget=100)

# Loitering & Revisit Detection Parameters
loitering_threshold = 100
revisit_threshold = 300

@app.route('/api/process-video', methods=['POST'])
def process_video_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Save uploaded file to temporary location
    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    file.save(temp_input.name)
    
    # Process the video
    try:
        vehicle_data = process_video(temp_input.name, temp_output.name)
        
        # Clean up input temp file
        os.unlink(temp_input.name)
        
        # Return the processed data and output file path
        return jsonify({
            "message": "Processing complete",
            "output_path": temp_output.name,
            "vehicle_data": vehicle_data
        })
    except Exception as e:
        # Clean up temp files in case of error
        os.unlink(temp_input.name)
        if os.path.exists(temp_output.name):
            os.unlink(temp_output.name)
        return jsonify({"error": str(e)}), 500

@app.route('/api/download-video/<path:filename>', methods=['GET'])
def download_video(filename):
    return send_file(filename, as_attachment=True)

def process_video(video_path, output_path):
    cap = cv2.VideoCapture(video_path)
    vehicle_info = {}
    frame_count = 0
    vehicle_tracks = defaultdict(lambda: deque(maxlen=revisit_threshold))
    vehicle_positions = defaultdict(list)
    vehicle_status = {}
    
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, 30, (int(cap.get(3)), int(cap.get(4))))
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        results = model.predict(frame, conf=0.6)
        detections = []
        
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = box.conf[0]
                detections.append(([x1, y1, x2 - x1, y2 - y1], conf, 'car'))
        
        tracks = tracker.update_tracks(detections, frame=frame)
        
        for track in tracks:
            if not track.is_confirmed():
                continue
            
            track_id = track.track_id
            x1, y1, x2, y2 = map(int, track.to_ltrb())
            
            # Store frame history & position for DBSCAN revisit clustering
            vehicle_tracks[track_id].append(frame_count)
            vehicle_positions[track_id].append(((x1 + x2) // 2, (y1 + y2) // 2))
            
            # Determine Loitering Status (Uses motion filtering)
            if len(vehicle_positions[track_id]) >= 5:
                movement = np.linalg.norm(np.diff(vehicle_positions[track_id][-5:], axis=0))
                if len(vehicle_tracks[track_id]) > loitering_threshold and movement < 10:
                    status = "loitering"
                    color = (0, 0, 255)  # Red (Loitering Alert)
                else:
                    status = "normal"
                    color = (0, 255, 0)  # Green (Normal)
            else:
                status = "normal"
                color = (0, 255, 0)
            
            # Detect Frequent Revisits using DBSCAN Spatial Clustering
            if len(vehicle_positions[track_id]) > 10:
                clustering = DBSCAN(eps=30, min_samples=2).fit(vehicle_positions[track_id])
                if len(set(clustering.labels_)) > 1:
                    status = "frequent_visitor"
                    color = (255, 0, 0)  # Blue (Frequent Visitor Alert)
            
            vehicle_status[track_id] = status
            
            if track_id not in vehicle_info:
                vehicle_crop = frame[y1:y2, x1:x2]
                if vehicle_crop.size != 0:
                    vehicle_info[track_id] = get_car_details(vehicle_crop)
                else:
                    vehicle_info[track_id] = "Unknown Vehicle"
            
            # Draw bounding box & text
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"ID {track_id}: {vehicle_info[track_id]}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        out.write(frame)
    
    cap.release()
    out.release()
    
    # Format response data
    response_data = []
    for track_id in vehicle_info:
        response_data.append({
            "id": track_id,
            "vehicle": vehicle_info[track_id],
            "status": vehicle_status.get(track_id, "normal"),
            "frames_detected": len(vehicle_tracks[track_id])
        })
    
    return response_data

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`;

  const requirementsCode = `Flask==2.0.1
flask-cors==3.0.10
numpy==1.22.4
opencv-python==4.5.5.64
ultralytics==8.0.0
groq==0.4.0
deep-sort-realtime==1.3.2
scikit-learn==1.0.2`;

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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Backend Setup</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these instructions to set up the Python backend server for video processing and vehicle detection.
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariant}
          className="max-w-4xl mx-auto"
        >
          <Alert className="mb-8 bg-amber-50 border-amber-200">
            <Server className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Backend Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              The vehicle detection functionality requires a Python backend server. The frontend alone cannot process video files for AI-based detection.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="setup">Setup Instructions</TabsTrigger>
              <TabsTrigger value="code">Backend Code</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Terminal className="h-5 w-5 mr-2 text-blue-600" />
                  Python Environment Setup
                </h2>
                
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <div>
                      <p className="font-medium">Create a new directory for the backend:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>mkdir vehicle-detection-backend && cd vehicle-detection-backend</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("mkdir vehicle-detection-backend && cd vehicle-detection-backend", "cmd1")}
                        >
                          {copied["cmd1"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <div>
                      <p className="font-medium">Create a virtual environment:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>python -m venv venv</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("python -m venv venv", "cmd2")}
                        >
                          {copied["cmd2"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <div>
                      <p className="font-medium">Activate the virtual environment:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code># On Windows<br/>venv\Scripts\activate<br/><br/># On macOS/Linux<br/>source venv/bin/activate</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("# On Windows\nvenv\\Scripts\\activate\n\n# On macOS/Linux\nsource venv/bin/activate", "cmd3")}
                        >
                          {copied["cmd3"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">4</span>
                    <div>
                      <p className="font-medium">Create a requirements.txt file:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>touch requirements.txt</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("touch requirements.txt", "cmd4")}
                        >
                          {copied["cmd4"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Edit the requirements.txt file and paste the dependencies from the "Code" tab.
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">5</span>
                    <div>
                      <p className="font-medium">Install the dependencies:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>pip install -r requirements.txt</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("pip install -r requirements.txt", "cmd5")}
                        >
                          {copied["cmd5"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">6</span>
                    <div>
                      <p className="font-medium">Download the YOLO model:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>pip install ultralytics<br/>yolo download yolo12n.pt</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("pip install ultralytics\nyolo download yolo12n.pt", "cmd6")}
                        >
                          {copied["cmd6"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">7</span>
                    <div>
                      <p className="font-medium">Create the app.py file:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>touch app.py</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("touch app.py", "cmd7")}
                        >
                          {copied["cmd7"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Edit the app.py file and paste the backend code from the "Code" tab.
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">8</span>
                    <div>
                      <p className="font-medium">Set your Groq API key:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code># On Windows<br/>set GROQ_API_KEY=your_groq_api_key<br/><br/># On macOS/Linux<br/>export GROQ_API_KEY=your_groq_api_key</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("# On Windows\nset GROQ_API_KEY=your_groq_api_key\n\n# On macOS/Linux\nexport GROQ_API_KEY=your_groq_api_key", "cmd8")}
                        >
                          {copied["cmd8"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">9</span>
                    <div>
                      <p className="font-medium">Run the Flask server:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 flex justify-between items-center">
                        <code>python app.py</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard("python app.py", "cmd9")}
                        >
                          {copied["cmd9"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileCode className="h-5 w-5 mr-2 text-blue-600" />
                  Connect the Frontend
                </h2>
                
                <p className="mb-4">
                  To connect the frontend application to your Python backend, you'll need to:
                </p>
                
                <ol className="space-y-3">
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <p>Ensure the backend server is running at <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">http://localhost:5000</code></p>
                  </li>
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <p>Update the frontend Upload.tsx component to send videos to the backend API endpoint</p>
                  </li>
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 font-medium w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <p>Update the Dashboard.tsx component to display the processing results returned from the API</p>
                  </li>
                </ol>
                
                <div className="mt-6">
                  <Link to="/upload">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Go to Upload Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="code">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" />
                      app.py
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 border-blue-300"
                      onClick={() => copyToClipboard(backendCode, "backend")}
                    >
                      {copied["backend"] ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-sm">
                      <code>{backendCode}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" />
                      requirements.txt
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 border-blue-300"
                      onClick={() => copyToClipboard(requirementsCode, "requirements")}
                    >
                      {copied["requirements"] ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                    <pre className="text-sm">
                      <code>{requirementsCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6">API Reference</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-blue-700">POST /api/process-video</h3>
                    <p className="text-gray-700 mb-4">
                      Upload and process a video file for vehicle detection.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Request</h4>
                      <p className="text-sm text-gray-600 mb-2">Content-Type: multipart/form-data</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md">
                        <pre className="text-sm">
{`{
  "file": [binary video file]
}`}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-2">Response</h4>
                      <p className="text-sm text-gray-600 mb-2">Content-Type: application/json</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-md">
                        <pre className="text-sm">
{`{
  "message": "Processing complete",
  "output_path": "/tmp/tmpxyz123.mp4",
  "vehicle_data": [
    {
      "id": 1,
      "vehicle": "Black Honda Civic 2020",
      "status": "normal",
      "frames_detected": 120
    },
    {
      "id": 2,
      "vehicle": "White Toyota Camry 2018",
      "status": "loitering",
      "frames_detected": 350
    },
    {
      "id": 3,
      "vehicle": "Red Ford F-150 2021",
      "status": "frequent_visitor",
      "frames_detected": 200
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-blue-700">GET /api/download-video/:filename</h3>
                    <p className="text-gray-700 mb-4">
                      Download the processed video file with detection annotations.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Request</h4>
                      <p className="text-sm text-gray-600">
                        Path Parameter: <code className="bg-gray-200 px-1 py-0.5 rounded">filename</code> - The path to the processed video file returned from process-video endpoint
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-2">Response</h4>
                      <p className="text-sm text-gray-600">
                        Binary video file (MP4) as an attachment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;
