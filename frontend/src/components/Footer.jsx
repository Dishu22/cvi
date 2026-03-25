import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background-surface py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-outfit font-bold text-xl mb-4">
              <span className="text-primary">CodeVerse</span>
              <span className="text-white"> Institute</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Rajasthan's premier professional education center. Transform your career with expert-led courses.
            </p>
          </div>

          <div>
            <h3 className="font-outfit font-medium text-white mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-text-secondary">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>291, behind Adrash cinema, near bus stand, Sri Ganganagar</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone className="w-4 h-4" />
                <span>+91 97857 95669</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>institutecodeverse@gmail.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-outfit font-medium text-white mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/#courses" className="block text-text-secondary hover:text-primary transition-colors">Courses</a>
              <a href="/#gallery" className="block text-text-secondary hover:text-primary transition-colors">Gallery</a>
              <a href="/#contact" className="block text-text-secondary hover:text-primary transition-colors">Contact</a>
              <a href="/login" className="block text-text-secondary hover:text-primary transition-colors">Student Login</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} CodeVerse Institute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};