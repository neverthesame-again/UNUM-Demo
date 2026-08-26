// Access Request Service - Manages user access approval workflow

import { supabase } from '../lib/supabase';

const accessRequestService = {
  /**
   * Get all pending access requests
   * @returns {Promise<Array>} List of users with pending access
   */
  async getPendingRequests() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('access_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw new Error('Failed to fetch pending access requests');
    }
  },

  /**
   * Get all declined access requests
   * @returns {Promise<Array>} List of users with declined access
   */
  async getDeclinedRequests() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('access_status', 'declined')
        .order('reviewed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching declined requests:', error);
      throw new Error('Failed to fetch declined access requests');
    }
  },

  /**
   * Get count of pending requests (for badge display)
   * @returns {Promise<number>} Count of pending requests
   */
  async getPendingCount() {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('access_status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching pending count:', error);
      return 0;
    }
  },

  /**
   * Approve an access request
   * @param {string} userId - User ID to approve
   * @param {string} adminId - Admin user ID who is approving
   * @returns {Promise<Object>} Updated user profile
   */
  async approveRequest(userId, adminId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          access_status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          decline_reason: null, // Clear any previous decline reason
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw new Error('Failed to approve access request');
    }
  },

  /**
   * Decline an access request
   * @param {string} userId - User ID to decline
   * @param {string} adminId - Admin user ID who is declining
   * @param {string} reason - Optional reason for declining
   * @returns {Promise<Object>} Updated user profile
   */
  async declineRequest(userId, adminId, reason = '') {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          access_status: 'declined',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          decline_reason: reason || null,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error declining request:', error);
      throw new Error('Failed to decline access request');
    }
  },

  /**
   * Search access requests by name or email
   * @param {string} query - Search query
   * @param {string} status - Filter by status (pending/declined)
   * @returns {Promise<Array>} Filtered list of users
   */
  async searchRequests(query, status = 'pending') {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('access_status', status)
        .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching requests:', error);
      throw new Error('Failed to search access requests');
    }
  },
};

export default accessRequestService;
