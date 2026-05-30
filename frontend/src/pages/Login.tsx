import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messName, setMessName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [registrationPasscode, setRegistrationPasscode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await authApi.login({ username, password });
        login(data);
      } else {
        const { data } = await authApi.register({ username, email, password, messName, location, address, registrationPasscode });
        login(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-lg shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ChefHat className="text-accent" size={32} />
          <h1 className="text-2xl font-semibold text-primary">MessManager</h1>
        </div>

        <h2 className="text-lg font-medium text-primary mb-6 text-center">
          {isLogin ? 'Sign In' : 'Create Owner Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-secondary mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
              required
              autoFocus
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs text-secondary mb-1">Registration Passcode</label>
              <input
                type="text"
                value={registrationPasscode}
                onChange={(e) => setRegistrationPasscode(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                placeholder="Required admin registration key"
                required
              />
            </div>
          )}

          {!isLogin && (
            <>
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-semibold text-accent mb-3 uppercase tracking-wider">Canteen Details</h3>
              </div>
              
              <div>
                <label className="block text-xs text-secondary mb-1">Canteen / Mess Name</label>
                <input
                  type="text"
                  value={messName}
                  onChange={(e) => setMessName(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                  placeholder="e.g. West Hostel Canteen"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-secondary mb-1">Canteen Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                  placeholder="e.g. Block C Hostel Plaza"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-secondary mb-1">Detailed Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
                  placeholder="e.g. Sector 5, Main Campus Road"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50 mt-6"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="ml-1 text-accent hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
