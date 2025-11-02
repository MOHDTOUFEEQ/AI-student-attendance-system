import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Video() {
  const [file, setFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [output, setOutput] = useState(null);
  const [numStudents, setNumStudents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animate, setAnimate] = useState(false);

  // Handle file upload
  const handleUpload = (e) => {
    const selected = e.target.files[0];
    console.log(selected,e);
    
    // if (!selected) return;
    setVideoName(selected.name);
    const reader = new FileReader();
    reader.onload = () => setFile(reader.result);
    reader.readAsDataURL(selected);
  };

  // Reset all states
  const handleReset = () => {
    setFile(null);
    setVideoName("");
    setOutput(null);
    setNumStudents(null);
    setProgress(0);
  };

  // Process the video
  const handlePredict = async () => {
    if (!file) return alert("Please upload a video first!");
    setLoading(true);
    setAnimate(true);
    setProgress(0);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/predict_video",
        { file },
        {
          onDownloadProgress: (progressEvent) => {
            const total = progressEvent.total || 1;
            setProgress(Math.round((progressEvent.loaded / total) * 100));
          },
        }
      );
      setOutput(res.data.output);
      setNumStudents(res.data.num_students);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }

    setLoading(false);
    setTimeout(() => setAnimate(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-start py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl px-4"
      >
        <Card className="p-10 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
            🎥 Video Attendance Detection
          </h1>

          {/* Drag-and-Drop / Upload */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-gray-400 transition"
            onClick={() => document.getElementById("videoInput").click()}
          >
            <p className="text-gray-600 text-center">
              {file ? videoName : "Drag & drop a video here or click to upload"}
            </p>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* Video Preview */}
          {file && (
            <div className="text-center mb-4">
              <video
                src={file}
                controls
                className="w-full max-h-[300px] rounded-lg shadow-md border border-gray-300"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={handlePredict}
              disabled={loading || !file}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition"
            >
              {loading ? "Processing..." : "Run Detection"}
            </Button>
            <Button
              onClick={handleReset}
              disabled={loading && !file}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-md transition"
            >
              Reset
            </Button>
          </div>

          {/* Progress / Animation */}
          {animate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-center text-gray-600 font-semibold mb-4"
            >
              ⚙️ Analyzing video frames... {progress}%
            </motion.div>
          )}

          {/* Results */}
          {output && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-8 text-center"
            >
              <div className="relative rounded-xl overflow-hidden border border-gray-300 shadow-lg">
                <video
                  src={output}
                  controls
                  autoPlay
                  muted
                  className="w-full max-h-[480px] bg-black"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
                  <h3 className="font-semibold">Students Detected</h3>
                  <p className="text-2xl font-bold text-green-700">{numStudents}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
                  <h3 className="font-semibold">Video Name</h3>
                  <p className="text-lg">{videoName}</p>
                </div>
              </div>

              <a
                href={output}
                download="processed_video.avi"
                className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
              >
                💾 Download Processed Video
              </a>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
