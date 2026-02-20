import { useAuthStore } from '../../store/authStore';

export function DashboardHomePage() {
  const { user } = useAuthStore();

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">User Details</h3>
        <dl className="mt-3 space-y-2 text-sm text-slate-700">
          <div>
            <dt className="inline font-medium">ID:</dt> <dd className="inline">{user?.id ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Email:</dt> <dd className="inline">{user?.email ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Username:</dt> <dd className="inline">{user?.username ?? 'N/A'}</dd>
          </div>
          
        </dl>
      </div>
    </section>
  );
}
