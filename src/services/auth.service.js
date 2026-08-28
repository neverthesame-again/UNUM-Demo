// Auth Service - Supabase Authentication Logic

import { supabase } from '../lib/supabase';
import { isSuperAdminEmail } from '../constants/admin-emails';
import { BUSINESS_AREAS, getRolesForBusinessArea } from '../constants/business-areas';

// Validate email domain — allow @tcs.com and any super-admin overrides
export const validateTCSEmail = (email) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  // Super admin gmail (or other domain) overrides are always allowed
  if (isSuperAdminEmail(normalized)) return true;
  return normalized.endsWith('@tcs.com');
};

// Validate password strength
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasNumber;
};

export const authService = {
  // Register new user
  register: async (email, password, fullName, birthYear, businessAreas = [], requestedRoles = []) => {
    try {
      // Validate inputs
      if (!validateTCSEmail(email)) {
        throw new Error('Please use your @tcs.com email address');
      }
      
      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters with 1 uppercase and 1 number');
      }
      
      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Please enter your full name');
      }
      
      if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
        throw new Error('Please enter a valid birth year');
      }
      
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });
      
      if (authError) throw authError;
      
      // Check if user is Super Admin
      const isSuperAdmin = isSuperAdminEmail(email);
      
      // Create or update user profile with business_area and role
      const primaryArea = Array.isArray(businessAreas) && businessAreas.length > 0 ? businessAreas[0] : "AI for AD";
      const primaryRole = Array.isArray(requestedRoles) && requestedRoles.length > 0 ? requestedRoles[0] : "Developer";

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: authData.user.id,
          full_name: fullName.trim(),
          email: email.toLowerCase().trim(),
          birth_year: parseInt(birthYear),
          business_area: primaryArea,
          role: primaryRole,
          domains: businessAreas,
          roles: requestedRoles,
          access_status: isSuperAdmin ? 'approved' : 'pending'
        }], { onConflict: 'email' });
      
      if (profileError) {
        console.warn('Profile creation warning (continuing with local state):', profileError);
      }
      
      const areaRoles = getRolesForBusinessArea(primaryArea).map((r) => r.value);
      const isDomainAdmin = primaryRole === 'Admin';

      // Return user data with admin flag and access status
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        name: fullName.trim(),
        avatarInitials: fullName.trim().charAt(0).toUpperCase(),
        isSuperAdmin,
        isAdmin: isSuperAdmin,
        isDomainAdmin,
        accessStatus: isSuperAdmin ? 'approved' : 'pending',
        activeRole: primaryRole,
        activeAreaRoles: areaRoles,
        domains: businessAreas,
        roles: requestedRoles
      };
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (email, password, businessArea, role) => {
    try {
      // Validate email domain
      if (!validateTCSEmail(email)) {
        throw new Error('Please use your @tcs.com email address');
      }
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) throw error;
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Cleanup legacy local storage
      localStorage.removeItem('user_permissions_map');

      // Arrays fallback
      const userDomains = (profile.domains && profile.domains.length > 0)
        ? profile.domains
        : (profile.business_area ? [profile.business_area] : []);
        
      const userRoles = (profile.roles && profile.roles.length > 0)
        ? profile.roles
        : (profile.role ? [profile.role] : []);

      const isSuperAdmin = isSuperAdminEmail(data.user.email);
      
      // Fallbacks if not provided
      const activeBusinessArea = businessArea || (userDomains.length > 0 ? userDomains[0] : 'AI for AD');
      let activeRole = role || (userRoles.length > 0 ? userRoles[0] : 'Admin');

      // Persist active session context
      localStorage.setItem('active_business_area', activeBusinessArea);
      localStorage.setItem('active_role', activeRole);

      const areaRoles = getRolesForBusinessArea(activeBusinessArea).map((r) => r.value);
      const isDomainAdmin = activeRole === 'Admin';

      // Return user data with admin flags, access status, and selected role context
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: profile.full_name,
        avatarInitials: profile.full_name.charAt(0).toUpperCase(),
        isSuperAdmin,
        isAdmin: isSuperAdmin,
        isDomainAdmin,
        accessStatus: profile.access_status || 'pending',
        activeBusinessArea,
        activeRole,
        activeAreaRoles: areaRoles,
        domains: userDomains,
        roles: userRoles
      };
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      localStorage.removeItem('active_business_area');
      localStorage.removeItem('active_role');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      // getSession reads from local storage — no network call
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return null;
      
      // Fetch profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) return null;

      const userDomains = (profile.domains && profile.domains.length > 0)
        ? profile.domains
        : (profile.business_area ? [profile.business_area] : []);
        
      const userRoles = (profile.roles && profile.roles.length > 0)
        ? profile.roles
        : (profile.role ? [profile.role] : []);
        
      const activeBusinessArea = localStorage.getItem('active_business_area') || (userDomains.length > 0 ? userDomains[0] : 'AI for AD');
      const activeRole = localStorage.getItem('active_role') || (userRoles.length > 0 ? userRoles[0] : 'Admin');
      const areaRoles = getRolesForBusinessArea(activeBusinessArea).map((r) => r.value);
      const isSuperAdmin = isSuperAdminEmail(user.email);
      const isDomainAdmin = activeRole === 'Admin';

      return {
        id: user.id,
        email: user.email,
        name: profile.full_name,
        avatarInitials: profile.full_name.charAt(0).toUpperCase(),
        isSuperAdmin,
        isAdmin: isSuperAdmin,
        isDomainAdmin,
        accessStatus: profile.access_status || 'pending',
        activeBusinessArea,
        activeRole,
        activeAreaRoles: areaRoles,
        domains: userDomains,
        roles: userRoles
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Get user profile by email (useful for pre-login checks)
  getUserProfileByEmail: async (email) => {
    try {
      if (!validateTCSEmail(email)) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();
        
      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error fetching profile by email:', error);
      return null;
    }
  },

  // Get birth year for forgot password flow
  getBirthYearForEmail: async (email) => {
    try {
      if (!validateTCSEmail(email)) {
        throw new Error('Please use your @tcs.com email address');
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('birth_year')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error) throw new Error('Email not found');
      
      return { success: true, exists: true };
    } catch (error) {
      console.error('Get birth year error:', error);
      throw error;
    }
  },
  
  // Verify birth year for account recovery
  verifyBirthYear: async (email, birthYear) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('birth_year')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error) throw new Error('Email not found');
      
      const isMatch = parseInt(data.birth_year) === parseInt(birthYear);
      if (!isMatch) {
        throw new Error('Birth year does not match our records');
      }
      
      // Mark user as verified for password reset (valid for 10 minutes)
      const { error: markError } = await supabase
        .rpc('mark_reset_verified', { user_email: email.toLowerCase().trim() });
      
      if (markError) {
        console.error('Mark verification error:', markError);
      }
      
      return { success: true, verified: true };
    } catch (error) {
      console.error('Verify birth year error:', error);
      throw error;
    }
  },
  
  // Reset password after identity verification (no email needed)
  resetPasswordDirect: async (email, newPassword) => {
    try {
      if (!validatePassword(newPassword)) {
        throw new Error('Password must be at least 8 characters with 1 uppercase and 1 number');
      }
      
      // Call Edge Function to reset password
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          newPassword: newPassword
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};
