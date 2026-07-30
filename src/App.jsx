import { Routes, Route, Navigate } from 'react-router-dom';

// layouts
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// guards
import PublicRoute from './components/router/PublicRoute';
import ProtectedRoute from './components/router/ProtectedRoute';

// auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// dashboard pages (placeholders for phases D, E, F arrive next)
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/NotFound';
import Products from './pages/dashboard/Products';

function App() {
  return (
    <Routes>
      {/* Root redirects into the app */}
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      {/* Auth routes: only when logged out */}
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

      {/* Dashboard routes: only when logged in */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path='/dashboard' element={<Dashboard />} />

        {/* Placeholder routes: pages arrive in phases D, E, F */}
        <Route path='/products' element={<Products />} />
        <Route
          path='/alerts'
          element={
            <div className='card p-8 text-center text-text-muted'>
              Alerts page coming in Phase E
            </div>
          }
        />
        <Route
          path='/reports'
          element={
            <div className='card p-8 text-center text-text-muted'>
              Reports page coming in Phase F
            </div>
          }
        />
      </Route>

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
