import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-[#10142b] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/10 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-white">{value}</span>
          {trend && (
            <span className={`text-xs font-medium mb-1 ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendUp ? '+' : ''}{trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
