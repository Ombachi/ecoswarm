import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ShieldCheck, Ban, Trash2, UserCheck, MoreVertical, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Pagination } from '@/components/common/Pagination';

const USERS_PER_PAGE = 15;

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  location: string | null;
  role?: string;
  email_confirmed?: boolean;
  is_suspended?: boolean;
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ user: UserProfile; action: 'delete' | 'suspend' | 'unsuspend' | 'activate'; role?: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, email, created_at, location')
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

  const runAction = async (user: UserProfile, action: string, role?: string) => {
    setBusyId(user.user_id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-actions', {
        body: { action, target_user_id: user.user_id, role },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const labels: Record<string, string> = {
        activate: 'Account activated',
        suspend: 'Account suspended',
        unsuspend: 'Account reinstated',
        delete: 'Account deleted',
        set_role: `Role set to ${role}`,
      };
      toast.success(labels[action] ?? 'Done');
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message ?? 'Action failed');
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.includes(q);
  });

  const roleColor = (role?: string) => {
    if (role === 'admin') return 'bg-destructive/10 text-destructive';
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

      {filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE).map(u => (
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
                <span>{u.location || 'Unknown'}</span>
                <span>{new Date(u.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={busyId === u.user_id}>
                  {busyId === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover z-50">
                <DropdownMenuLabel className="text-xs">Manage user</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setConfirm({ user: u, action: 'activate' })}>
                  <UserCheck className="w-4 h-4 mr-2" /> Activate account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Assign role</DropdownMenuLabel>
                <DropdownMenuItem disabled={u.role === 'ecowarrior'} onClick={() => runAction(u, 'set_role', 'ecowarrior')}>
                  EcoWarrior
                </DropdownMenuItem>
                <DropdownMenuItem disabled={u.role === 'admin'} onClick={() => runAction(u, 'set_role', 'admin')}>
                  EcoDeveloper
                </DropdownMenuItem>
                <DropdownMenuItem disabled={u.role === 'admin'} onClick={() => runAction(u, 'set_role', 'admin')}>
                  <ShieldCheck className="w-4 h-4 mr-2" /> Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setConfirm({ user: u, action: 'suspend' })}>
                  <Ban className="w-4 h-4 mr-2" /> Suspend account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirm({ user: u, action: 'unsuspend' })}>
                  <ShieldOff className="w-4 h-4 mr-2" /> Reinstate account
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirm({ user: u, action: 'delete' })}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      <Pagination
        page={page}
        pageCount={Math.ceil(filtered.length / USERS_PER_PAGE)}
        onPageChange={setPage}
      />

      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === 'delete' && 'Delete this account?'}
              {confirm?.action === 'suspend' && 'Suspend this account?'}
              {confirm?.action === 'unsuspend' && 'Reinstate this account?'}
              {confirm?.action === 'activate' && 'Activate this account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === 'delete' && `This permanently removes ${confirm.user.name}'s auth account. Profile data may remain. This cannot be undone.`}
              {confirm?.action === 'suspend' && `${confirm.user.name} will be blocked from signing in until reinstated.`}
              {confirm?.action === 'unsuspend' && `${confirm.user.name} will regain access to their account.`}
              {confirm?.action === 'activate' && `Manually verify ${confirm.user.name}'s email so they can sign in without confirming.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirm?.action === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              onClick={() => confirm && runAction(confirm.user, confirm.action)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
