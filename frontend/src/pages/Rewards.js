import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RewardsDashboard from '@/components/RewardsDashboard';

const Rewards = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="rewards-page">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-bold">MANO Rewards</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">{user?.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <RewardsDashboard />
      </main>
    </div>
  );
};

export default Rewards;
