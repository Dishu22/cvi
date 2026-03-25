import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/ProjectCard';
import { Plus, Eye, FolderOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_projects: 0, total_views: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes, projectsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' }),
          fetch(`${BACKEND_URL}/api/dashboard/stats`, { credentials: 'include' }),
          fetch(`${BACKEND_URL}/api/dashboard/projects`, { credentials: 'include' })
        ]);

        if (!userRes.ok) throw new Error('Not authenticated');

        const userData = await userRes.json();
        const statsData = await statsRes.json();
        const projectsData = await projectsRes.json();

        setUser(userData);
        setStats(statsData);
        setProjects(projectsData);
      } catch (error) {
        toast.error('Failed to load dashboard');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p.project_id !== projectId));
      setStats({ ...stats, total_projects: stats.total_projects - 1 });
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const getProfileUrl = () => {
    if (!user) return '';
    const studentSlug = user.name.toLowerCase().replace(' ', '-');
    return `${window.location.origin}/student/${studentSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h1 className="font-outfit font-bold text-4xl mb-2" data-testid="dashboard-title">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-text-secondary">Manage your projects and portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="col-span-1 bg-background-surface border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-text-muted uppercase tracking-wider font-mono">Projects</span>
            </div>
            <div className="font-mono text-4xl font-bold text-white" data-testid="total-projects">{stats.total_projects}</div>
          </Card>

          <Card className="col-span-1 bg-background-surface border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-secondary" />
              <span className="text-sm text-text-muted uppercase tracking-wider font-mono">Total Views</span>
            </div>
            <div className="font-mono text-4xl font-bold text-white" data-testid="total-views">{stats.total_views}</div>
          </Card>

          <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-6">
            <div className="mb-2">
              <span className="text-sm text-text-muted uppercase tracking-wider font-mono">Public Profile</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary font-mono truncate mr-4">{getProfileUrl()}</div>
              <Button
                data-testid="view-profile-button"
                onClick={() => window.open(getProfileUrl(), '_blank')}
                size="sm"
                className="bg-primary text-background hover:bg-primary/90 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="font-outfit font-bold text-2xl">My Projects</h2>
          <Button
            data-testid="upload-project-button"
            onClick={() => navigate('/upload-project')}
            className="bg-primary text-background hover:bg-primary/90 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-background-surface border border-white/10 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="font-outfit font-medium text-xl mb-2">No Projects Yet</h3>
            <p className="text-text-secondary mb-6">Start building your portfolio by uploading your first project</p>
            <Button
              data-testid="upload-first-project-button"
              onClick={() => navigate('/upload-project')}
              className="bg-primary text-background hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.project_id} className="relative group">
                <ProjectCard project={project} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    data-testid={`edit-project-${project.project_id}`}
                    onClick={() => navigate(`/edit-project/${project.project_id}`)}
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
                  >
                    Edit
                  </Button>
                  <Button
                    data-testid={`delete-project-${project.project_id}`}
                    onClick={() => handleDelete(project.project_id)}
                    size="sm"
                    className="bg-red-500/80 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}