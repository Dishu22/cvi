import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Github, Eye, Calendar, User } from 'lucide-react';
import { Helmet } from 'react-helmet';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProjectDetail() {
  const { projectSlug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/projects/${projectSlug}`);
        if (!response.ok) throw new Error('Project not found');
        
        const projectData = await response.json();
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-outfit font-bold text-3xl mb-2">Project Not Found</h1>
          <p className="text-text-secondary">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{project.title} - CodeVerse Institute</title>
        <meta name="description" content={project.description.substring(0, 155)} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={project.description.substring(0, 155)} />
        {project.images && project.images[0] && <meta property="og:image" content={project.images[0]} />}
        <meta name="keywords" content={project.tech_stack.join(', ')} />
      </Helmet>

      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {project.images && project.images.length > 0 && (
          <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden" data-testid="project-hero-image">
            <img 
              src={project.images[0]} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h1 className="font-outfit font-bold text-5xl mb-4" data-testid="project-title">
              {project.title}
            </h1>
            
            <div className="flex items-center gap-6 mb-8 text-sm text-text-muted">
              <Link 
                to={`/student/${project.student_name.toLowerCase().replace(' ', '-')}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{project.student_name}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span data-testid="project-views">{project.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <h2 className="font-outfit font-medium text-2xl mb-4">About This Project</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap" data-testid="project-description">
                {project.description}
              </p>
            </div>

            {project.images && project.images.length > 1 && (
              <div>
                <h2 className="font-outfit font-medium text-2xl mb-4">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.images.slice(1).map((image, idx) => (
                    <img 
                      key={idx}
                      src={image} 
                      alt={`${project.title} screenshot ${idx + 2}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="bg-background-surface border border-white/10 p-6 sticky top-24">
              <h3 className="font-outfit font-medium text-xl mb-6">Project Details</h3>
              
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mb-6">
                  <div className="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">Tech Stack</div>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, idx) => (
                      <span 
                        key={idx}
                        className="font-mono text-xs uppercase tracking-wider px-2 py-1 bg-white/5 border border-white/10 text-text-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {project.demo_link && (
                  <Button
                    data-testid="project-demo-button"
                    onClick={() => window.open(project.demo_link, '_blank')}
                    className="w-full bg-primary text-background hover:bg-primary/90 font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                )}
                {project.github_link && (
                  <Button
                    data-testid="project-github-button"
                    onClick={() => window.open(project.github_link, '_blank')}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Code
                  </Button>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">Created By</div>
                <Link 
                  to={`/student/${project.student_name.toLowerCase().replace(' ', '-')}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div>
                    <div className="font-medium text-white">{project.student_name}</div>
                    <div className="text-sm text-text-muted">{project.student_email}</div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}