// Enhanced Report Saving Service for Citizen-Only Submission
// UERRA (Unisan Emergency Reporting and Response App)

import { supabase } from '../supabaseClient';

/**
 * Service class for handling citizen report submissions
 * Ensures only citizens can submit reports with proper validation
 */
export class CitizenReportService {
  
  /**
   * Validates if the current user is a citizen
   * @param {Object} user - Current authenticated user
   * @returns {boolean} - True if user is a citizen
   */
  static async validateCitizen(user) {
    if (!user || !user.id) {
      throw new Error('User must be authenticated to submit reports');
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error('Failed to verify user role');
    }

    if (userData.role !== 'citizen') {
      throw new Error('Only citizens are authorized to submit emergency reports');
    }

    return true;
  }

  /**
   * Uploads photo to Supabase storage
   * @param {File} photoFile - Photo file to upload
   * @param {string} userId - User ID for file naming
   * @returns {string} - Public URL of uploaded photo
   */
  static async uploadPhoto(photoFile, userId) {
    if (!photoFile) return null;

    // Validate file size (max 5MB)
    if (photoFile.size > 5 * 1024 * 1024) {
      throw new Error('Photo file size must be less than 5MB');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(photoFile.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(`reports/${fileName}`, photoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Validates report data before submission
   * @param {Object} reportData - Report data to validate
   */
  static validateReportData(reportData) {
    const errors = [];

    // Required fields validation
    if (!reportData.category_id) {
      errors.push('Emergency category is required');
    }
    if (!reportData.description || reportData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    // Optional field validation
    if (reportData.title && reportData.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    if (reportData.description && reportData.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (reportData.priority && !validPriorities.includes(reportData.priority)) {
      errors.push('Invalid priority level');
    }

    // Emergency level validation
    const validEmergencyLevels = ['standard', 'urgent', 'life_threatening'];
    if (reportData.emergency_level && !validEmergencyLevels.includes(reportData.emergency_level)) {
      errors.push('Invalid emergency level');
    }

    // Location validation
    if (reportData.location) {
      const { lat, lng } = reportData.location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('Invalid location coordinates');
      }
      // Validate coordinates are within reasonable bounds for Philippines
      if (lat < 4.0 || lat > 21.0 || lng < 116.0 || lng > 127.0) {
        errors.push('Location coordinates appear to be outside the Philippines');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  /**
   * Submits a new emergency report (Citizen only)
   * @param {Object} reportData - Report data
   * @param {Object} user - Current authenticated user
   * @param {File|null} photoFile - Optional photo file
   * @returns {Object} - Created report data
   */
  static async submitReport(reportData, user, photoFile = null) {
    try {
      // Step 1: Validate user is a citizen
      await this.validateCitizen(user);

      // Step 2: Validate report data
      this.validateReportData(reportData);

      // Step 3: Upload photo if provided
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await this.uploadPhoto(photoFile, user.id);
      }

      // Step 4: Prepare location data for PostGIS
      let locationPoint = null;
      if (reportData.location) {
        const { lat, lng } = reportData.location;
        locationPoint = `POINT(${lng} ${lat})`;
      }

      // Step 5: Get client metadata
      const clientMetadata = this.getClientMetadata();

      // Step 6: Prepare final report data
      const finalReportData = {
        user_id: user.id,
        category_id: reportData.category_id,
        description: reportData.description.trim(),
        priority: reportData.priority || 'medium',
        emergency_level: reportData.emergency_level || 'standard',
        location: locationPoint,
        photo_url: photoUrl,
        citizen_contact: reportData.contact?.trim() || null,
        is_anonymous: reportData.is_anonymous || false,
        submitted_via: 'web',
        ip_address: clientMetadata.ip,
        user_agent: clientMetadata.userAgent,
        status: 'pending'
      };

      // Step 7: Insert report into database
      const { data: insertedReport, error: insertError } = await supabase
        .from('reports')
        .insert([finalReportData])
        .select(`
          *,
          categories:category_id (
            name,
            color,
            emergency_tips,
            assigned_agencies
          )
        `)
        .single();

      if (insertError) {
        throw new Error(`Failed to submit report: ${insertError.message}`);
      }

      // Step 8: Create initial report update
      const { error: updateError } = await supabase
        .from('report_updates')
        .insert([{
          report_id: insertedReport.id,
          user_id: user.id,
          status: 'pending',
          notes: 'Emergency report submitted by citizen',
          update_type: 'status_change',
          is_public: true
        }]);

      if (updateError) {
        console.warn('Failed to create initial report update:', updateError.message);
      }

      // Step 9: Return success response
      return {
        success: true,
        report: insertedReport,
        message: 'Emergency report submitted successfully'
      };

    } catch (error) {
      console.error('Report submission error:', error);
      
      // Clean up uploaded photo if report submission failed
      if (photoFile && error.message.includes('Failed to submit report')) {
        // Note: In a real app, you might want to implement cleanup
        console.warn('Report submission failed, photo may remain in storage');
      }

      return {
        success: false,
        error: error.message,
        message: 'Failed to submit emergency report'
      };
    }
  }

  /**
   * Gets client metadata for tracking
   * @returns {Object} - Client information
   */
  static getClientMetadata() {
    return {
      userAgent: navigator.userAgent || 'Unknown',
      ip: null, // This would need to be obtained from a service
      timestamp: new Date().toISOString(),
      language: navigator.language || 'en'
    };
  }

  /**
   * Fetches user's submitted reports
   * @param {string} userId - User ID
   * @returns {Array} - Array of user's reports
   */
  static async getUserReports(userId, filters = {}) {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          categories:category_id (
            name,
            color,
            emergency_tips
          ),
          report_updates (
            id,
            status,
            notes,
            update_type,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      return {
        success: true,
        reports: data || []
      };

    } catch (error) {
      console.error('Error fetching user reports:', error);
      return {
        success: false,
        error: error.message,
        reports: []
      };
    }
  }

  /**
   * Updates a pending report (citizen can only update their own pending reports)
   * @param {string} reportId - Report ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - Current user
   * @returns {Object} - Update result
   */
  static async updateReport(reportId, updateData, user) {
    try {
      // Validate user is a citizen
      await this.validateCitizen(user);

      // Validate update data
      this.validateReportData(updateData);

      // Only allow updating certain fields and only if status is pending
      const allowedFields = ['title', 'description', 'address', 'priority', 'citizen_contact'];
      const filteredUpdate = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          filteredUpdate[key] = updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('reports')
        .update(filteredUpdate)
        .eq('id', reportId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update report: ${error.message}`);
      }

      // Add update note
      await supabase
        .from('report_updates')
        .insert([{
          report_id: reportId,
          user_id: user.id,
          status: data.status,
          notes: 'Report updated by citizen',
          update_type: 'note',
          is_public: true
        }]);

      return {
        success: true,
        report: data,
        message: 'Report updated successfully'
      };

    } catch (error) {
      console.error('Report update error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update report'
      };
    }
  }

  /**
   * Cancels a pending report
   * @param {string} reportId - Report ID
   * @param {Object} user - Current user
   * @param {string} reason - Cancellation reason
   * @returns {Object} - Cancellation result
   */
  static async cancelReport(reportId, user, reason = '') {
    try {
      // Validate user is a citizen
      await this.validateCitizen(user);

      const { data, error } = await supabase
        .from('reports')
        .update({ status: 'cancelled' })
        .eq('id', reportId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to cancel report: ${error.message}`);
      }

      // Add cancellation note
      await supabase
        .from('report_updates')
        .insert([{
          report_id: reportId,
          user_id: user.id,
          status: 'cancelled',
          notes: `Report cancelled by citizen. Reason: ${reason || 'No reason provided'}`,
          update_type: 'status_change',
          is_public: true
        }]);

      return {
        success: true,
        report: data,
        message: 'Report cancelled successfully'
      };

    } catch (error) {
      console.error('Report cancellation error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to cancel report'
      };
    }
  }
}

export default CitizenReportService;
