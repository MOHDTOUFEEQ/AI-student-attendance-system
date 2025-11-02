import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import ProtectedLayout from "./ProtectedLayout";
import Video from "./pages/Video";
import Image from "./pages/Image";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/video" element={<Video />} />
          <Route path="/image" element={<Image />} />
          {/* Add more protected routes here */}
        </Route>
      </Routes>
    </Router>
  );
}
