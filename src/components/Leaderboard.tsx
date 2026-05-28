import { Award, Trophy, Bookmark, Flame, Zap, CheckCircle2 } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  points: number;
  badgesCount: number;
  avatar: string;
  topBadge: string;
}

interface LeaderboardProps {
  rankings: LeaderboardUser[];
}

export default function Leaderboard({ rankings }: LeaderboardProps) {
  const topThree = rankings.slice(0, 3);
  const others = rankings.slice(3);

  // Position colors for standard badges
  const rankColors = [
    "from-amber-400 to-yellow-500", // Gold
    "from-slate-300 to-slate-400",  // Silver
    "from-amber-600 to-orange-700"  // Bronze
  ];

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Intro section */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Honor Vault contributors
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Unlock achievements, gain contribution points by sharing validated previous year syllabus question papers, and earn elite curator titles.
        </p>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
        {topThree.map((item, idx) => (
          <div 
            key={item.id}
            id={`podium-${item.id}`}
            className={`relative p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-lg text-center flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
              idx === 0 
                ? "border-amber-400/50 ring-2 ring-amber-400/20 bg-amber-50/5 dark:bg-amber-950/5" 
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Hanging medal badge */}
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${rankColors[idx]} rounded-full text-white text-[10px] font-bold tracking-widest uppercase flex items-center space-x-1 shadow-md`}>
              <Trophy className="h-3 w-3" />
              <span>{idx === 0 ? "First Creator" : idx === 1 ? "Curator" : "Sage"}</span>
            </div>

            <div className="pt-4 flex flex-col items-center">
              <div className="relative">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className={`w-16 h-16 rounded-full border-2 bg-slate-100 ${
                    idx === 0 ? "border-amber-400" : idx === 1 ? "border-slate-300" : "border-amber-700"
                  }`}
                />
                <span className="absolute -bottom-1 -right-1 text-2xl bg-white dark:bg-slate-800 rounded-full p-0.5 shadow">
                  {getRankEmoji(item.rank)}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate mt-3 w-full">
                {item.name}
              </h3>
              
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {item.topBadge}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contributor count</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.badgesCount} badges</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total earned</span>
                <span className="text-sm font-bold bg-slate-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-mono">
                  {item.points} pts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table (Rest of users) */}
      <div className="max-w-4xl mx-auto pt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
            <Flame className="h-4 w-4 mr-2 text-rose-500 animate-pulse" />
            UniVault Leaderboard (Rank 4+)
          </span>
          <span className="text-xs font-mono text-slate-500">Updates hourly</span>
        </div>

        {others.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">More contributors are climbing the ledger rankings!</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {others.map((item) => (
              <div 
                key={item.id}
                id={`leaderboard-item-${item.id}`}
                className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors duration-150 gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <span className="font-mono font-bold text-slate-450 dark:text-slate-505 w-8 text-center text-sm">
                    #{item.rank}
                  </span>
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full" />
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                    <span className="text-xs font-mono text-slate-400 flex items-center mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      {item.topBadge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full justify-between sm:w-auto sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Achievements</span>
                    <span className="text-xs font-semibold text-slate-705 dark:text-slate-300">{item.badgesCount} badges earned</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vault Score</span>
                    <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs">
                      {item.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gamification Guidelines Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-left">
        <div className="p-5 border border-slate-250 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/40">
          <Zap className="h-5 w-5 text-amber-500 mb-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Earn +100 Points</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contribute a valid, duplicate-free question paper PDF. Upon admin status validation, obtian +100 points.
          </p>
        </div>
        <div className="p-5 border border-slate-250 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/40">
          <Bookmark className="h-5 w-5 text-blue-500 mb-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Unlock Curators Badges</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build your contribution streaks to unlock elite badges like Elite Scribe (5 uploads) or Silver Sentinel (500 pts).
          </p>
        </div>
        <div className="p-5 border border-slate-250 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/40">
          <Award className="h-5 w-5 text-emerald-500 mb-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Unlock Academic Perks</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Top weekly ranks obtain administrative moderator tags and gain fast-track validation privilege on future vaults additions!
          </p>
        </div>
      </div>
    </div>
  );
}
