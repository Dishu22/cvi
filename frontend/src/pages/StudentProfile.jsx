import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Card } from '@/components/ui/card';
import { Mail, FolderOpen } from 'lucide-react';
import { Helmet } from 'react-helmet';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentProfile() {
  const { studentName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/student/${studentName}`);
        if (!response.ok) throw new Error('Student not found');
        
        const profileData = await response.json();
        setData(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-outfit font-bold text-3xl mb-2">Student Not Found</h1>
          <p className="text-text-secondary">The student profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { student, projects } = data;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${student.name} - CodeVerse Institute Student Portfolio`}</title>
        <meta name="description" content={`Portfolio of ${student.name}, a student at CodeVerse Institute. View ${projects.length} projects and work.`} />
        <meta property="og:title" content={`${student.name} - Student Portfolio`} />
        <meta property="og:description" content={`View ${student.name}'s projects and work at CodeVerse Institute`} />
        {student.picture && <meta property="og:image" content={student.picture} />}
      </Helmet>

      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <Card className="bg-background-surface border border-white/10 p-12 mb-12" data-testid="student-profile-header">
          <div className="flex items-center gap-6 mb-6">
            {student.picture && (
              <img 
                src={student.picture} 
                alt={student.name}
                className="w-24 h-24 rounded-full border-2 border-primary"
              />
            )}
            <div>
              <h1 className="font-outfit font-bold text-4xl mb-2" data-testid="student-name">
                {student.name}
              </h1>
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>{student.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div>
              <span className="text-text-muted uppercase tracking-wider font-mono text-xs">Projects</span>
              <div className="font-mono text-2xl font-bold text-primary" data-testid="student-project-count">{projects.length}</div>
            </div>
            <div>
              <span className="text-text-muted uppercase tracking-wider font-mono text-xs">Total Views</span>
              <div className="font-mono text-2xl font-bold text-secondary">
                {projects.reduce((sum, p) => sum + (p.views || 0), 0)}
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="font-outfit font-bold text-3xl mb-2">
            Projects by <span className="gradient-text">{student.name.split(' ')[0]}</span>
          </h2>
          <p className="text-text-secondary">Showcasing {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-background-surface border border-white/10 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="font-outfit font-medium text-xl mb-2">No Projects Yet</h3>
            <p className="text-text-secondary">This student hasn't uploaded any projects yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="student-projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project.project_id} project={project} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}