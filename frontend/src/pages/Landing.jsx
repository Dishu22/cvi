import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, Users, BookOpen, TrendingUp, Code, Palette, TrendingUpIcon, DollarSign, Award, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Lenis from '@studio-freight/lenis';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const courses = [
  { id: 1, title: 'Web Development Bootcamp', category: 'Technology', duration: '6 Months', price: '₹15,000', rating: 4.8, students: 248, image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600' },
  { id: 2, title: 'Data Science & Machine Learning', category: 'Technology', duration: '8 Months', price: '₹18,000', rating: 4.9, students: 186, image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600' },
  { id: 3, title: 'Digital Marketing Mastery', category: 'Marketing', duration: '4 Months', price: '₹12,000', rating: 4.7, students: 312, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600' },
  { id: 4, title: 'UI/UX Design Professional', category: 'Design', duration: '5 Months', price: '₹14,000', rating: 4.8, students: 197, image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=600' },
  { id: 5, title: 'Cloud Computing & DevOps', category: 'Technology', duration: '6 Months', price: '₹20,000', rating: 4.9, students: 143, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600' },
  { id: 6, title: 'Financial Accounting & Tally', category: 'Finance', duration: '3 Months', price: '₹8,000', rating: 4.6, students: 425, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600' },
];

const galleryImages = [
  { url: 'https://images.pexels.com/photos/4078343/pexels-photo-4078343.jpeg', label: 'Students Coding' },
  { url: 'https://images.pexels.com/photos/4385446/pexels-photo-4385446.jpeg', label: 'Classroom' },
  { url: 'https://images.pexels.com/photos/3747480/pexels-photo-3747480.jpeg', label: 'Computer Lab' },
  { url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600', label: 'Workshop' },
  { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=900', label: 'Campus' },
  { url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600', label: 'Tech Event' },
];

const testimonials = [
  { name: 'Rahul Sharma', role: 'Frontend Developer', company: 'TechCorp', text: 'CVI Institute gave me the skills and confidence to land my dream job. The web development bootcamp was hands-on and incredibly practical.', rating: 5 },
  { name: 'Priya Meena', role: 'Data Analyst', company: 'Analytics Co.', text: 'The data science course is world-class. Mentorship was exceptional. I cleared my first ML interview with ease.', rating: 5 },
  { name: 'Amit Gupta', role: 'Business Owner', company: 'Sri Ganganagar', text: 'My business revenue tripled in 6 months using the digital marketing strategies I learned at CVI. Truly life-changing.', rating: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit inquiry');

      toast.success('Thank you! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', course_interest: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1761599821310-da0d6356b4f3?crop=entropy&cs=srgb&fm=jpg&w=1920" 
            alt="Abstract background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.8), rgba(9,9,11,0.95))' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6" data-testid="hero-label">
            Rajasthan's #1 Professional Institute
          </div>
          
          <h1 className="font-outfit font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6" data-testid="hero-title">
            Launch Your <span className="gradient-text">Tech Career</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            Hands-on, industry-aligned professional courses that transform careers. Real skills, real mentors, real results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              data-testid="explore-courses-button"
              onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-background hover:bg-primary/90 font-medium px-8 py-6 text-base"
            >
              Explore Courses
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              data-testid="student-login-hero-button"
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
            >
              Student Login
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-primary mb-2">30+</div>
              <div className="text-sm text-text-muted uppercase tracking-wider">Placements</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-primary mb-2">3+</div>
              <div className="text-sm text-text-muted uppercase tracking-wider">Years Excellence</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-text-muted uppercase tracking-wider">Placement Rate</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-text-muted uppercase tracking-wider">Alumni</div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Since 2025</div>
              <h2 className="font-outfit font-bold text-4xl lg:text-5xl tracking-tight mb-6">
                Shaping <span className="gradient-text">Tomorrow's</span> Leaders
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                Founded in the heart of Sri Ganganagar, CodeVerse Institute has stood at the forefront of professional education in Rajasthan. We believe that quality education must be practical, accessible, and transformative.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Our industry-aligned programs, veteran faculty, and live project approach ensure every student graduates with real-world confidence — not just a certificate.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-text-secondary">Award-Winning Faculty</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUpIcon className="w-5 h-5 text-primary" />
                  <span className="text-text-secondary">98% Placement Rate</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/4078343/pexels-photo-4078343.jpeg" 
                alt="Students at CodeVerse"
                className="rounded-lg w-full object-cover" style={{ maxHeight: '80vh' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-24 px-6 bg-background-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Our Courses</div>
            <h2 className="font-outfit font-bold text-4xl lg:text-5xl tracking-tight mb-4">
              Master <span className="gradient-text">In-Demand</span> Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card 
                key={course.id}
                data-testid={`course-card-${course.id}`}
                className="group bg-background border border-white/10 overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:border-primary/50"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="font-mono text-xs uppercase px-3 py-1 bg-primary/90 text-background">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-outfit font-medium text-xl mb-3 text-white">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                    <span>⏱ {course.duration}</span>
                    <span>⭐ {course.rating}</span>
                    <span>👥 {course.students}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="font-outfit font-bold text-2xl text-primary">{course.price}</span>
                    <Button size="sm" className="bg-white/10 hover:bg-primary hover:text-background border border-white/20">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Gallery</div>
            <h2 className="font-outfit font-bold text-4xl lg:text-5xl tracking-tight">
              Life at <span className="gradient-text">CVI</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, idx) => (
              <div 
                key={idx}
                className="relative overflow-hidden rounded-lg aspect-square group cursor-pointer"
              >
                <img 
                  src={image.url} 
                  alt={image.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium">{image.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-background-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Testimonials</div>
            <h2 className="font-outfit font-bold text-4xl lg:text-5xl tracking-tight">
              Real Results, <span className="gradient-text">Real People</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-background border border-white/10 p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary">★</span>
                  ))}
                </div>
                <p className="text-text-secondary mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-medium text-white">{testimonial.name}</div>
                  <div className="text-sm text-text-muted">{testimonial.role} · {testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-secondary mb-4">Contact Us</div>
              <h2 className="font-outfit font-bold text-4xl lg:text-5xl tracking-tight mb-8">
                Let's Start Your <span className="gradient-text">Journey</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-white mb-1">Address</div>
                    <p className="text-text-secondary text-sm">291, behind Adrash cinema, near bus stand, Sri Ganganagar</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-white mb-1">Phone</div>
                    <p className="text-text-secondary text-sm">+91 97857 95669</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-white mb-1">Email</div>
                    <p className="text-text-secondary text-sm">institutecodeverse@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-background-surface border border-white/10 p-8">
              <h3 className="font-outfit font-medium text-2xl mb-6 text-white">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-text-secondary mb-2 block">Full Name *</Label>
                  <Input
                    id="name"
                    data-testid="inquiry-name-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-text-secondary mb-2 block">Email *</Label>
                  <Input
                    id="email"
                    data-testid="inquiry-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-text-secondary mb-2 block">Phone</Label>
                  <Input
                    id="phone"
                    data-testid="inquiry-phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-background border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="course" className="text-text-secondary mb-2 block">Interested Course</Label>
                  <Select value={formData.course_interest} onValueChange={(value) => setFormData({ ...formData, course_interest: value })}>
                    <SelectTrigger data-testid="inquiry-course-select" className="bg-background border-white/20 text-white">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent className="bg-background-surface border-white/20">
                      <SelectItem value="Web Development Bootcamp">Web Development Bootcamp</SelectItem>
                      <SelectItem value="Data Science & ML">Data Science & ML</SelectItem>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message" className="text-text-secondary mb-2 block">Message</Label>
                  <Textarea
                    id="message"
                    data-testid="inquiry-message-textarea"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background border-white/20 text-white"
                  />
                </div>
                <Button
                  data-testid="inquiry-submit-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-background hover:bg-primary/90 font-medium py-6"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}