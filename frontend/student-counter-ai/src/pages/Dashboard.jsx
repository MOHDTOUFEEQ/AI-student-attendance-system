import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Data Communication");
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://127.0.0.1:5000"; // Flask backend

  // 🔹 Fetch all subjects on page load
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get_subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // 🔹 Fetch summary, chart, and logs when a subject is selected
  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true);

    Promise.all([
      axios.get(`${BASE_URL}/get_summary_by_subject/${selectedSubject}`),
      axios.get(`${BASE_URL}/get_chart_data_by_subject/${selectedSubject}`),
      axios.get(`${BASE_URL}/get_logs_by_subject/${selectedSubject}`),
    ])
      .then(([summaryRes, chartRes, logsRes]) => {
        setSummary(summaryRes.data);
        setChartData(chartRes.data);
        setLogs(logsRes.data);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  // 🔹 Generate and download PDF report
  const generatePDF = () => {
    const reportWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>${selectedSubject} Attendance Report</title>
        </head>
        <body style="font-family: Arial; padding: 20px;">
          <h2>${selectedSubject} - Attendance Report</h2>
          <p><strong>Total Lectures:</strong> ${summary.total_lectures}</p>
          <p><strong>Average Attendance:</strong> ${summary.average_attendance}%</p>
          <p><strong>Total Students Detected:</strong> ${summary.total_detected}</p>
          <p><strong>Total Students Expected:</strong> ${summary.total_expected}</p>
          <hr/>
          <h3>Logs:</h3>
          <table border="1" cellpadding="5" cellspacing="0" width="100%">
            <tr>
              <th>Date</th>
              <th>Lecture</th>
              <th>Detected</th>
              <th>Expected</th>
              <th>Absent</th>
            </tr>
            ${logs
              .map(
                (log) => `
              <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.lecture_name}</td>
                <td>${log.num_students_detected}</td>
                <td>${log.total_students_expected}</td>
                <td>${log.absent_students}</td>
              </tr>`
              )
              .join("")}
          </table>
        </body>
      </html>`;
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    reportWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        📊 Attendance Dashboard
      </h1>

      {/* Subject Dropdown */}
      <div className="flex justify-center mb-6">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-center text-gray-600">Loading data...</p>}

      {/* Summary Cards */}
      {summary && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h3 className="text-lg font-semibold">Total Lectures</h3>
            <p className="text-2xl font-bold text-blue-700">{summary.total_lectures}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h3 className="text-lg font-semibold">Avg Attendance</h3>
            <p className="text-2xl font-bold text-green-700">{summary.average_attendance}%</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h3 className="text-lg font-semibold">Detected</h3>
            <p className="text-2xl font-bold text-indigo-700">{summary.total_detected}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <h3 className="text-lg font-semibold">Expected</h3>
            <p className="text-2xl font-bold text-red-700">{summary.total_expected}</p>
          </div>
        </div>
      )}

      {/* Attendance Chart */}
      {chartData.length > 0 && (
  <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
      Attendance Trend
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

      {/* Logs Table */}
      {logs.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Attendance Logs
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Lecture</th>
                  <th className="p-2 border">Detected</th>
                  <th className="p-2 border">Expected</th>
                  <th className="p-2 border">Absent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="text-center hover:bg-gray-100">
                    <td className="p-2 border">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2 border">{log.lecture_name}</td>
                    <td className="p-2 border">{log.num_students_detected}</td>
                    <td className="p-2 border">{log.total_students_expected}</td>
                    <td className="p-2 border text-red-700 font-semibold">
                      {log.absent_students}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Button */}
      {summary && (
        <div className="text-center">
          <button
            onClick={generatePDF}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🧾 Generate PDF Report
          </button>
        </div>
      )}
    </div>
  );
}
