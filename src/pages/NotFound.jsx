import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='min-h-screen bg-bg flex items-center justify-center'>
      <div className='text-center'>
        <p className='text-7xl font-bold text-primary'>404</p>
        <h1 className='text-2xl font-semibold text-text-heading mt-4'>
          Page not found
        </h1>
        <p className='text-text-muted mt-2'>
          The page you are looking for does not exist.
        </p>
        <Link to='/' className='btn inline-block mt-8 px-8'>
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
