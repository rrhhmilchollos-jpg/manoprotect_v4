/**
 * Hook to detect subdomain and determine app mode
 * Used to serve different experiences based on subdomain:
 * - admin.manoprotect.com -> Enterprise Portal (Employee Management)
 * - manoprotect.com -> Main Consumer App
 */
import { useMemo } from 'react';

export const SUBDOMAIN_MODES = {
  MAIN: 'main',           // manoprotect.com - Consumer app
  ADMIN: 'admin',         // admin.manoprotect.com - Enterprise Portal
  PREVIEW: 'preview'      // *.preview.emergentagent.com - Development
};

export const useSubdomain = () => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    // Development/Preview environments
    if (hostname === 'localhost' || 
        hostname.includes('preview') || 
        hostname.includes('staging') ||
        hostname.includes('127.0.0.1')) {
      return {
        mode: SUBDOMAIN_MODES.PREVIEW,
        subdomain: null,
        isAdmin: false,
        isMain: true,
        hostname
      };
    }
    
    // Check for admin subdomain
    if (hostname.startsWith('admin.')) {
      return {
        mode: SUBDOMAIN_MODES.ADMIN,
        subdomain: 'admin',
        isAdmin: true,
        isMain: false,
        hostname
      };
    }
    
    // Main domain (manoprotect.com or www.manoprotect.com)
    return {
      mode: SUBDOMAIN_MODES.MAIN,
      subdomain: hostname.startsWith('www.') ? 'www' : null,
      isAdmin: false,
      isMain: true,
      hostname
    };
  }, []);
};

/**
 * Get subdomain info without React hook (for use outside components)
 */
export const getSubdomainInfo = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || 
      hostname.includes('preview') || 
      hostname.includes('staging') ||
      hostname.includes('127.0.0.1')) {
    return {
      mode: SUBDOMAIN_MODES.PREVIEW,
      subdomain: null,
      isAdmin: false,
      isMain: true
    };
  }
  
  if (hostname.startsWith('admin.')) {
    return {
      mode: SUBDOMAIN_MODES.ADMIN,
      subdomain: 'admin',
      isAdmin: true,
      isMain: false
    };
  }
  
  return {
    mode: SUBDOMAIN_MODES.MAIN,
    subdomain: hostname.startsWith('www.') ? 'www' : null,
    isAdmin: false,
    isMain: true
  };
};

export default useSubdomain;
