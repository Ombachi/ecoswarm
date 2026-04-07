import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ChevronRight, XCircle, Clock, CheckCircle2 } from 'lucide-react';

interface MiniAdvocacy {
  id: string;
  title: string;
  response_status: string;
  target_name: string;
  days_ago: number;
}

const statusIcon: Record<string, any> = {
  no_response: XCircle,
  acknowledged: Clock,
  committed: CheckCircle2,
  fulfilled: CheckCircle2,
};

const statusColor: Record<string, string> = {
  no_response: 'text-destructive',
  acknowledged: 'text-[hsl(var(--eco-gold))]',
  committed: 'text-[hsl(var(--eco-blue))]',
  fulfilled: 'text-primary',
};

export function AccountabilityWidget() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MiniAdvocacy[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: advocacies } = await supabase
      .from('business_advocacy')
      .select('id, title, response_status, created_at, target_recipient_id')
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(4);

    if (!advocacies?.length) return;

    const recipientIds = advocacies.map(a => a.target_recipient_id).filter(Boolean);
    const { data: recipients } = recipientIds.length > 0
      ? await supabase.from('recipients').select('id, name').in('id', recipientIds as string[])
      : { data: [] };

    const recipientMap = Object.fromEntries((recipients || []).map(r => [r.id, r.name]));

    setItems(advocacies.map(a => ({
      id: a.id,
      title: a.title,
      response_status: a.response_status || 'no_response',
      target_name: a.target_recipient_id ? recipientMap[a.target_recipient_id] || 'Unknown' : 'Unknown',
      days_ago: Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    })));
  };

  if (items.length === 0) return null;

  return (
    <div>
      <button onClick={() => navigate('/accountability')} className="flex items-center justify-between w-full mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-destructive" /> Accountability
        </h3>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="space-y-2">
        {items.map(item => {
          const Icon = statusIcon[item.response_status] || XCircle;
          const color = statusColor[item.response_status] || 'text-muted-foreground';
          return (
            <div
              key={item.id}
              onClick={() => navigate('/accountability')}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Icon className={`w-5 h-5 shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.target_name} · {item.days_ago}d ago</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
