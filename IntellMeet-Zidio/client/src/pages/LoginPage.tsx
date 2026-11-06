import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input, Label } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card.js';
import { useAuthStore } from '../store/authStore.js';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleDemoSignIn = async (role: 'admin' | 'member') => {
    setError('');
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center space-x-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Video className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">IntellMeet</span>
          </Link>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Enterprise Collaboration
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your work email credentials or choose a pre-seeded demo profile.</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex.admin@intellmeet.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            {/* Quick 1-Click Demo Profiles */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 text-center">
                1-Click Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoSignIn('admin')}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>Admin (Alex)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoSignIn('member')}
                  className="text-xs flex items-center justify-center space-x-1"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Member (Sarah)</span>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border py-4 text-xs text-muted-foreground">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium ml-1">
              Register here
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
