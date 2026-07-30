import { Routes, Route, Navigate } from 'react-router-dom';

// layouts
import AuthLayout from './components/layouts/AuthLayout';

// guards
import PublicRoute from './components/router/PublicRoute';
import ProtectedRoute from './components/router/ProtectedRoute';

// pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Visiting the root redirects you to dashboard (which
          ProtectedRoute redirects to /login if not logged in) */}
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      {/* Auth routes: only accessible when logged OUT */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Route>

      {/* Protected dashboard shell: Phase C fills this in */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <div className='min-h-screen bg-bg flex items-center justify-center'>
              <p className='text-text-heading font-semibold text-lg'>
                Dashboard shell coming in Phase C
              </p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
