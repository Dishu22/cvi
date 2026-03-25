import { loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chrome } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-background-surface border border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="font-outfit font-bold text-3xl mb-2">
            <span className="text-primary">Student</span>
            <span className="text-white"> Portal</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Sign in to manage your projects and portfolio
          </p>
        </div>

        <Button
          data-testid="login-google-button"
          onClick={loginWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-black font-medium py-6 text-base"
        >
          <Chrome className="w-5 h-5 mr-3" />
          Continue with Google
        </Button>

        <p className="text-center text-xs text-text-muted mt-6">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </Card>
    </div>
  );
}