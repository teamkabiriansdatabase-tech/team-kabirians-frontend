'use client';

import { Check } from 'lucide-react';
import api from '@/lib/api';
import '@/app/styles/admin-responsive.css'; 
export default function SystemTabs({
  activeNav,
  usersList = [],
  settingsForm = {},
  setSettingsForm,
  settingsSaved,
  setSettingsSaved,
  logs = [],
  notifications = [],
  registrations = [],
  fetchAdminData,
  handleSignOut,
}: any) {
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];

  return (
    <>
      {/* TAB 9: USERS */}
      {activeNav === 'Users' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-xl font-black text-slate-900">Coaches &amp; Users</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accounts registered in tournament portal.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">NAME</th>
                  <th className="py-4 px-6">EMAIL</th>
                  <th className="py-4 px-6">ROLE</th>
                  <th className="py-4 px-6 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {safeUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                      No users registered yet.
                    </td>
                  </tr>
                ) : (
                  safeUsers.map((u: any, idx: number) => (
                    <tr key={u._id || idx} className="hover:bg-slate-50">
                      <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-6 font-black text-slate-900">{u.name || 'User'}</td>
                      <td className="py-4 px-6 text-slate-500">{u.email || 'N/A'}</td>
                      <td className="py-4 px-6 font-bold capitalize">{u.role || 'Coach'}</td>
                      <td className="py-4 px-6 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS */}
      {activeNav === 'Settings' && (
        <div className="space-y-6 animate-in fade-in max-w-2xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-xl font-black text-slate-900">Platform Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage communication numbers, title, and email addresses.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.put('/admin/settings', settingsForm);
                if (setSettingsSaved) {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }
              } catch (err) {
                console.error('Failed to save settings:', err);
              }
            }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-slate-700 uppercase mb-1">Website Title</label>
              <input
                type="text"
                value={settingsForm?.websiteName || ''}
                onChange={(e) =>
                  setSettingsForm && setSettingsForm({ ...settingsForm, websiteName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={settingsForm?.contactEmail || ''}
                onChange={(e) =>
                  setSettingsForm && setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                value={settingsForm?.contactPhone || ''}
                onChange={(e) =>
                  setSettingsForm && setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-bold cursor-pointer hover:bg-blue-900 transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 11: ACTIVITY LOGS */}
      {activeNav === 'Activity Logs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-xl font-black text-slate-900">System Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit trail of actions taken by administrators.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">ACTION</th>
                  <th className="py-4 px-6">USER</th>
                  <th className="py-4 px-6">DATE &amp; TIME</th>
                  <th className="py-4 px-6 text-right">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {safeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                      No logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  safeLogs.map((l: any, idx: number) => (
                    <tr key={l._id || idx} className="hover:bg-slate-50">
                      <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">{l.action || 'System Action'}</td>
                      <td className="py-4 px-6">{l.user || 'Admin'}</td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(l.date || l.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-400">
                        {l.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 12: NOTIFICATIONS */}
      {activeNav === 'Notifications' && (
        <div className="space-y-6 animate-in fade-in max-w-3xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time alerts, approvals, and team registrations.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.patch('/admin/notifications/read-all');
                } catch (e) {}
                if (typeof fetchAdminData === 'function') fetchAdminData();
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          {(() => {
            let displayList = safeNotifications.length > 0 ? [...safeNotifications] : [];

            // Agar notifications collection khali ho toh registrations se dynamic alerts create karein
            if (displayList.length === 0 && safeRegistrations.length > 0) {
              displayList = safeRegistrations.map((r: any) => ({
                _id: r._id,
                title: 'New Team Registration',
                message: `Team "${r.teamName || 'New Team'}" submitted registration for ${r.eventTitle || 'Tournament'} (${(r.athletes || []).length} athletes).`,
                isRead: (r.registrationStatus || r.status || '').toLowerCase() === 'approved',
                createdAt: r.createdAt || new Date(),
              }));
            }

            if (displayList.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-sm font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-black text-slate-900">All caught up!</h4>
                  <p className="text-xs text-slate-500">There are no pending alerts or notifications at this moment.</p>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {displayList.map((n: any, idx: number) => {
                  const isRead = n.isRead || n.read;
                  return (
                    <div
                      key={n._id || idx}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 text-xs transition ${
                        isRead ? 'bg-white' : 'bg-red-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                            isRead ? 'bg-slate-300' : 'bg-[#E63946] animate-pulse'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 truncate">
                              {n.title || 'System Notification'}
                            </span>
                            {!isRead && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-700">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap self-start mt-1">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Today'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 13: PROFILE */}
      {activeNav === 'Profile' && (
        <div className="space-y-6 animate-in fade-in max-w-2xl">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center font-black text-2xl">
                A
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Admin</h2>
                <p className="text-xs text-slate-400">admin@eventportal.com</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Master Secret Key Active
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}