import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface ProductChatProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
}

export function ProductChat({ isOpen, onClose, productId, productName, sellerId, sellerName }: ProductChatProps) {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    loadMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`chat-${productId}-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `product_id=eq.${productId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          setMessages(prev => [...prev, msg]);
          // Mark as read if we're the receiver
          if (msg.receiver_id === user.id) {
            supabase.from('messages').update({ is_read: true }).eq('id', msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, user, productId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('product_id', productId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);

      // Mark unread messages as read
      const unread = (data || []).filter((m: any) => m.receiver_id === user.id && !m.is_read);
      if (unread.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unread.map((m: any) => m.id));
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    setIsSending(true);
    try {
      const receiverId = user.id === sellerId ? messages.find(m => m.sender_id !== user.id)?.sender_id || sellerId : sellerId;
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        product_id: productId,
        content: newMessage.trim(),
      } as any);
      if (error) throw error;
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col sm:bg-black/50 sm:items-center sm:justify-center">
      <div className="bg-card w-full h-full sm:max-w-md sm:max-h-[85vh] sm:rounded-2xl flex flex-col sm:h-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border safe-area-top">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{sellerName}</h3>
            <p className="text-xs text-muted-foreground truncate">Re: {productName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Start a conversation about this product</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'eco-gradient-bg text-white rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - with safe area padding for mobile */}
        <div className="p-3 border-t border-border flex items-center gap-2 pb-safe">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Type a message"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 rounded-full eco-gradient-bg text-white disabled:opacity-50"
            aria-label="Send message"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
