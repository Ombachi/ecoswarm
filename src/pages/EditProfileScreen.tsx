import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, Save, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

export function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, setUser, refreshUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar || '');
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setBio((data as unknown as { bio?: string }).bio || '');
        setAvatarUrl((data as unknown as { avatar_url?: string }).avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Photo uploaded!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar: avatarUrl || undefined,
      });

      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-muted text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="eco-button-primary py-2 px-4 flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl eco-gradient-bg flex items-center justify-center text-4xl font-bold text-white">
                {name.charAt(0) || 'U'}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="eco-input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="eco-input min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {bio.length}/300
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
