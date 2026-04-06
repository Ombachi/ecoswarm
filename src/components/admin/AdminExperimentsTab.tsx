import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FlaskConical, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Experiment {
  id: string;
  name: string;
  description: string | null;
  variants: { name: string; weight: number }[];
  target_pages: string[];
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

interface ExperimentStats {
  experiment_id: string;
  variant: string;
  total: number;
  converted: number;
}

export function AdminExperimentsTab() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [stats, setStats] = useState<ExperimentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    variant_a: 'control',
    variant_b: 'variant_a',
    weight_a: 50,
    weight_b: 50,
    target_pages: '',
  });

  useEffect(() => { loadExperiments(); }, []);

  const loadExperiments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ab_experiments')
      .select('*')
      .order('created_at', { ascending: false });
    
    const exps = (data || []) as unknown as Experiment[];
    setExperiments(exps);

    // Load stats for each experiment
    if (exps.length > 0) {
      const { data: assignments } = await supabase
        .from('ab_assignments')
        .select('experiment_id, variant, converted')
        .in('experiment_id', exps.map(e => e.id));
      
      const statsMap: Record<string, ExperimentStats> = {};
      (assignments || []).forEach((a: any) => {
        const key = `${a.experiment_id}-${a.variant}`;
        if (!statsMap[key]) {
          statsMap[key] = { experiment_id: a.experiment_id, variant: a.variant, total: 0, converted: 0 };
        }
        statsMap[key].total++;
        if (a.converted) statsMap[key].converted++;
      });
      setStats(Object.values(statsMap));
    }
    setLoading(false);
  };

  const createExperiment = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    const { error } = await supabase.from('ab_experiments').insert({
      name: form.name,
      description: form.description || null,
      variants: [
        { name: form.variant_a, weight: form.weight_a },
        { name: form.variant_b, weight: form.weight_b },
      ],
      target_pages: form.target_pages ? form.target_pages.split(',').map(s => s.trim()) : [],
      is_active: false,
    } as any);
    if (error) { toast.error('Failed to create'); return; }
    toast.success('Experiment created');
    setShowCreate(false);
    setForm({ name: '', description: '', variant_a: 'control', variant_b: 'variant_a', weight_a: 50, weight_b: 50, target_pages: '' });
    loadExperiments();
  };

  const toggleExperiment = async (exp: Experiment) => {
    await supabase.from('ab_experiments').update({ is_active: !exp.is_active } as any).eq('id', exp.id);
    toast.success(exp.is_active ? 'Experiment paused' : 'Experiment activated');
    loadExperiments();
  };

  const deleteExperiment = async (id: string) => {
    await supabase.from('ab_experiments').delete().eq('id', id);
    toast.success('Experiment deleted');
    loadExperiments();
  };

  const getStats = (expId: string) => stats.filter(s => s.experiment_id === expId);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FlaskConical className="w-4 h-4" /> A/B Experiments ({experiments.length})
        </h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Experiment
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Experiment Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Checkout button color" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Target Pages (comma-separated)</Label>
                <Input value={form.target_pages} onChange={e => setForm(f => ({ ...f, target_pages: e.target.value }))} placeholder="/ecomarket, /dashboard" className="text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What are you testing?" className="text-sm" rows={2} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Variant A Name</Label>
                <Input value={form.variant_a} onChange={e => setForm(f => ({ ...f, variant_a: e.target.value }))} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Weight (%)</Label>
                <Input type="number" value={form.weight_a} onChange={e => setForm(f => ({ ...f, weight_a: +e.target.value }))} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Variant B Name</Label>
                <Input value={form.variant_b} onChange={e => setForm(f => ({ ...f, variant_b: e.target.value }))} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Weight (%)</Label>
                <Input type="number" value={form.weight_b} onChange={e => setForm(f => ({ ...f, weight_b: +e.target.value }))} className="text-sm" />
              </div>
            </div>
            <Button size="sm" onClick={createExperiment} className="text-xs">Create Experiment</Button>
          </CardContent>
        </Card>
      )}

      {experiments.map(exp => {
        const expStats = getStats(exp.id);
        return (
          <Card key={exp.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{exp.name}</CardTitle>
                  <Badge variant={exp.is_active ? 'default' : 'secondary'} className="text-[10px]">
                    {exp.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={exp.is_active} onCheckedChange={() => toggleExperiment(exp)} />
                  <Button size="sm" variant="ghost" onClick={() => deleteExperiment(exp.id)} className="h-7 w-7 p-0">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
              {exp.description && <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>}
            </CardHeader>
            <CardContent className="pt-0">
              {exp.target_pages.length > 0 && (
                <div className="flex gap-1 mb-2 flex-wrap">
                  {exp.target_pages.map(p => (
                    <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Variant</TableHead>
                    <TableHead className="text-xs">Weight</TableHead>
                    <TableHead className="text-xs">Users</TableHead>
                    <TableHead className="text-xs">Conversions</TableHead>
                    <TableHead className="text-xs">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(exp.variants as { name: string; weight: number }[]).map(v => {
                    const vs = expStats.find(s => s.variant === v.name);
                    const rate = vs && vs.total > 0 ? ((vs.converted / vs.total) * 100).toFixed(1) : '0.0';
                    return (
                      <TableRow key={v.name}>
                        <TableCell className="text-xs font-medium">{v.name}</TableCell>
                        <TableCell className="text-xs">{v.weight}%</TableCell>
                        <TableCell className="text-xs">{vs?.total || 0}</TableCell>
                        <TableCell className="text-xs">{vs?.converted || 0}</TableCell>
                        <TableCell className="text-xs font-medium">{rate}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="text-[10px] text-muted-foreground mt-2">
                Created {format(new Date(exp.created_at), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {experiments.length === 0 && !showCreate && (
        <Card>
          <CardContent className="py-12 text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No experiments yet. Create one to start testing.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
