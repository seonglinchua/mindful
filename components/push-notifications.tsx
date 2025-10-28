"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { useLocalStorage } from "@/lib/use-local-storage";

interface ReminderTime {
  id: string;
  time: string; // HH:MM format
  label: string;
  enabled: boolean;
}

interface PushNotificationSettings {
  enabled: boolean;
  reminders: ReminderTime[];
}

const DEFAULT_REMINDERS: ReminderTime[] = [
  { id: "morning", time: "09:00", label: "Morning Check-in", enabled: true },
  { id: "evening", time: "20:00", label: "Evening Reflection", enabled: true },
];

export function PushNotifications() {
  const [settings, setSettings, isHydrated] = useLocalStorage<PushNotificationSettings>(
    "mindful:push-notifications",
    { enabled: false, reminders: DEFAULT_REMINDERS }
  );
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const { showToast } = useToast();

  // Check if service worker and notifications are supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(() => {
          setServiceWorkerReady(true);
        });
      }
    }
  }, []);

  const scheduleNotification = useCallback(
    (reminder: ReminderTime) => {
      if (!serviceWorkerReady || permission !== "granted" || !settings.enabled || !reminder.enabled) {
        return;
      }

      const [hours, minutes] = reminder.time.split(":").map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilReminder = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Mindful Reminder", {
            body: reminder.label,
            icon: "/icon-192.png",
            badge: "/icon-72.png",
            tag: `reminder-${reminder.id}`,
            requireInteraction: false,
          });
        });

        // Reschedule for next day
        scheduleNotification(reminder);
      }, timeUntilReminder);
    },
    [serviceWorkerReady, permission, settings.enabled]
  );

  useEffect(() => {
    if (!isHydrated || !settings.enabled || permission !== "granted") return;

    // Schedule all enabled reminders
    settings.reminders.filter((r) => r.enabled).forEach((reminder) => {
      scheduleNotification(reminder);
    });
  }, [settings, permission, isHydrated, scheduleNotification]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      showToast("Notifications are not supported in this browser", "error");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        showToast("Push notifications enabled successfully!", "success");
        return true;
      } else if (result === "denied") {
        showToast("Push notification permission denied", "error");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      showToast("Failed to request notification permission", "error");
      return false;
    }

    return false;
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }
    }

    setSettings({ ...settings, enabled });
    showToast(enabled ? "Push notifications enabled" : "Push notifications disabled", "success");
  };

  const toggleReminder = (id: string) => {
    setSettings({
      ...settings,
      reminders: settings.reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    });
  };

  const updateReminderTime = (id: string, time: string) => {
    setSettings({
      ...settings,
      reminders: settings.reminders.map((r) => (r.id === id ? { ...r, time } : r)),
    });
    if (settings.enabled) {
      showToast("Reminder time updated", "success");
    }
  };

  const updateReminderLabel = (id: string, label: string) => {
    setSettings({
      ...settings,
      reminders: settings.reminders.map((r) => (r.id === id ? { ...r, label } : r)),
    });
  };

  const addReminder = () => {
    const newReminder: ReminderTime = {
      id: `custom-${Date.now()}`,
      time: "12:00",
      label: "Custom Reminder",
      enabled: true,
    };
    setSettings({
      ...settings,
      reminders: [...settings.reminders, newReminder],
    });
    showToast("New reminder added", "success");
  };

  const deleteReminder = (id: string) => {
    setSettings({
      ...settings,
      reminders: settings.reminders.filter((r) => r.id !== id),
    });
    showToast("Reminder deleted", "success");
  };

  const testNotification = async () => {
    if (permission !== "granted") {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;
    }

    if (serviceWorkerReady) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("Test Notification", {
          body: "Push notifications are working! 🎉",
          icon: "/icon-192.png",
          badge: "/icon-72.png",
          tag: "test-notification",
        });
      });
    } else {
      new Notification("Test Notification", {
        body: "Push notifications are working! 🎉",
        icon: "/icon-192.png",
      });
    }

    showToast("Test notification sent!", "info");
  };

  if (!isHydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get reminded to check in with your wellness goals throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        {permission === "denied" && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
            <strong>Notifications Blocked</strong>
            <p className="text-muted-foreground mt-1">
              You&apos;ve blocked notifications for this site. To enable reminders, please allow
              notifications in your browser settings.
            </p>
          </div>
        )}

        {!serviceWorkerReady && (
          <div className="p-3 bg-muted border rounded-lg text-sm">
            <p className="text-muted-foreground">
              Service Worker is not ready. Push notifications may not work reliably.
            </p>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <div className="font-medium">Enable Push Notifications</div>
            <div className="text-sm text-muted-foreground">
              Receive notifications throughout the day
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
            disabled={permission === "denied"}
          />
        </div>

        {/* Reminder List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Scheduled Reminders</div>
            <Button variant="outline" size="sm" onClick={addReminder} className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {settings.reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-3 rounded-lg border bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <Input
                  type="text"
                  value={reminder.label}
                  onChange={(e) => updateReminderLabel(reminder.id, e.target.value)}
                  className="flex-1 mr-2"
                  disabled={!settings.enabled || permission === "denied"}
                />
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={() => toggleReminder(reminder.id)}
                  disabled={!settings.enabled || permission === "denied"}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={reminder.time}
                  onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                  className="flex-1"
                  disabled={!settings.enabled || permission === "denied" || !reminder.enabled}
                />
                {settings.reminders.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    className="h-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Test Button */}
        {settings.enabled && permission === "granted" && (
          <Button variant="outline" onClick={testNotification} className="w-full">
            Send Test Notification
          </Button>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            <strong>Note:</strong> Push notifications work best when installed as a PWA.
          </p>
          <p>• Reminders will repeat daily at your chosen times</p>
          <p>• You can add multiple reminders throughout the day</p>
          <p>• Notifications work even when the app is closed (PWA mode)</p>
        </div>
      </CardContent>
    </Card>
  );
}
