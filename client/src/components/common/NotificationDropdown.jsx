import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  UserPlus,
  FilePlus,
  MessageSquare,
  TrendingUp,
  Bookmark,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { io } from "socket.io-client";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Setup Socket connection
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user.id || user._id) {
        socket.emit("join-user", user.id || user._id);
      }
    });

    socket.on("notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((count) => count + 1);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Bell size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{newNotif.title}</p>
              <p className="text-[11px] text-slate-600">{newNotif.message}</p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Error marking read:", err);
    }
    setIsOpen(false);
  };

  const markAllRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "collaborator_invited":
      case "member_joined":
        return <UserPlus size={16} className="text-violet-600" />;
      case "paper_added":
        return <FilePlus size={16} className="text-emerald-600" />;
      case "discussion_posted":
        return <MessageSquare size={16} className="text-sky-600" />;
      case "progress_updated":
        return <TrendingUp size={16} className="text-amber-600" />;
      default:
        return <Sparkles size={16} className="text-purple-600" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-[6px] top-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] sm:w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Real-Time Activity
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-2 text-slate-300" size={28} />
                <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Updates from your collaborators and workspaces will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  to={notif.link || "/dashboard"}
                  onClick={() => markAsRead(notif._id, notif.link)}
                  className={`flex items-start gap-3 p-3.5 transition hover:bg-violet-50/50 ${
                    !notif.isRead ? "bg-violet-50/30" : "bg-white"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    {getIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
