import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import UploadProject from "@/pages/UploadProject";
import EditProject from "@/pages/EditProject";
import StudentProfile from "@/pages/StudentProfile";
import ProjectDetail from "@/pages/ProjectDetail";

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload-project" 
        element={
          <ProtectedRoute>
            <UploadProject />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-project/:projectId" 
        element={
          <ProtectedRoute>
            <EditProject />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/student/:studentName" element={<StudentProfile />} />
      <Route path="/student/project/:projectSlug" element={<ProjectDetail />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
