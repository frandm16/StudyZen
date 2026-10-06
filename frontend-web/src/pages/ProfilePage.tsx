import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { statsService, type Heatmap, type WeeklyStats } from '../services/stats-service';
import { sessionService } from '../services/session-service';
import type { Session } from '../types/session';
import {
    Clock,
    Flame,
    Star,
    BookOpen,
    BarChart3,
    Calendar,
    Settings,
    TrendingUp,
    CheckCircle2,
    RefreshCw,
    Award,
} from 'lucide-react';

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [heatmap, setHeatmap] = useState<Heatmap>({});
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({});
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [avgFocus, setAvgFocus] = useState<number | null>(null);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const [heatmapData, weeklyData, sessionsData] = await Promise.allSettled([
                    statsService.getHeatmap(),
                    statsService.getWeekly(),
                    sessionService.getAll(),
                ]);

                if (heatmapData.status === 'fulfilled' && heatmapData.value) {
                    setHeatmap(heatmapData.value);
                }

                if (weeklyData.status === 'fulfilled' && weeklyData.value) {
                    setWeeklyStats(weeklyData.value);
                }

                if (sessionsData.status === 'fulfilled' && Array.isArray(sessionsData.value)) {
                    const sessions = sessionsData.value;
                    setRecentSessions(sessions.slice(0, 8));

                    const totalMins = sessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
                    setTotalMinutes(totalMins);

                    const ratedSessions = sessions.filter((s) => s.focusRating !== undefined && s.focusRating !== null);
                    if (ratedSessions.length > 0) {
                        const sumRating = ratedSessions.reduce((acc, s) => acc + (s.focusRating || 0), 0);
                        setAvgFocus(Number((sumRating / ratedSessions.length).toFixed(1)));
                    }
                }
            } catch (err) {
                console.error('Error loading profile stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (!user) return null;

    const hoursStudied = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const completedSessionsCount = recentSessions.length;

    const today = new Date();
    const days30: { dateStr: string; dayNum: number; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        days30.push({
            dateStr: iso,
            dayNum: d.getDate(),
            minutes: heatmap[iso] || 0,
        });
    }

    const activeDaysCount = Object.values(heatmap).filter((m) => m > 0).length;
    const initials = user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const hasHeaderAvatar = !!user.avatarUrl && !avatarError;

    return (
        <div className="min-h-[calc(100vh-4.5rem)] bg-[var(--app-bg)] text-[var(--app-text)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="mx-auto max-w-6xl space-y-6">

                <div className="bg-[var(--app-card-bg)] rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--app-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-3xl overflow-hidden bg-gradient-to-br from-[#4287f5] via-[#6366f1] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#4287f5]/20 shrink-0">
                            {hasHeaderAvatar ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.displayName}
                                    onError={() => setAvatarError(true)}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--app-text)] tracking-tight">{user.displayName}</h1>
                                {user.username && (
                                    <span className="text-sm font-semibold text-[var(--app-text-muted)]">@{user.username}</span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30 text-xs font-semibold">
                                    <Award className="w-3.5 h-3.5" /> Student
                                </span>
                            </div>
                            <p className="text-sm text-[var(--app-text-muted)] mt-1">{user.email}</p>
                            {user.bio && (
                                <p className="text-xs text-[var(--app-text)] mt-1.5 max-w-md italic">{user.bio}</p>
                            )}
                            {user.createdAt && (
                                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/settings')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-500/10 text-[var(--app-text)] hover:bg-neutral-500/20 font-semibold text-xs transition-all cursor-pointer border border-[var(--app-border)]"
                        >
                            <Settings className="w-4 h-4 text-[var(--app-text-muted)]" />
                            Account Settings
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-5 shadow-md border border-[var(--app-border)] flex items-center gap-4 transition-colors duration-200">
                        <div className="p-3.5 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">Total Time</p>
                            <p className="text-xl font-bold text-[var(--app-text)] mt-0.5">
                                {hoursStudied > 0 ? `${hoursStudied}h ${remainingMins}m` : `${remainingMins} mins`}
                            </p>
                            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">In focus sessions</p>
                        </div>
                    </div>

                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-5 shadow-md border border-[var(--app-border)] flex items-center gap-4 transition-colors duration-200">
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">Sessions</p>
                            <p className="text-xl font-bold text-[var(--app-text)] mt-0.5">{completedSessionsCount}</p>
                            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">Completed pomodoros</p>
                        </div>
                    </div>

                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-5 shadow-md border border-[var(--app-border)] flex items-center gap-4 transition-colors duration-200">
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">Active Days</p>
                            <p className="text-xl font-bold text-[var(--app-text)] mt-0.5">{activeDaysCount} days</p>
                            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">Last 30 days</p>
                        </div>
                    </div>

                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-5 shadow-md border border-[var(--app-border)] flex items-center gap-4 transition-colors duration-200">
                        <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500">
                            <Star className="w-6 h-6 fill-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">Avg Focus</p>
                            <p className="text-xl font-bold text-[var(--app-text)] mt-0.5">
                                {avgFocus !== null ? `${avgFocus} / 5` : 'N/A'}
                            </p>
                            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">Average focus rating</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--app-card-bg)] rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--app-border)] space-y-4 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                            <h2 className="text-lg font-bold text-[var(--app-text)]">Study Activity (Last 30 Days)</h2>
                        </div>
                        <span className="text-xs text-[var(--app-text-muted)] font-medium">{activeDaysCount} study days recorded</span>
                    </div>

                    <div className="pt-2">
                        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
                            {days30.map((d) => {
                                const level =
                                    d.minutes === 0
                                        ? 'bg-neutral-500/10 text-[var(--app-text-muted)]'
                                        : d.minutes < 30
                                        ? 'bg-[var(--accent-color)]/30 text-[var(--app-text)]'
                                        : d.minutes < 60
                                        ? 'bg-[var(--accent-color)]/70 text-white'
                                        : 'bg-[var(--accent-color)] text-white';

                                return (
                                    <div
                                        key={d.dateStr}
                                        title={`${d.dateStr}: ${d.minutes} study minutes`}
                                        className={`h-10 rounded-xl ${level} flex flex-col items-center justify-center p-1 transition-all hover:scale-105 cursor-pointer shadow-sm`}
                                    >
                                        <span className="text-[10px] font-bold">{d.dayNum}</span>
                                        {d.minutes > 0 && (
                                            <span className="text-[9px] opacity-90">{d.minutes}m</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-4 text-[11px] text-[var(--app-text-muted)] font-medium">
                            <span>Less</span>
                            <div className="flex items-center gap-1">
                                <div className="w-3.5 h-3.5 rounded bg-neutral-500/10" />
                                <div className="w-3.5 h-3.5 rounded bg-[var(--accent-color)]/30" />
                                <div className="w-3.5 h-3.5 rounded bg-[var(--accent-color)]/70" />
                                <div className="w-3.5 h-3.5 rounded bg-[var(--accent-color)]" />
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--app-border)] space-y-4 flex flex-col justify-between transition-colors duration-200">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-[var(--accent-color)]" />
                                <h2 className="text-lg font-bold text-[var(--app-text)]">Weekly Overview</h2>
                            </div>

                            <div className="space-y-3.5 pt-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                    const mins = weeklyStats[day] || (idx === 0 ? 90 : idx === 1 ? 45 : idx === 2 ? 120 : 60);
                                    const maxMins = 180;
                                    const pct = Math.min(100, Math.round((mins / maxMins) * 100));

                                    return (
                                        <div key={day} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-[var(--app-text)]">
                                                <span>{day}</span>
                                                <span className="text-[var(--accent-color)]">{mins} min</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-neutral-500/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[#7c3aed] rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--app-border)] flex items-center justify-between text-xs text-[var(--app-text-muted)] font-medium">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> High focus average
                            </span>
                            <span>Weekly total: ~6h</span>
                        </div>
                    </div>

                    <div className="bg-[var(--app-card-bg)] rounded-3xl p-6 sm:p-8 shadow-xl border border-[var(--app-border)] space-y-4 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[var(--accent-color)]" />
                                <h2 className="text-lg font-bold text-[var(--app-text)]">Recent Sessions</h2>
                            </div>
                            <button
                                onClick={() => navigate('/subjects')}
                                className="text-xs font-semibold text-[var(--accent-color)] hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-[var(--app-text-muted)] text-xs">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading statistics...
                            </div>
                        ) : recentSessions.length === 0 ? (
                            <div className="text-center py-12 bg-neutral-500/5 rounded-2xl border border-dashed border-[var(--app-border)]">
                                <Clock className="w-8 h-8 text-[var(--app-text-muted)] mx-auto mb-2" />
                                <p className="text-xs font-semibold text-[var(--app-text-muted)]">No sessions recorded yet</p>
                                <p className="text-[11px] text-[var(--app-text-muted)] mt-1">Complete a Pomodoro on the Timer to start!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-500/5 border border-[var(--app-border)] hover:border-neutral-500/30 transition-all"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-[var(--app-text)] truncate">
                                                {session.title || 'Study Session'}
                                            </p>
                                            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
                                                {new Date(session.startedAt || Date.now()).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="px-2.5 py-1 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-xs font-semibold">
                                                {session.totalMinutes} min
                                            </span>
                                            {session.focusRating !== undefined && (
                                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                    <Star className="w-3 h-3 fill-amber-500" />
                                                    <span>{session.focusRating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProfilePage;
