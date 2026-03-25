import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      toast.success('Admin logged in successfully!');
      navigate('/admin/dashboard', { state: { adminToken: data.admin_token } });
    } catch (error) {
      toast.error('Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-background-surface border border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-outfit font-bold text-3xl mb-2">
            <span className="text-primary">Admin</span>
            <span className="text-white"> Login</span>
          </h1>
          <p className="text-text-secondary text-sm">CVI Institute Management Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-text-secondary mb-2 block">Username</Label>
            <Input
              id="username"
              data-testid="admin-username-input"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="admin"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-text-secondary mb-2 block">Password</Label>
            <Input
              id="password"
              data-testid="admin-password-input"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="••••••••"
            />
          </div>

          <Button
            data-testid="admin-login-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-background hover:bg-primary/90 font-medium py-6"
          >
            {isSubmitting ? 'Logging in...' : 'Login as Admin'}
          </Button>

          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full text-text-secondary hover:text-white"
          >
            Back to Home
          </Button>
        </form>
      </Card>
    </div>
  );
}