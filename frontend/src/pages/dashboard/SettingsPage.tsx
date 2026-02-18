'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Camera,
  Save,
  Loader2,
  CircleAlert as AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { storageService } from '@/services/storage.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    setHasChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!isSupabaseConfigured()) {
      toast.error('Image upload not available', {
        description: 'Supabase storage is not configured. Please contact the administrator.',
      });
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await storageService.uploadImage(file, 'avatars');
      
      if (result.success && result.url) {
        setUploadedAvatarUrl(result.url);
        setHasChanges(true);
        toast.success('Profile picture uploaded!');
      } else {
        setAvatarPreview(user?.avatar || null);
        toast.error('Failed to upload image', {
          description: result.error || 'Please try again.',
        });
      }
    } catch (error: any) {
      setAvatarPreview(user?.avatar || null);
      toast.error('Upload failed', {
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploadedAvatarUrl && uploadedAvatarUrl !== user?.avatar) {
      await storageService.deleteImage(uploadedAvatarUrl);
    }
    setAvatarPreview(null);
    setUploadedAvatarUrl(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    
    try {
      const updateData: { name?: string; avatar?: string } = {};
      
      if (formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      
      if (uploadedAvatarUrl !== user?.avatar) {
        updateData.avatar = uploadedAvatarUrl || '';
      }

      await updateProfile(updateData);
      
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved.',
      });
      
      setHasChanges(false);
    } catch (error: any) {
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and profile information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={avatarPreview || undefined} alt={user?.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-white">
                      {getInitials(user?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className={cn(
                      "absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white",
                      "flex items-center justify-center shadow-lg",
                      "hover:bg-primary/90 transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                    
                    {avatarPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Recommended: Square image, at least 200x200 pixels. Max 10MB.
                  </p>
                  
                  {!isSupabaseConfigured() && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Supabase not configured - image upload disabled
                    </p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                    // Reset input so same file can be selected again
                    e.target.value = '';
                  }}
                  disabled={isUploading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      user?.type === 'organizer' 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    )}>
                      {user?.type === 'organizer' ? 'Organizer' : 'Participant'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {hasChanges && (
              <p className="flex items-center text-sm text-amber-600 mr-auto">
                <AlertCircle className="h-4 w-4 mr-1" />
                You have unsaved changes
              </p>
            )}
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

