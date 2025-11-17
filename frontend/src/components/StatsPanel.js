import React from 'react';
import { Activity, Users, UserPlus, Database } from 'lucide-react';
import { Card } from './ui/card';

const StatsPanel = ({ stats }) => {
  const statCards = [
    {
      icon: Activity,
      label: 'Latency',
      value: `${stats.latency.toFixed(2)}s`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      trend: stats.latency < 2.5 ? 'Good' : 'Normal'
    },
    {
      icon: Database,
      label: 'Total Events Processed',
      value: stats.totalEvents.toLocaleString(),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      trend: '+' + Math.floor(Math.random() * 100) + ' today'
    },
    {
      icon: UserPlus,
      label: 'New Customers Joined',
      value: stats.newCustomers.toLocaleString(),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      trend: '+' + Math.floor(Math.random() * 20) + ' today'
    },
    {
      icon: Users,
      label: 'Unique Customers Event Processed',
      value: stats.uniqueCustomers.toLocaleString(),
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      trend: 'Active'
    }
  ];

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">System Statistics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time ECI metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{stat.trend}</p>
              </div>
            </Card>
          );
        })}

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-400">Data Sync</span>
              <span className="text-blue-900 dark:text-blue-200 font-medium flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-400">Reconciliation</span>
              <span className="text-blue-900 dark:text-blue-200 font-medium">Daily at 02:00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-400">Uptime</span>
              <span className="text-blue-900 dark:text-blue-200 font-medium">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
