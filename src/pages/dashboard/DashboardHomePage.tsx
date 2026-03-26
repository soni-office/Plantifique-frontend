import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { orgsApi, type Org } from '../../api/orgs';
import { useTikTokStatus } from '../../context/tikTokStatus';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/useToast';

const INVITE_ROLES = ['ORG_MEMBER', 'ORG_ADMIN'] as const;

type OrgUser = { id: string; email: string; name?: string; role: string };

export function DashboardHomePage() {
  const { user, connectTikTok, isLoading } = useAuthStore();
  const { connected, loading: statusLoading, refresh: refreshStatus } = useTikTokStatus();

  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // ── Invite form state ──
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('ORG_MEMBER');
  const [inviteOrgId, setInviteOrgId] = useState<string>('');  // SUPER_ADMIN only
  const [inviting, setInviting] = useState(false);

  // ── Revoke state ──
  const [revoking, setRevoking] = useState(false);

  // ── Team members ──
  const [members, setMembers] = useState<OrgUser[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    if (!isAdmin) return;
    setMembersLoading(true);
    authApi
      .listOrgUsers()
      .then((res) => setMembers(res.users))
      .catch(() => toast({ title: 'Could not load team members', variant: 'error' }))
      .finally(() => setMembersLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── Organisations (SUPER_ADMIN only) ──
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgId, setNewOrgId] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  const fetchOrgs = useCallback(() => {
    if (!isSuperAdmin) return;
    setOrgsLoading(true);
    orgsApi
      .list()
      .then(setOrgs)
      .catch(() => toast({ title: 'Could not load organisations', variant: 'error' }))
      .finally(() => setOrgsLoading(false));
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  // ── Handlers ──

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreatingOrg(true);
    try {
      const org = await orgsApi.create(newOrgName.trim(), newOrgId.trim() || undefined);
      setOrgs((prev) => [...prev, org]);
      toast({ title: 'Organisation created', description: `${org.name} (${org.id})`, variant: 'success' });
      setNewOrgName('');
      setNewOrgId('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not create org.';
      toast({ title: 'Create failed', description: msg, variant: 'error' });
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await authApi.inviteUser({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
        org_id: isSuperAdmin ? inviteOrgId : undefined,
      });
      const description = result.email_sent
        ? `Invite email sent to ${result.email}.`
        : `${result.email} created. Share the invite link manually.`;
      toast({ title: 'User invited', description, variant: 'success' });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('ORG_MEMBER');
      setInviteOrgId('');
      fetchMembers();
    } catch {
      toast({ title: 'Invite failed', description: 'Could not create user. Try again.', variant: 'error' });
    } finally {
      setInviting(false);
    }
  };

  const handleConnectTikTok = async () => {
    try {
      await connectTikTok();
    } catch {
      toast({ title: 'Connection failed', description: 'Could not start TikTok OAuth.', variant: 'error' });
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Revoke TikTok Shop access? All team members will lose data access until reconnected.')) return;
    setRevoking(true);
    try {
      await authApi.revokeTikTokAccess();
      refreshStatus();
      toast({ title: 'Access revoked', description: 'TikTok Shop connection has been removed.', variant: 'success' });
    } catch {
      toast({ title: 'Revoke failed', description: 'Could not revoke access. Try again.', variant: 'error' });
    } finally {
      setRevoking(false);
    }
  };

  const handleRemoveUser = async (uid: string, email: string) => {
    if (!confirm(`Remove ${email} from the org? They will lose all access immediately.`)) return;
    setRemovingUid(uid);
    try {
      await authApi.removeUser(uid);
      setMembers((prev) => prev.filter((m) => m.id !== uid));
      toast({ title: 'User removed', description: `${email} has been removed.`, variant: 'success' });
    } catch {
      toast({ title: 'Remove failed', description: 'Could not remove user. Try again.', variant: 'error' });
    } finally {
      setRemovingUid(null);
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>

      {/* ── User Details ── */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Your Account
        </h3>
        <dl className="mt-3 space-y-2 text-sm text-slate-700">
          <div><dt className="inline font-medium">UID:</dt>{' '}<dd className="inline font-mono text-xs">{user?.uid ?? 'N/A'}</dd></div>
          <div><dt className="inline font-medium">Email:</dt>{' '}<dd className="inline">{user?.email ?? 'N/A'}</dd></div>
          <div><dt className="inline font-medium">Name:</dt>{' '}<dd className="inline">{user?.name ?? '—'}</dd></div>
          <div><dt className="inline font-medium">Role:</dt>{' '}<dd className="inline">{user?.role ?? 'N/A'}</dd></div>
          <div><dt className="inline font-medium">Org:</dt>{' '}<dd className="inline">{user?.org_id ?? 'N/A'}</dd></div>
        </dl>
      </div>

      {/* ── Organisations (SUPER_ADMIN only) ── */}
      {isSuperAdmin && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Organisations
            </h3>
            <button onClick={fetchOrgs} className="text-xs text-slate-400 hover:text-slate-600">
              Refresh
            </button>
          </div>

          {/* Create org form */}
          <form onSubmit={handleCreateOrg} className="mt-3 flex gap-3">
            <input
              type="text"
              required
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Org name (e.g. Acme Corp)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <input
              type="text"
              value={newOrgId}
              onChange={(e) => setNewOrgId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="org_id (optional)"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Button type="submit" isLoading={creatingOrg} variant="outline">
              Create Org
            </Button>
          </form>
          <p className="mt-1 text-xs text-slate-400">
            org_id is auto-derived from the name if left blank. Use lowercase letters, digits, _ or -.
          </p>

          {/* Org list */}
          {orgsLoading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : orgs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No organisations yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {orgs.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-800">{o.name}</span>
                    <span className="ml-2 font-mono text-xs text-slate-400">{o.id}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteOrgId(o.id);
                      document.getElementById('invite-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Invite member
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── TikTok Shop Access (admins only) ── */}
      {isAdmin && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            TikTok Shop Access
          </h3>

          {statusLoading ? (
            <p className="mt-2 text-sm text-slate-400">Checking connection status…</p>
          ) : connected ? (
            <>
              <p className="mt-2 text-sm text-emerald-700 font-medium">
                Connected — TikTok Shop data is accessible.
              </p>
              <Button
                className="mt-3 bg-red-600 text-white hover:bg-red-700"
                onClick={handleRevoke}
                isLoading={revoking}
              >
                Revoke Shop Access
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Grant this app access to your org's TikTok Shop data by completing the OAuth flow.
              </p>
              <Button
                className="mt-3 bg-black text-white hover:bg-slate-800"
                onClick={handleConnectTikTok}
                isLoading={isLoading}
              >
                Connect TikTok Shop
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Invite User (admins only) ── */}
      {isAdmin && (
        <div id="invite-form" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invite User
          </h3>
          <form onSubmit={handleInvite} className="mt-3 space-y-3">
            {/* SUPER_ADMIN: org selector */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 w-14 shrink-0">Org</label>
                {orgs.length > 0 ? (
                  <select
                    value={inviteOrgId}
                    onChange={(e) => setInviteOrgId(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">— select org —</option>
                    {orgs.map((o) => (
                      <option key={o.id} value={o.id}>{o.name} ({o.id})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={inviteOrgId}
                    onChange={(e) => setInviteOrgId(e.target.value)}
                    placeholder="org_id (e.g. org_plantifique)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                )}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Name (optional)"
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
              </select>
            </div>
            <Button type="submit" isLoading={inviting} variant="outline">
              Send Invite
            </Button>
          </form>
          <p className="mt-2 text-xs text-slate-400">
            An invite email will be sent automatically if the web API key is configured.
          </p>
        </div>
      )}

      {/* ── Team Members (admins only) ── */}
      {isAdmin && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Team Members
            </h3>
            <button onClick={fetchMembers} className="text-xs text-slate-400 hover:text-slate-600">
              Refresh
            </button>
          </div>

          {membersLoading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : members.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No active members found.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {members.map((m) => {
                const isSelf = m.id === user?.uid;
                const canRemove =
                  !isSelf &&
                  (user?.role === 'SUPER_ADMIN' ||
                    (user?.role === 'ORG_ADMIN' && m.role === 'ORG_MEMBER'));
                return (
                  <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-800">{m.name || m.email}</span>
                      {m.name && <span className="ml-2 text-slate-400">{m.email}</span>}
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {m.role}
                      </span>
                      {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                    </div>
                    {canRemove && (
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-2 text-xs"
                        isLoading={removingUid === m.id}
                        onClick={() => handleRemoveUser(m.id, m.email)}
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
