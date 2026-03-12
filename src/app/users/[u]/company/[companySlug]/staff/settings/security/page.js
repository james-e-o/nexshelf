'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    // Login settings
    require_email_verification: true,
    session_timeout_minutes: 30,
    max_active_sessions: 2,
    logout_on_password_change: true,
    // Password rules
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_numbers: true,
    password_require_special_characters: true,
    password_expiration_days: 90,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="../" className="text-blue-600 hover:underline text-sm mb-2 block">
          ← Back to Settings
        </Link>
        <h2 className="text-base font-medium tracking-tight">Security Settings</h2>
        <p className="text-gray-600 text-sm mt-2">Authentication and security policies</p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Login Policies</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Require Email Verification</Label>
              <Switch
                checked={settings.require_email_verification}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, require_email_verification: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout_minutes"
                name="session_timeout_minutes"
                type="number"
                value={settings.session_timeout_minutes}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="max_active_sessions">Max Active Sessions per User</Label>
              <Input
                id="max_active_sessions"
                name="max_active_sessions"
                type="number"
                value={settings.max_active_sessions}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Logout on Password Change</Label>
              <Switch
                checked={settings.logout_on_password_change}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, logout_on_password_change: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Password Rules</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password_min_length">Minimum Password Length</Label>
              <Input
                id="password_min_length"
                name="password_min_length"
                type="number"
                value={settings.password_min_length}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Require Uppercase Letters</Label>
              <Switch
                checked={settings.password_require_uppercase}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, password_require_uppercase: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Require Numbers</Label>
              <Switch
                checked={settings.password_require_numbers}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, password_require_numbers: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Require Special Characters</Label>
              <Switch
                checked={settings.password_require_special_characters}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, password_require_special_characters: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="password_expiration_days">Password Expiration (days)</Label>
              <Input
                id="password_expiration_days"
                name="password_expiration_days"
                type="number"
                value={settings.password_expiration_days}
                onChange={handleChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Set to 0 to disable expiration</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button>Save Settings</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
