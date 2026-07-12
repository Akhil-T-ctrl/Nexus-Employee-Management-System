import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {logInWithCredentials} from '../api/axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await logInWithCredentials.login(credentials);
      const { token, username, role, userId } = data; // Adjust fields to match your auth payload structure
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({username, role, userId}));
      
      navigate('/dashboard');
    } catch (err) {
      // Catches your backend's global custom error payload cleanly
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-1">Nexus-EMS</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Sign in to your user management panel</p>
        
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4 font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Username</label>
            <input 
              type="text" name="username" required
              value={credentials.username} onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" name="password" required
              value={credentials.password} onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating system...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;