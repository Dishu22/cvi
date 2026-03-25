import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const Navigation = ({ user }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(24px)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-outfit font-bold text-2xl tracking-tight">
              <span className="text-primary">CodeVerse</span>
              <span className="text-white"> Institute</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-text-secondary hover:text-white transition-colors\">
              <Home className="w-5 h-5" />
            </Link>
            
            <Link to="/notes" className="text-text-secondary hover:text-white transition-colors text-sm font-medium\">
              Notes
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-text-secondary hover:text-white transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-sm text-text-secondary">{user.name}</span>
                  <Button
                    data-testid="logout-button"
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="text-text-secondary hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                data-testid="login-button"
                onClick={() => navigate('/register')}
                className="bg-primary text-background hover:bg-primary/90 font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                Student Register
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};