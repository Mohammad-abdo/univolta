"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X, Check, CheckCheck, Volume2, VolumeX } from "lucide-react";
import { apiGet, apiRequest } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  type: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  resource?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  university?: {
    id: string;
    name: string;
  };
  metadata?: any;
}

interface AlertNotificationProps {
  className?: string;
}

// Function to play notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant notification sound (two-tone beep)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

export function AlertNotification({ className = "" }: AlertNotificationProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notificationSoundEnabled");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchUnreadCount();
      await fetchAlerts();
      isInitialized.current = true;
    };
    
    initialize();
    
    // Poll for new alerts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Play sound when new alerts arrive
  useEffect(() => {
    // Only play sound if:
    // 1. Sound is enabled
    // 2. We've initialized (to avoid playing on first load)
    // 3. The count increased (new alerts arrived)
    if (
      soundEnabled &&
      isInitialized.current &&
      previousUnreadCount !== null &&
      unreadCount > previousUnreadCount
    ) {
      playNotificationSound();
    }
    // Update previous count after checking
    if (isInitialized.current) {
      setPreviousUnreadCount(unreadCount);
    }
  }, [unreadCount, previousUnreadCount, soundEnabled]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiGet<{ count: number }>("/alerts/unread/count");
      const count = data?.count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{
        alerts: Alert[];
        pagination: any;
      }>("/alerts?limit=10&unreadOnly=false");
      setAlerts(data.alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await apiRequest(`/alerts/${alertId}/read`, {
        method: "PATCH",
      });
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/alerts/read-all", {
        method: "PATCH",
      });
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationSoundEnabled", String(newValue));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return "✓";
      case "WARNING":
        return "⚠";
      case "ERROR":
        return "✕";
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg transition-colors ${
                  soundEnabled
                    ? "text-blue-600 hover:bg-blue-50"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
                title={soundEnabled ? "Sound enabled" : "Sound disabled"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !alert.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                !alert.isRead ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {alert.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(alert.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              aria-label="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <a
                href="/dashboard/alerts"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

