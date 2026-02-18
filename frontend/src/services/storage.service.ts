import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const BUCKET_NAME = 'cc_sporting_events';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const storageService = {
  /**
   * Upload an image file to Supabase Storage
   * @param file - The file to upload
   * @param folder - Optional folder path within the bucket (defaults to 'events')
   * @returns The public URL of the uploaded file
   */
  async uploadImage(file: File, folder: string = 'events'): Promise<UploadResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
        };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File is too large. Maximum size is 10MB.',
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `${folder}/${uniqueId}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase!.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: error.message || 'Failed to upload image',
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase!.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrlData.publicUrl,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during upload',
      };
    }
  },

  /**
   * Delete an image from Supabase Storage
   * @param url - The public URL of the image to delete
   */
  async deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured.',
      };
    }

    try {
      // Extract file path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
      
      if (pathParts.length < 2) {
        return {
          success: false,
          error: 'Invalid image URL',
        };
      }

      const filePath = pathParts[1];

      const { error } = await supabase!.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }
  },
};

