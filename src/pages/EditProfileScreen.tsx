import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos',
  'Kajiado', 'Uasin Gishu', 'Nyeri', 'Meru', 'Kilifi', 'Kakamega', 'Bungoma',
  'Kisii', 'Nyamira', 'Trans Nzoia', 'Nandi', 'Kericho', 'Bomet'
];

const concerns = [
  'Climate Action', 'Mental Health', 'Education Access', 'Youth Unemployment',
  'Affordable Housing', 'Healthcare Access', 'Gender Equality', 'Anti-Corruption',
  'Environmental Protection', 'Digital Rights'
];

export function EditProfileScreen() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [county, setCounty] = useState('');
  const [phone, setPhone] = useState('');
  const [topConcern, setTopConcern] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTopConcern(user.topConcern || '');
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
        setAge(data.age?.toString() || '');
        setSex(data.sex || '');
        setCounty(data.county || data.location || '');
        setPhone(data.phone || '');
        setTopConcern(data.top_concern || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
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
          age: age ? parseInt(age) : null,
          sex: sex || null,
          county: county || null,
          location: county || null,
          phone: phone || null,
          top_concern: topConcern || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local user state
      setUser({
        ...user,
        name: name.trim(),
        location: county || user.location,
        topConcern: topConcern || user.topConcern,
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
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl eco-gradient-bg flex items-center justify-center text-4xl font-bold text-white">
            {name.charAt(0) || 'U'}
          </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="eco-input"
                placeholder="Your age"
                min="13"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="eco-input"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              County
            </label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="eco-input"
            >
              <option value="">Select county</option>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="eco-input"
              placeholder="0712 345 678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Top Concern
            </label>
            <select
              value={topConcern}
              onChange={(e) => setTopConcern(e.target.value)}
              className="eco-input"
            >
              <option value="">Select your top concern</option>
              {concerns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
