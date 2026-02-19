import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard Home', end: true },
  { to: '/dashboard/sample-requests', label: 'Sample Requests' },
  { to: '/dashboard/agents', label: 'Agents' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-neutral-200 bg-white p-4">
      <h1 className="mb-8 text-xl font-bold text-black">Plantifique</h1>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-neutral-200 text-black' : 'text-neutral-700 hover:bg-neutral-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button className="w-full" onClick={handleLogout} isLoading={isLoading}>
        Logout
      </Button>
    </aside>
  );
}
