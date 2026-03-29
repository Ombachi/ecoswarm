import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductChat } from '@/components/ecomarket/ProductChat';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Loader2, ChevronRight, Package } from 'lucide-react';

interface Conversation {
  productId: string;
  productName: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function InboxScreen() {
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [myProductIds, setMyProductIds] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<{
    productId: string;
    productName: string;
    sellerId: string;
    sellerName: string;
  } | null>(null);

  useEffect(() => {
    if (user) checkRoleAndLoad();
  }, [user]);

  const checkRoleAndLoad = async () => {
    if (!user) return;
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ecodeveloper')
      .maybeSingle();
    
    const isDev = !!roleData;
    setIsDeveloper(isDev);

    let productIds: string[] = [];
    if (isDev) {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id);
      productIds = products?.map(p => p.id) || [];
      setMyProductIds(productIds);
    }

    loadConversations(isDev, productIds);
  };

  const loadConversations = async (isDev: boolean, productIds: string[]) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For EcoDevelopers: ONLY show messages tied to their own products
      // Filter by product_id being in their products list
      const filtered = isDev
        ? (messages || []).filter(msg => msg.product_id && productIds.includes(msg.product_id))
        : (messages || []).filter(msg => msg.product_id); // Warriors: only product chats too

      const convMap = new Map<string, Conversation>();
      for (const msg of filtered) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.product_id}-${otherId}`;
        if (!convMap.has(key)) {
          convMap.set(key, {
            productId: msg.product_id || '',
            productName: '',
            otherUserId: otherId,
            otherUserName: '',
            lastMessage: msg.content,
            lastMessageAt: msg.created_at || '',
            unreadCount: 0,
          });
        }
        const conv = convMap.get(key)!;
        if (msg.receiver_id === user.id && !msg.is_read) conv.unreadCount++;
      }

      const pIds = [...new Set([...convMap.values()].map(c => c.productId).filter(Boolean))];
      let productMap: Record<string, string> = {};
      if (pIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, product_name')
          .in('id', pIds);
        if (products) products.forEach(p => { productMap[p.id] = p.product_name; });
      }

      const userIds = [...new Set([...convMap.values()].map(c => c.otherUserId))];
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, name')
          .in('user_id', userIds);
        if (profiles) profiles.forEach(p => { if (p.user_id && p.name) userMap[p.user_id] = p.name; });
      }

      const result = [...convMap.values()].map(c => ({
        ...c,
        productName: productMap[c.productId] || 'Product Chat',
        otherUserName: userMap[c.otherUserId] || 'User',
      }));

      result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setConversations(result);
    } catch {
      console.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    if (diffH < 168) return d.toLocaleDateString('en-KE', { weekday: 'short' });
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Inbox</h1>
        <p className="text-xs text-muted-foreground">
          {isDeveloper ? 'Messages about your products' : 'Your product conversations'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start a conversation from the EcoMarket!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conv) => (
            <button
              key={`${conv.productId}-${conv.otherUserId}`}
              onClick={() => setActiveChat({
                productId: conv.productId,
                productName: conv.productName,
                sellerId: conv.otherUserId,
                sellerName: conv.otherUserName,
              })}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground text-sm truncate">{conv.otherUserName}</p>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">Re: {conv.productName}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full eco-gradient-bg text-white text-[10px] font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      )}

      {activeChat && (
        <ProductChat
          isOpen={true}
          onClose={() => { setActiveChat(null); checkRoleAndLoad(); }}
          productId={activeChat.productId}
          productName={activeChat.productName}
          sellerId={activeChat.sellerId}
          sellerName={activeChat.sellerName}
        />
      )}
    </AppLayout>
  );
}
