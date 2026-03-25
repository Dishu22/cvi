import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      toast.success('Registration submitted! Admin will review and approve your account.');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-background-surface border border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="font-outfit font-bold text-3xl mb-2">
            <span className="text-primary">Student</span>
            <span className="text-white"> Registration</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Register karne ke baad admin approval ke liye wait karein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-text-secondary mb-2 block">Full Name *</Label>
            <Input
              id="name"
              data-testid="register-name-input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="Your full name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-text-secondary mb-2 block">Email *</Label>
            <Input
              id="email"
              data-testid="register-email-input"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="your.email@gmail.com"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-text-secondary mb-2 block">Phone Number *</Label>
            <Input
              id="phone"
              data-testid="register-phone-input"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div>
            <Label htmlFor="course" className="text-text-secondary mb-2 block">Course Interest *</Label>
            <Select required value={formData.course_interest} onValueChange={(value) => setFormData({ ...formData, course_interest: value })}>
              <SelectTrigger data-testid="register-course-select" className="bg-background border-white/20 text-white">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent className="bg-background-surface border-white/20">
                <SelectItem value="Web Development Bootcamp">Web Development Bootcamp</SelectItem>
                <SelectItem value="Data Science & ML">Data Science & ML</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                <SelectItem value="Financial Accounting">Financial Accounting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" className="text-text-secondary mb-2 block">Message (Optional)</Label>
            <Textarea
              id="message"
              data-testid="register-message-textarea"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-background border-white/20 text-white"
              placeholder="Kuch aur batana chahte hain?"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              data-testid="register-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-background hover:bg-primary/90 font-medium py-6"
            >
              {isSubmitting ? 'Submitting...' : 'Register'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 py-6"
            >
              Cancel
            </Button>
          </div>

          <p className="text-center text-xs text-text-muted mt-4">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}
