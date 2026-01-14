import { useState, useEffect } from 'react';
import { 
  Trophy, Star, Medal, Crown, Target, Flame, Gift, 
  ChevronRight, Loader2, Award, Users, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const RewardsDashboard = () => {
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load rewards
      const rewardsRes = await fetch(`${API}/rewards`, { credentials: 'include' });
      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data);
      }

      // Load all badges
      const badgesRes = await fetch(`${API}/rewards/badges`);
      if (badgesRes.ok) {
        const data = await badgesRes.json();
        setAllBadges(data.badges || []);
      }

      // Load leaderboard
      await loadLeaderboard();
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${API}/rewards/leaderboard?period=${leaderboardPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const claimDailyReward = async () => {
    setClaiming(true);
    try {
      const response = await fetch(`${API}/rewards/claim-daily`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`¡Has ganado ${data.daily_points} puntos! Racha: ${data.streak_days} días`);
        if (data.streak_bonus > 0) {
          toast.success(`🔥 ¡Bonus de racha: +${data.streak_bonus} puntos!`);
        }
        loadData();
      } else {
        toast.error(data.message || 'Error al reclamar recompensa');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setClaiming(false);
    }
  };

  const getLevelIcon = (levelId) => {
    switch(levelId) {
      case 'bronce': return <Medal className="w-6 h-6 text-amber-600" />;
      case 'plata': return <Medal className="w-6 h-6 text-zinc-400" />;
      case 'oro': return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'platino': return <Star className="w-6 h-6 text-cyan-400" />;
      case 'diamante': return <Crown className="w-6 h-6 text-purple-500" />;
      default: return <Medal className="w-6 h-6" />;
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="rewards-dashboard">
      {/* Level Card */}
      {rewards?.level && (
        <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {rewards.level.icon}
                </div>
                <div>
                  <p className="text-white/80 text-sm">Tu Nivel</p>
                  <h2 className="text-2xl font-bold">{rewards.level.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{rewards.total_points}</p>
                <p className="text-white/80 text-sm">puntos totales</p>
              </div>
            </div>
            
            {rewards.level.next_level && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso al nivel {rewards.level.next_level}</span>
                  <span>{rewards.level.points_to_next} puntos restantes</span>
                </div>
                <Progress value={rewards.level.progress} className="h-3 bg-white/20 [&>div]:bg-white" />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span>Racha: {rewards.streak_days || 0} días</span>
              </div>
              <Button
                onClick={claimDailyReward}
                disabled={claiming}
                className="bg-white text-indigo-600 hover:bg-white/90"
              >
                {claiming ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                Reclamar Recompensa Diaria
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="badges" className="data-[state=active]:bg-indigo-100">
            <Award className="w-4 h-4 mr-2" />
            Insignias
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-indigo-100">
            <Trophy className="w-4 h-4 mr-2" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-indigo-100">
            <TrendingUp className="w-4 h-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBadges.map((badge) => {
              const isEarned = rewards?.badges?.includes(badge.id);
              return (
                <Card 
                  key={badge.id}
                  className={`${isEarned ? 'bg-white border-indigo-200' : 'bg-zinc-50 border-zinc-200 opacity-60'}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`text-4xl mb-2 ${!isEarned && 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <h4 className="font-semibold text-sm">{badge.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{badge.description}</p>
                    <Badge 
                      variant={isEarned ? "default" : "outline"} 
                      className={`mt-2 ${isEarned ? 'bg-indigo-600' : ''}`}
                    >
                      {isEarned ? '✓ Desbloqueado' : `${badge.points} pts`}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de la Comunidad
                </CardTitle>
                <div className="flex gap-2">
                  {['weekly', 'monthly', 'all_time'].map((period) => (
                    <Button
                      key={period}
                      variant={leaderboardPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLeaderboardPeriod(period)}
                      className={leaderboardPeriod === period ? 'bg-indigo-600' : ''}
                    >
                      {period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensual' : 'Total'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos de ranking aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          entry.rank === 1 ? 'bg-yellow-400' :
                          entry.rank === 2 ? 'bg-zinc-300' :
                          entry.rank === 3 ? 'bg-amber-600' : 'bg-zinc-200'
                        }`}>
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <div className="font-semibold">{entry.name || 'Usuario'}</div>
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>{entry.level?.icon} {entry.level?.name}</span>
                            <span>•</span>
                            <span>{entry.badges_count} insignias</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-indigo-600">{entry.points}</div>
                        <div className="text-xs text-zinc-500">puntos</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="history">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewards?.recent_activity?.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay actividad reciente</p>
                  <p className="text-sm mt-1">¡Analiza contenido para ganar puntos!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards?.recent_activity?.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {activity.action === 'badge_earned' ? (
                            <Award className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Star className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {activity.action === 'badge_earned' 
                              ? `Insignia: ${activity.metadata?.badge_name}`
                              : activity.action.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {new Date(activity.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500">+{activity.points} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsDashboard;
