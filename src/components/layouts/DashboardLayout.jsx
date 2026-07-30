import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // overflow-hidden on the root prevents the body from scrolling
    <div className='h-screen overflow-hidden bg-bg'>
      {/* Mobile overlay behind sidebar */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-20 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: always fixed, slides in on mobile */}
      <div
        className={`fixed top-0 left-0 h-full z-30 transition-transform
                    duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Right side: fixed height, header at top, main scrolls */}
      <div className='lg:ml-64 h-screen flex flex-col'>
        {/* Header never scrolls because it sits outside main */}
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        {/* ONLY this area scrolls. Header stays pinned above it. */}
        <main className='flex-1 overflow-y-auto thin-scrollbar p-4 md:p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
