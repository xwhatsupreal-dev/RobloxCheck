import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Layers, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Monitor, 
  Signal,
  ChevronRight,
  Menu,
  User,
  Search,
  X,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmingTask, DashboardStats } from './types';

interface RobloxStatus {
  userId: number;
  username: string;
  displayName: string;
  status: string;
  gameName: string;
  presenceType: number;
  imageUrl: string;
}

const MOCK_TASKS: FarmingTask[] = [];

const STATS: DashboardStats = {
  totalAccounts: 0,
  online: 0,
  offline: 0
};

export default function App() {
  const [tasks, setTasks] = useState<FarmingTask[]>(MOCK_TASKS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(STATS);
  
  // Roblox Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxStatus, setRobloxStatus] = useState<RobloxStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const checkRobloxStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!robloxUsername.trim()) return;

    setIsLoading(true);
    setError(null);
    setRobloxStatus(null);

    try {
      const response = await fetch('/api/roblox/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: robloxUsername }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check status');
      }

      setRobloxStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = () => {
    if (!robloxStatus) return;

    // Check if already added
    if (tasks.some(t => t.username === robloxStatus.username)) {
      setError('Account already added to dashboard');
      return;
    }

    const newTask: FarmingTask = {
      id: robloxStatus.userId.toString(),
      username: robloxStatus.username,
      gameName: robloxStatus.gameName || 'Not in game',
      taskName: robloxStatus.gameName ? 'Playing' : 'Online',
      progress: 0,
      systemId: 'WEB-CLIENT',
      uptime: 'Just now',
      status: robloxStatus.presenceType === 2 ? 'farming' : 'pending',
      imageUrl: robloxStatus.imageUrl
    };

    setTasks(prev => [newTask, ...prev]);
    
    // Update Stats
    setStats(prev => ({
      totalAccounts: prev.totalAccounts + 1,
      online: prev.online + (robloxStatus.presenceType > 0 ? 1 : 0),
      offline: prev.offline + (robloxStatus.presenceType === 0 ? 1 : 0)
    }));

    setIsModalOpen(false);
    setRobloxStatus(null);
    setRobloxUsername('');
  };

  return (
    <div className="min-h-screen pb-12 bg-brand-dark selection:bg-brand-red selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-dark/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Jiramet<span className="text-brand-red">Check</span>
            </h1>
            <p className="text-[10px] font-mono tracking-[0.3em] text-slate-500 uppercase leading-none mt-1">
              Advanced Monitoring System
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-brand-red hover:border-brand-red transition-all duration-300"
            >
              <Search size={14} className="group-hover:scale-110 transition-transform" />
              CHECK ACCOUNT
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 ring-4 ring-brand-red/5">
              <img 
                src="https://picsum.photos/seed/user1/100/100" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 space-y-12">
        {/* Hero Section */}
        <section className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter max-w-2xl leading-[0.9]">
            Real-time <span className="text-brand-red">Roblox</span> account status & farming monitoring.
          </h2>
          <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
            Connect your accounts to start monitoring their activity, game status, and farming progress in one centralized dashboard.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="TOTAL ACCOUNTS" value={stats.totalAccounts} icon={<Layers size={20} />} color="text-white" />
          <StatCard label="ONLINE" value={stats.online} icon={<Activity size={20} />} color="text-emerald-500" />
          <StatCard label="OFFLINE" value={stats.offline} icon={<XCircle size={20} />} color="text-slate-500" />
        </section>

        {/* Farming Tasks / Empty State */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Monitor size={18} className="text-brand-red" />
              ACTIVE SESSIONS
            </h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-brand-red hover:border-brand-red/30 transition-all disabled:opacity-50"
                title="Refresh sessions"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                {tasks.length} Active
              </span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-red/30 transition-all duration-500"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-white/[0.01]">
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Avatar Image */}
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <motion.img 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          src={task.imageUrl} 
                          alt={task.username} 
                          className="h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(255,0,0,0.3)] group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'farming' ? 'bg-emerald-500 animate-pulse' : 'bg-brand-red'}`} />
                        <span className="text-[9px] font-bold tracking-widest text-white uppercase">
                          {task.status === 'farming' ? 'IN GAME' : 'ONLINE'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 -mt-12 relative z-10">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-white tracking-tight">{task.username}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Gamepad2 size={12} className="text-brand-red" />
                            {task.gameName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Uptime</p>
                          <p className="text-xs font-bold text-white">{task.uptime}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-slate-500 uppercase">System</span>
                            <span className="text-[10px] font-bold text-slate-300">{task.systemId}</span>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-brand-red transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                  <Gamepad2 size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold">No active sessions</h4>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Start by checking an account using the button above to add it to your dashboard.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-brand-red hover:text-white transition-all duration-300"
                >
                  ADD ACCOUNT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Roblox Check Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-red">
                    <Gamepad2 size={20} />
                    <h2 className="text-lg font-bold tracking-tight">ROBLOX STATUS CHECK</h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={checkRobloxStatus} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Roblox Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={robloxUsername}
                        onChange={(e) => setRobloxUsername(e.target.value)}
                        placeholder="Enter username..."
                        className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-red/50 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <RefreshCw size={14} className="animate-spin" /> : 'CHECK'}
                      </button>
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
                    <XCircle size={16} />
                    {error}
                  </div>
                )}

                {robloxStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-brand-dark border border-brand-border space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center overflow-hidden">
                        <img 
                          src={robloxStatus.imageUrl} 
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{robloxStatus.displayName}</h3>
                        <p className="text-xs text-slate-500 font-mono">@{robloxStatus.username}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-brand-card border border-brand-border space-y-1">
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            robloxStatus.presenceType === 0 ? 'bg-slate-600' : 
                            robloxStatus.presenceType === 2 ? 'bg-emerald-500 glow-emerald' : 'bg-brand-red glow-red'
                          }`} />
                          <span className={`text-sm font-bold ${
                            robloxStatus.presenceType === 0 ? 'text-slate-400' : 
                            robloxStatus.presenceType === 2 ? 'text-emerald-500' : 'text-brand-red'
                          }`}>
                            {robloxStatus.status}
                          </span>
                        </div>
                      </div>
                      
                      {robloxStatus.gameName && (
                        <div className="p-3 rounded-lg bg-brand-card border border-brand-border space-y-1">
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Playing</p>
                          <p className="text-sm font-bold text-white truncate">{robloxStatus.gameName}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={addAccount}
                      className="w-full py-3 rounded-xl bg-brand-red text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-brand-red/20"
                    >
                      ADD TO DASHBOARD
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: ReactNode, color: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.04] transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">{label}</p>
        <p className={`text-4xl font-bold tracking-tighter text-white`}>
          {value}
        </p>
      </div>
    </div>
  );
}
