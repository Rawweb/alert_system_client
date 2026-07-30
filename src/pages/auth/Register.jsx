import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  // One state object for multiple fields. The alternative is three
  // separate useState calls, both are valid, one object keeps them
  // grouped since they always travel together.
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  // One handler for all three inputs. e.target.name reads whichever
  // field fired the event, matching the name="" attribute on each
  // input. The spread ...form keeps the other fields intact.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = form;

    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md'>
      {/* Brand header, identical to Login for visual consistency */}
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
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>
              Full name
            </label>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder='Mmesoma Obi'
              className='input'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>
              Email address
            </label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
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
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='At least 8 characters'
              className='input'
            />
          </div>

          <button type='submit' disabled={loading} className='btn w-full'>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className='text-center text-sm text-text-muted mt-6'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-primary font-medium hover:underline'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
