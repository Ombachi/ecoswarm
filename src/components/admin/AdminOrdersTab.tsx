import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MerchOrder {
  id: string;
  user_id: string;
  merch_id: string;
  quantity: number;
  total_price: number;
  points_used: number;
  phone: string | null;
  shipping_address: string | null;
  status: string;
  created_at: string;
}

interface MerchProduct {
  id: string;
  name: string;
  image_url: string | null;
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const statusConfig: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { icon: <Clock className="w-3 h-3" />, variant: 'secondary' },
  confirmed: { icon: <CheckCircle className="w-3 h-3" />, variant: 'default' },
  shipped: { icon: <Truck className="w-3 h-3" />, variant: 'outline' },
  delivered: { icon: <CheckCircle className="w-3 h-3" />, variant: 'default' },
  cancelled: { icon: <XCircle className="w-3 h-3" />, variant: 'destructive' },
};

export function AdminOrdersTab() {
  const [orders, setOrders] = useState<MerchOrder[]>([]);
  const [products, setProducts] = useState<Record<string, MerchProduct>>({});
  const [buyerNames, setBuyerNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data: ordersData } = await supabase
      .from('merch_orders')
      .select('*')
      .order('created_at', { ascending: false });

    const allOrders = (ordersData as MerchOrder[]) || [];
    setOrders(allOrders);

    // Fetch product names
    const merchIds = [...new Set(allOrders.map(o => o.merch_id))];
    if (merchIds.length > 0) {
      const { data: prods } = await supabase
        .from('merch_products')
        .select('id, name, image_url')
        .in('id', merchIds);
      const prodMap: Record<string, MerchProduct> = {};
      (prods || []).forEach((p: any) => { prodMap[p.id] = p; });
      setProducts(prodMap);
    }

    // Fetch buyer names
    const userIds = [...new Set(allOrders.map(o => o.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, name')
        .in('user_id', userIds);
      const names: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { if (p.user_id) names[p.user_id] = p.name || 'Unknown'; });
      setBuyerNames(names);
    }

    setIsLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      const { error } = await supabase
        .from('merch_orders')
        .update({ status: newStatus } as any)
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order ${newStatus}`);

      // Notify buyer about status change
      if (order) {
        const productName = products[order.merch_id]?.name || 'your item';
        const statusMessages: Record<string, string> = {
          confirmed: `Your order for "${productName}" has been confirmed! 🎉`,
          shipped: `Your order for "${productName}" has been shipped! 📦`,
          delivered: `Your order for "${productName}" has been delivered! ✅`,
          cancelled: `Your order for "${productName}" has been cancelled.`,
        };
        const message = statusMessages[newStatus];
        if (message) {
          await supabase.from('notifications').insert({
            user_id: order.user_id,
            type: 'order',
            title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            message,
            reference_id: orderId,
          });
        }
      }
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="eco-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="eco-card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="eco-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{orders.filter(o => o.status === 'shipped').length}</p>
          <p className="text-xs text-muted-foreground">Shipped</p>
        </div>
        <div className="eco-card p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{orders.filter(o => o.status === 'delivered').length}</p>
          <p className="text-xs text-muted-foreground">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 lg:hidden">
            {filtered.map(order => {
              const product = products[order.merch_id];
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="eco-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {product?.image_url ? (
                        <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary/30" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground text-sm">{product?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{buyerNames[order.user_id] || order.user_id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <Badge variant={sc.variant} className="gap-1 text-[10px]">
                      {sc.icon} {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Qty:</span> <span className="font-medium text-foreground">{order.quantity}</span></div>
                    <div><span className="text-muted-foreground">Total:</span> <span className="font-medium text-foreground">KSh {order.total_price.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Points:</span> <span className="font-medium text-foreground">{order.points_used}</span></div>
                    <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString()}</span></div>
                  </div>

                  {(order.phone || order.shipping_address) && (
                    <div className="text-xs space-y-1 pt-2 border-t border-border">
                      {order.phone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" /> {order.phone}
                        </p>
                      )}
                      {order.shipping_address && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {order.shipping_address}
                        </p>
                      )}
                    </div>
                  )}

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-1">
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => updateStatus(order.id, 'confirmed')} disabled={updatingId === order.id}>
                            {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Confirm
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => updateStatus(order.id, 'cancelled')} disabled={updatingId === order.id}>
                            <XCircle className="w-3 h-3" /> Cancel
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => updateStatus(order.id, 'shipped')} disabled={updatingId === order.id}>
                          {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />} Mark Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => updateStatus(order.id, 'delivered')} disabled={updatingId === order.id}>
                          {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Mark Delivered
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => {
                  const product = products[order.merch_id];
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product?.image_url ? (
                            <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary/30" />
                            </div>
                          )}
                          <span className="font-medium text-sm">{product?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{buyerNames[order.user_id] || order.user_id.slice(0, 8)}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell className="font-medium">KSh {order.total_price.toLocaleString()}</TableCell>
                      <TableCell>{order.points_used}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          {order.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</p>}
                          {order.shipping_address && <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" /> {order.shipping_address.slice(0, 30)}...</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} className="gap-1 text-[10px]">
                          {sc.icon} {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Select
                            value={order.status}
                            onValueChange={(val) => updateStatus(order.id, val)}
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(s => (
                                <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
