import { Link } from 'react-router-dom';
import { ExternalLink, Github, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const ProjectCard = ({ project }) => {
  return (
    <Card 
      data-testid={`project-card-${project.slug}`}
      className="group bg-background-surface border border-white/10 overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:border-primary/50"
    >
      {project.images && project.images.length > 0 && (
        <div className="relative overflow-hidden aspect-video">
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-surface to-transparent opacity-60"></div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Link 
            to={`/student/project/${project.slug}`}
            className="font-outfit font-medium text-lg text-white hover:text-primary transition-colors"
          >
            {project.title}
          </Link>
        </div>
        
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {project.description}
        </p>
        
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack.slice(0, 3).map((tech, idx) => (
              <span 
                key={idx}
                className="font-mono text-xs uppercase tracking-wider px-2 py-1 bg-white/5 border border-white/10 text-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {project.demo_link && (
              <a
                href={project.demo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-colors"
                data-testid="project-demo-link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.github_link && (
              <a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-colors"
                data-testid="project-github-link"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-text-muted text-xs">
            <Eye className="w-3 h-3" />
            <span>{project.views || 0}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link 
            to={`/student/${project.student_name.toLowerCase().replace(' ', '-')}`}
            className="text-xs text-text-muted hover:text-primary transition-colors"
          >
            by {project.student_name}
          </Link>
        </div>
      </div>
    </Card>
  );
};