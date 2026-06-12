import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from '../../context/ThemeContext';

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function SettingsSkeleton() {
  return (
    <MainLayout title="Account Settings">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          {/* Preferences Section Skeleton */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-40 h-7" />
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <Skeleton className="w-36 h-4 mb-2" />
                <Skeleton className="w-full h-12 rounded-md" />
                <Skeleton className="w-64 h-3" />
              </div>

              <div className="space-y-4">
                <Skeleton className="w-24 h-4 mb-2" />
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                  <Skeleton className="w-11 h-6 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Communication Section Skeleton */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-40 h-7" />
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl">
                  <div className="flex gap-4 flex-1">
                    <Skeleton className="w-5 h-5 rounded-full mt-1" />
                    <div className="flex-1">
                      <Skeleton className="w-32 h-5 mb-2" />
                      <Skeleton className="w-64 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-11 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Cards Skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-400 p-8 rounded-lg">
              <Skeleton className="w-48 h-7 mb-2 bg-white/20" />
              <Skeleton className="w-80 h-4 mb-6 bg-white/20" />
              <Skeleton className="w-36 h-10 rounded-md bg-white/20" />
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-16 h-4" />
              </div>
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-3/4 h-3 mt-2" />
            </div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="mt-12 flex justify-end gap-4">
          <Skeleton className="w-32 h-11 rounded-md" />
          <Skeleton className="w-36 h-11 rounded-md" />
        </div>
      </div>
    </MainLayout>
  );
}

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();

  const [settings, setSettings] = useState({
    language: 'English (United States)',
    pushNotifications: true,
    emailAlerts: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await schoolAdminApi.getSettings();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Show skeleton while loading
  if (loading) return <SettingsSkeleton />;

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await schoolAdminApi.updateSettings({ ...settings, darkMode });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to previous settings or navigate back
    window.history.back();
  };

  return (
    <MainLayout title="Account Settings">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          {/* Preferences Section */}
          <section className="bg-surface-container-lowest p-8 rounded-lg ambient-shadow">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">tune</span>
              <h3 className="text-xl font-bold text-on-surface">Preferences</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                  Interface Language
                </label>
                <div className="relative">
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full appearance-none bg-surface-container-low border-none rounded-md py-4 px-5 text-on-surface font-semibold focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                  >
                    <option>English (United States)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                    <option>German (Deutsch)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant px-1">
                  This will change the language of all navigation and labels.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                  Appearance
                </label>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {darkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span className="font-semibold text-on-surface">Dark Mode</span>
                  </div>
                  {/* toggleDarkMode — global context update */}
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      darkMode ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Communication Section */}
          <section className="bg-surface-container-lowest p-8 rounded-lg ambient-shadow">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">notifications_active</span>
              <h3 className="text-xl font-bold text-on-surface">Communication</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start justify-between p-4 hover:bg-surface-container-low rounded-xl transition-all">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Push Notifications</h4>
                    <p className="text-sm text-on-surface-variant">
                      Get instant alerts for quiz results and class announcements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('pushNotifications', !settings.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.pushNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between p-4 hover:bg-surface-container-low rounded-xl transition-all">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-primary">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Email Alerts</h4>
                    <p className="text-sm text-on-surface-variant">
                      Receive weekly performance summaries and parent updates.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange('emailAlerts', !settings.emailAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.emailAlerts ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Help & Support Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 primary-gradient p-8 rounded-lg text-white">
              <h4 className="text-xl font-bold mb-2">Need Academic Help?</h4>
              <p className="text-white/80 mb-6">
                Our support team is available 24/7 to assist with platform technicalities or learning roadblocks.
              </p>
              <button className="bg-white text-primary px-6 py-2 rounded-md font-bold text-sm shadow-sm hover:scale-105 transition-transform">
                Contact Support
              </button>
            </div>
            <div className="bg-surface-container-high p-8 rounded-lg border border-outline-variant/20">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <span className="material-symbols-outlined">verified_user</span>
                <span className="text-sm">Security</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your data is encrypted using institutional-grade protocols. Scholar ID verified.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-end gap-4">
          <button 
            onClick={handleCancel}
            className="px-8 py-3 text-primary font-bold text-sm hover:bg-surface-container rounded-md transition-all"
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-10 py-3 primary-gradient text-white font-bold text-sm rounded-md shadow-lg transition-transform ${
              isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}