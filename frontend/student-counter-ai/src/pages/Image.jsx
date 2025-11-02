import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Image() {
     const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [numStudents, setNumStudents] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [classroomId, setClassroomId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [lectureName, setLectureName] = useState("");
  const [totalExpected, setTotalExpected] = useState();

  const handleUpload = (e) => {
    const selected = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setFile(reader.result);
    reader.readAsDataURL(selected);
  };

  const handlePredict = async () => {
    if (!file) return alert("Please upload a classroom photo!");
    if (!classroomId || !moduleName || !lectureName)
      return alert("Please fill classroom details first!");

    setLoading(true);
    setAnimate(true); // start animation

    try {
      const res = await axios.post("http://localhost:5000/predict_image", {
        file,
      });

      const detected = res.data.num_students;
      setOutput(res.data.output);
      setNumStudents(detected);

      await axios.post("http://localhost:5000/log_attendance", {
        classroom_id: classroomId,
        module_name: moduleName,
        lecture_name: lectureName,
        num_students_detected: detected,
        total_students_expected: Number(totalExpected),
      });

      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }

    setLoading(false);
    setTimeout(() => setAnimate(false), 1500); // stop animation after 1.5s
  };

  const fetchLogs = async () => {
    if (classroomId) {
      const res = await axios.get(
        `http://localhost:5000/get_logs/${classroomId}`
      );
      setLogs(res.data);
    }
  };

  useEffect(() => {
    if (classroomId) fetchLogs();
  }, [classroomId]);
  return (
    <div className="min-h-screen bg-white text-black  flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <Card className="p-8 shadow-xl border border-gray-200 rounded-2xl bg-white">
          <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
            🎓 Image Attendance Detection
          </h1>

          {/* Input Section */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Classroom ID"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
            />
            <Input
              placeholder="Module Name"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
            <Input
              placeholder="Lecture Name"
              value={lectureName}
              onChange={(e) => setLectureName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Expected Students"
              value={totalExpected}
              onChange={(e) => setTotalExpected(e.target.value)}
            />
          </div>

          {/* Upload Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 
                         file:rounded-md file:border file:border-gray-300 
                         file:text-sm file:font-medium file:bg-gray-100 
                         hover:file:bg-gray-200 transition-all"
            />

            <Button
              onClick={handlePredict}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-all"
            >
              {loading ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </div>

          {/* Animation Section */}
          {animate && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{
                repeat: 2,
                repeatType: "mirror",
                duration: 0.4,
                ease: "easeInOut",
              }}
              className="text-center text-lg font-semibold text-gray-700 mb-4"
            >
              ⚙️ Processing image...
            </motion.div>
          )}

          {/* Results */}
          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-6 text-center"
            >
              <h3 className="text-lg font-semibold mb-2">
                👥 Students Detected: {numStudents}
              </h3>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={output}
                alt="Detected classroom"
                className="mt-4 rounded-lg shadow-md border border-gray-300 max-h-96 mx-auto"
              />
            </motion.div>
          )}

          <hr className="my-8 border-gray-300" />

          <h2 className="text-xl font-semibold mb-3 text-center">
            📋 Attendance Logs {classroomId && `for ${classroomId}`}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Module</th>
                  <th className="p-2 border">Lecture</th>
                  <th className="p-2 border">Detected</th>
                  <th className="p-2 border">Expected</th>
                  <th className="p-2 border">Absent</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <tr key={i} className="text-center border-t">
                      <td className="p-2 border">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 border">{log.module_name}</td>
                      <td className="p-2 border">{log.lecture_name}</td>
                      <td className="p-2 border">{log.num_students_detected}</td>
                      <td className="p-2 border">{log.total_students_expected}</td>
                      <td className="p-2 border text-red-600 font-semibold">
                        {log.absent_students}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 text-gray-500 italic"
                    >
                      No logs found. Upload and analyze to see results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Image
