import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, Suspense } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AdminHome from './pages/AdminHome'
import AdminUsers from './pages/AdminUsers'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminProviderManagement from './pages/AdminProviderManagement'
import AdminServiceManagement from './pages/AdminServiceManagement'
import AdminServiceDetails from './pages/AdminServiceDetails'
import AdminBookingManagement from './pages/AdminBookingManagement'
import AdminCustomerReportManagement from './pages/AdminCustomerReportManagement'
import AdminSaleManagement from './pages/AdminSaleManagement'
import AdminVerification from './pages/AdminVerification'
import Register from './pages/Register'
import ServiceDetails from './pages/ServiceDetails'
import ProviderDetails from './pages/ProviderDetails'
import ProviderServiceList from './pages/ProviderServiceList'
import ProviderHomepage from './pages/ProviderHomepage'
import ProviderServices from './pages/ProviderServices'
import ProviderServiceFullDetails from './pages/ProviderServiceFullDetails'
import ProviderBookings from './pages/ProviderBookings'
import UserChat from './pages/UserChat'
import ProviderChat from './pages/ProviderChat'
import UserReports from './pages/UserReports'
import { authService } from './service/authService'
import './App.css'

// Lazy load components that are causing verbatimModuleSyntax issues
import { lazy } from 'react'
const ProviderProfile = lazy(() => import('./pages/ProviderProfile'))
const UserBooking = lazy(() => import('./pages/UserBooking'))
const UserProfile = lazy(() => import('./pages/UserProfile'))

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const isProviderRoute = location.pathname.startsWith('/provider-');
  const isAdminRoute = location.pathname.startsWith('/admin-');

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = authService.isAuthenticated();
      const type = authService.getStoredUserType();
      setIsAuthenticated(authenticated);
      setUserType(type);
    };

    checkAuthStatus();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    // Prevent back navigation to login/homepage when authenticated
    const handlePopState = (event: PopStateEvent) => {
      if (isAuthenticated && userType) {
        const targetPath = location.pathname;

        // If user is authenticated and trying to go back to login or public homepage
        if (targetPath === '/login' || targetPath === '/register' || (targetPath === '/' && userType === 'provider') || (targetPath === '/home' && userType === 'provider')) {
          event.preventDefault();

          // Redirect to appropriate authenticated homepage
          if (userType === 'provider') {
            navigate('/provider-homepage', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, userType, location.pathname, navigate]);

  // Redirect authenticated users away from login/register pages
  useEffect(() => {
    if (isAuthenticated && userType) {
      const currentPath = location.pathname;

      if (currentPath === '/login' || currentPath === '/register') {
        if (userType === 'provider') {
          navigate('/provider-homepage', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }

      // Redirect providers away from public homepage
      if (userType === 'provider' && currentPath === '/') {
        navigate('/provider-homepage', { replace: true });
      }
    }
  }, [isAuthenticated, userType, location.pathname, navigate]);

  return (
    <div className="App">
      {!isProviderRoute && !isAdminRoute && <Header />}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-user-management" element={<AdminUserManagement />} />
          <Route path="/admin-provider-management" element={<AdminProviderManagement />} />
          <Route path="/admin-service-management" element={<AdminServiceManagement />} />
          <Route path="/admin-service-details/:id" element={<AdminServiceDetails />} />
          <Route path="/admin-booking-management" element={<AdminBookingManagement />} />
          <Route path="/admin-customer-reports" element={<AdminCustomerReportManagement />} />
          <Route path="/admin-sale-management" element={<AdminSaleManagement />} />
          <Route path="/admin-verification" element={<AdminVerification />} />
          <Route path="/register" element={<Register />} />
          <Route path="/service/:serviceId" element={<ServiceDetails />} />
          <Route path="/provider/:providerId" element={<ProviderDetails />} />
          <Route path="/provider/:providerId/services" element={<ProviderServiceList />} />
          <Route path="/provider-homepage" element={<ProviderHomepage />} />
          <Route path="/provider-services" element={<ProviderServices />} />
          <Route path="/provider-services/:serviceId" element={<ProviderServiceFullDetails />} />
          <Route path="/provider-bookings" element={<ProviderBookings />} />
          <Route path="/provider-chat" element={<ProviderChat />} />
          <Route path="/provider-profile" element={<ProviderProfile />} />
          <Route path="/user-booking" element={<UserBooking />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/user-chat" element={<UserChat />} />
          <Route path="/user-reports" element={<UserReports />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
