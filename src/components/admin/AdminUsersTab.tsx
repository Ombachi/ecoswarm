import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  eco_points: number | null;
  streak: number | null;
  created_at: string;
  location: string | null;
  role?: string;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, email, eco_points, streak, created_at, location')
      .order('created_at', { ascending: false });

    if (profiles) {
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      setUsers(profiles.map(p => ({ ...p, role: roleMap[p.user_id] || 'ecowarrior' })));
    }
    setIsLoading(false);
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.includes(q);
  });

  const roleColor = (role?: string) => {
    if (role === 'admin') return 'bg-destructive/10 text-destructive';
    if (role === 'ecodeveloper') return 'bg-primary/10 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="pl-10"
        />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} users</p>

      {filtered.map(u => (
        <div key={u.user_id} className="eco-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground text-sm truncate">{u.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${roleColor(u.role)}`}>
                  {u.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span>{u.eco_points ?? 0} pts</span>
                <span>🔥 {u.streak ?? 0}</span>
                <span>{u.location || 'Unknown'}</span>
                <span>{new Date(u.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
