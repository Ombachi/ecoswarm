import { useEffect, useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AvatarFallback } from '@/components/common/AvatarFallback';
import { Settings, Edit, LogOut, MapPin, Mail, Leaf } from 'lucide-react';
import { toast } from 'sonner';
export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [details, setDetails] = useState({ email: '', county: '' });
  const [leaving, setLeaving] = useState(false);
  usePageMeta('My Profile', 'Your EcoSwarm identity and account.');
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('email,county').eq('user_id', user.id).maybeSingle().then(({data}) => { if (data) setDetails({ email: data.email, county: data.county || '' }); });
  }, [user?.id]);
  const handleLogout = async () => {
    setLeaving(true);
    try { await logout(); navigate('/'); } catch { toast.error('Unable to log out. Please try again.'); } finally { setLeaving(false); }
  };
  if (!user) return null;
  return <AppLayout><section className="max-w-3xl mx-auto w-full px-4 py-8 pb-24"><h1 className="text-2xl font-bold mb-6">My Profile</h1><article className="border border-border bg-card rounded-lg p-6 sm:p-8"><div className="flex flex-col sm:flex-row items-start gap-5"><AvatarFallback key={user.avatar} src={user.avatar} name={user.name} size="lg" /><div className="min-w-0"><h2 className="text-2xl font-bold break-words">{user.name}</h2><span className="inline-flex gap-1 items-center mt-2 text-xs font-semibold text-primary"><Leaf className="w-3.5 h-3.5" />EcoWarrior</span></div></div><div className="mt-6 space-y-3 text-sm"><p className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0 text-muted-foreground" />{details.email || '—'}</p><p className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0 text-muted-foreground" />{[user.location, details.county !== user.location ? details.county : ''].filter(Boolean).join(' · ')}</p>{user.bio && <p className="text-muted-foreground whitespace-pre-wrap break-words pt-3">{user.bio}</p>}</div><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => navigate('/edit-profile')}><Edit className="w-4 h-4 mr-2" />Edit Profile</Button><Button variant="outline" onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" />Account Settings</Button><Button variant="ghost" className="text-destructive" onClick={handleLogout} disabled={leaving}><LogOut className="w-4 h-4 mr-2" />{leaving ? 'Logging out…' : 'Log Out'}</Button></div></article></section></AppLayout>;
}
