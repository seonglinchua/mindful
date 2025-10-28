"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/components/toast";
import { useLocalStorage } from "@/lib/use-local-storage";

interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:MM format
}

export function ReminderSettingsComponent() {
  const [settings, setSettings, isHydrated] = useLocalStorage<ReminderSettings>(
    'mindful:reminder-settings',
    { enabled: false, time: '20:00' }
  );
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const showNotification = useCallback(() => {
    if (permission === 'granted' && settings.enabled) {
      new Notification('Mindful Check-In', {
        body: 'Time to log your mood and reflect on your day!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'daily-reminder',
        requireInteraction: false,
        silent: false,
      });
    }
  }, [permission, settings.enabled]);

  useEffect(() => {
    if (!isHydrated || !settings.enabled) return;

    const scheduleNextReminder = () => {
      const [hours, minutes] = settings.time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilReminder = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        showNotification();
        // Schedule the next day's reminder
        scheduleNextReminder();
      }, timeUntilReminder);

      return timeoutId;
    };

    let timeoutId: NodeJS.Timeout;

    if (permission === 'granted') {
      timeoutId = scheduleNextReminder();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [settings, permission, isHydrated, showNotification]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this browser', 'error');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        showToast('Notifications enabled successfully!', 'success');
        return true;
      } else if (result === 'denied') {
        showToast('Notification permission denied', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showToast('Failed to request notification permission', 'error');
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
    showToast(
      enabled ? 'Daily reminders enabled' : 'Daily reminders disabled',
      'success'
    );
  };

  const handleTimeChange = (time: string) => {
    setSettings({ ...settings, time });
    if (settings.enabled) {
      showToast('Reminder time updated', 'success');
    }
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;
    }

    showNotification();
    showToast('Test notification sent!', 'info');
  };

  if (!isHydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Daily Reminders
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
          Daily Reminders
        </CardTitle>
        <CardDescription>
          Get reminded to check in with your mood daily
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
            <strong>Notifications Blocked</strong>
            <p className="text-muted-foreground mt-1">
              You&apos;ve blocked notifications for this site. To enable reminders, please allow
              notifications in your browser settings.
            </p>
          </div>
        )}

        {permission === 'default' && !settings.enabled && (
          <div className="p-3 bg-muted border rounded-lg text-sm">
            <p className="text-muted-foreground">
              Enable reminders to receive daily notifications for mood check-ins.
            </p>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <div className="font-medium">Enable Daily Reminders</div>
            <div className="text-sm text-muted-foreground">
              Receive notifications at your chosen time
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Reminder Time</label>
          <Input
            type="time"
            value={settings.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={!settings.enabled || permission === 'denied'}
          />
          <p className="text-xs text-muted-foreground">
            Choose what time you&apos;d like to receive your daily reminder
          </p>
        </div>

        {/* Test Button */}
        {settings.enabled && permission === 'granted' && (
          <Button
            variant="outline"
            onClick={testNotification}
            className="w-full"
          >
            Send Test Notification
          </Button>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p><strong>Note:</strong> Notifications require browser support and permissions.</p>
          <p>• Reminders will repeat daily at your chosen time</p>
          <p>• Keep this tab open or install as a PWA for reliable notifications</p>
          <p>• You can change the time or disable reminders anytime</p>
        </div>
      </CardContent>
    </Card>
  );
}
