import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  // Two pieces of local state, one per input field.
  // Local state is for data that only THIS component cares about.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    // e.preventDefault() stops the browser's default form behaviour,
    // which would be to reload the page. We handle submission ourselves.
    e.preventDefault();

    // Frontend validation, same discipline as the backend controllers
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // On success, AuthContext navigates to /dashboard automatically.
      // Nothing else needed here.
    } catch (error) {
      // error.response?.data?.message: safely read the server's
      // message if a response arrived, or fall back to a generic one.
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      // finally runs whether the try succeeded or the catch fired.
      // Always re-enable the button either way.
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md'>
      {/* Brand header */}
      <div className='text-center mb-8'>
        <div
          className='inline-flex items-center justify-center w-14 h-14
                        bg-primary rounded-2xl mb-4 shadow-lg'
        >
          <Package className='text-white' size={28} />
        </div>
        <h1 className='text-2xl font-bold text-text-heading'>
          Expiry Alert System
        </h1>
        <p className='text-text-muted mt-1 text-sm'>
          Intelligent Product Expiry Management
        </p>
      </div>

      {/* Form card */}
      <div className='card p-8'>
        <h2 className='text-lg font-semibold text-text-heading mb-6'>
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>
              Email address
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='admin@example.com'
              className='input'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              className='input'
            />
          </div>

          <button type='submit' disabled={loading} className='btn w-full'>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className='text-center text-sm text-text-muted mt-6'>
          Don't have an account?{' '}
          <Link
            to='/register'
            className='text-primary font-medium hover:underline'
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
