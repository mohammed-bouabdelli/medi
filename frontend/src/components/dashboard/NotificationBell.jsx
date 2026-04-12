import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Clock, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const NotificationBell = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data.notifications.data || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de marquer comme lu." });
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/mark-all-read", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      toast({ title: "Succès", description: "Toutes les notifications ont été marquées comme lues." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Opération échouée." });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] border-2 border-card"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 text-primary hover:text-primary/80"
              onClick={markAllRead}
            >
              Tout lire
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-muted-foreground opacity-20" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Aucune notification</p>
              <p className="text-xs text-muted-foreground mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => {
                const data = n.data;
                const isRead = !!n.read_at;
                
                return (
                  <div 
                    key={n.id} 
                    className={`flex gap-3 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors relative ${!isRead ? "bg-primary/5" : ""}`}
                  >
                    {!isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${!isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {data.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {data.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(n.created_at), "HH:mm", { locale: fr })}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(n.created_at), "dd MMM", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    
                    {!isRead && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 xl:opacity-100"
                        onClick={() => markAsRead(n.id)}
                        title="Marquer comme lu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t border-border bg-card">
           <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground">
             Voir toutes les notifications
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
