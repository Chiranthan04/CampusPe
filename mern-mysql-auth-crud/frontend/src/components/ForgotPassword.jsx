import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h2>
        <p className="text-gray-500 text-sm text-center mb-6">Enter your registered email address.</p>
        {result && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm space-y-1">
            <p>✅ {result.message}</p>
            {result.demo_reset_token && (
              <p className="break-all">
                <strong>Demo Token:</strong> {result.demo_reset_token}
              </p>
            )}
          </div>
        )}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 transition">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link to="/login" className="text-teal-600 hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};
export default ForgotPassword;