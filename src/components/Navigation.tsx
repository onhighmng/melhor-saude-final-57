import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { redirectService } from '@/services/redirectService';
import MobileMenu from './MobileMenu';
import LoginDialog from './LoginDialog';
import DesktopMenu from './navigation/DesktopMenu';
import NavigationActions from './navigation/NavigationActions';
import { createMenuItems, createMobileMenuItems, createAdminMenuItems, createAdminMobileMenuItems, createHRMenuItems, createHRMobileMenuItems } from './navigation/menuData';
import { usePillarNavigation } from '@/hooks/usePillarNavigation';
const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    scrollToSobreNos,
    scrollToPillar
  } = usePillarNavigation();

  // Hide navigation on company dashboard
  if (location.pathname === '/company/dashboard') {
    return null;
  }

  // Safely get auth context with error handling
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context not available:', error);
    authContext = {
      isAuthenticated: false,
      isAdmin: false,
      isHR: false,
      user: null,
      profile: null,
      logout: () => {}
    };
  }
  const {
    isAuthenticated,
    isAdmin,
    isHR,
    user,
    profile,
    logout
  } = authContext;
  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  const handleNavigation = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
  };
  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleSobreNosClick = () => {
    setActiveDropdown(null);
    scrollToSobreNos();
  };
  const handlePillarClick = (pillarIndex: number) => {
    setActiveDropdown(null);
    scrollToPillar(pillarIndex);
  };
  const handleAuthRedirect = (section: string) => {
    setActiveDropdown(null);

    // Store the intended destination based on section
    const sectionPaths: Record<string, string[]> = {
      agendamento: ['/user/book'],
      'minha-saude': ['/user/dashboard']
    };

    // For now, redirect to the first path of each section
    // In a real app, you might want to store the specific intended path
    const intendedPaths = sectionPaths[section];
    if (intendedPaths && intendedPaths.length > 0) {
      redirectService.setRedirectIntent(intendedPaths[0]);
    }
    navigate('/login');
  };
  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const handleRegisterClick = () => {
    navigate('/register/employee');
  };


  // Choose menu items based on user role
  const menuItems = isAdmin ? createAdminMenuItems(handleNavigation) : isHR ? createHRMenuItems(handleNavigation) : createMenuItems(handleSobreNosClick, handlePillarClick, handleNavigation, isAuthenticated, handleAuthRedirect);
  const mobileMenuItems = isAdmin ? createAdminMobileMenuItems() : isHR ? createHRMobileMenuItems() : createMobileMenuItems(isAuthenticated, handleAuthRedirect, handleSobreNosClick, handlePillarClick);
  return <>
      <nav className="fixed top-2 left-0 right-0 z-50 w-full max-w-none">
        <div className="relative z-50 w-full max-w-[1500px] mx-auto px-2 sm:px-8 my-0 py-0">
          {/* Unified Glass Morphism Container */}
          <div className="flex items-center justify-between h-[60px] sm:h-[72px] px-2 sm:px-8 glass-effect rounded-xl shadow-custom-md hover:shadow-custom-lg transition-smooth">
            
            {/* Logo Section */}
            <div className="flex items-center cursor-pointer press-effect transition-smooth" onClick={handleLogoClick}>
              {/* Logo removed */}
            </div>

            {/* Center Navigation */}
            <DesktopMenu menuItems={menuItems} activeDropdown={activeDropdown} onDropdownToggle={handleDropdownToggle} onNavigation={handleNavigation} />

            {/* Right Side Actions */}
            <NavigationActions onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} onMobileMenuOpen={() => setIsMobileMenuOpen(true)} onLogoutClick={handleLogoutClick} isAuthenticated={isAuthenticated} user={profile} />
          </div>
        </div>

        {/* Click outside to close dropdowns */}
        {activeDropdown && <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />}
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} menuItems={mobileMenuItems} />
      
      {/* Login Dialog */}
      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>;
};
export default Navigation;