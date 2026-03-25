import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function UploadProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    demo_link: '',
    github_link: '',
    tech_stack: []
  });
  const [imageInput, setImageInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({ ...formData, images: [...formData.images, imageInput.trim()] });
      setImageInput('');
    }
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const addTech = () => {
    if (techInput.trim()) {
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, techInput.trim()] });
      setTechInput('');
    }
  };

  const removeTech = (index) => {
    setFormData({ ...formData, tech_stack: formData.tech_stack.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create project');

      const project = await response.json();
      toast.success('Project uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to upload project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h1 className="font-outfit font-bold text-4xl mb-2" data-testid="upload-project-title">
            Upload <span className="gradient-text">Project</span>
          </h1>
          <p className="text-text-secondary">Share your work with the world</p>
        </div>

        <Card className="bg-background-surface border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-text-secondary mb-2 block">Project Title *</Label>
              <Input
                id="title"
                data-testid="project-title-input"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-white/20 text-white"
                placeholder="My Awesome Project"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-text-secondary mb-2 block">Description *</Label>
              <Textarea
                id="description"
                data-testid="project-description-textarea"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-white/20 text-white"
                placeholder="Describe your project..."
              />
            </div>

            <div>
              <Label className="text-text-secondary mb-2 block">Project Images (URLs)</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  data-testid="project-image-url-input"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  className="bg-background border-white/20 text-white"
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  data-testid="add-image-button"
                  type="button"
                  onClick={addImage}
                  className="bg-primary text-background hover:bg-primary/90 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <img src={image} alt="" className="w-20 h-20 object-cover rounded border border-white/20" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="demo_link" className="text-text-secondary mb-2 block">Live Demo Link</Label>
              <Input
                id="demo_link"
                data-testid="project-demo-link-input"
                type="url"
                value={formData.demo_link}
                onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                className="bg-background border-white/20 text-white"
                placeholder="https://your-project-demo.com"
              />
            </div>

            <div>
              <Label htmlFor="github_link" className="text-text-secondary mb-2 block">GitHub Repository</Label>
              <Input
                id="github_link"
                data-testid="project-github-link-input"
                type="url"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                className="bg-background border-white/20 text-white"
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <Label className="text-text-secondary mb-2 block">Tech Stack</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  data-testid="project-tech-stack-input"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="bg-background border-white/20 text-white"
                  placeholder="React, Node.js, MongoDB..."
                />
                <Button
                  data-testid="add-tech-button"
                  type="button"
                  onClick={addTech}
                  className="bg-primary text-background hover:bg-primary/90 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tech_stack.map((tech, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs uppercase tracking-wider">
                    <span className="text-text-secondary">{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTech(idx)}
                      className="text-text-muted hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                data-testid="submit-project-button"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-background hover:bg-primary/90 font-medium py-6"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Project'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 py-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}