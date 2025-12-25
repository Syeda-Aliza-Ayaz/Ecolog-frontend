'use client';

import { useState } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

type Activity = {
  id: number;
  category: string;
  details: string;
  co2_estimate: number | string;
  date: string;
  created_at: string;
};

export default function DashboardClient({ initialActivities }: { initialActivities: Activity[] }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const today = new Date();

  const filtered = initialActivities.filter(a => {
    const matchesSearch = a.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? a.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const totalCO2 = filtered
    .reduce((sum, a) => sum + Number(a.co2_estimate || 0), 0)
    .toFixed(1);

  const chartData = (() => {
    const last7Days = eachDayOfInterval({
      start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: today,
    });

    return last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTotal = initialActivities
        .filter(a => a.date === dayStr)
        .reduce((sum, a) => sum + Number(a.co2_estimate || 0), 0);

      return { 
        day: format(day, 'EEE'), 
        co2: Number(dayTotal.toFixed(1))
      };
    });
  })();

  const categories = ['Transport', 'Food', 'Energy', 'Waste'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD5D5] to-[#ffffff]">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#3A6F43] mb-4">EcoLog</h1>
          <p className="text-xl text-[#3A6F43]">Track your daily carbon footprint – gently 🌸</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition hover:scale-105 hover:shadow-2xl cursor-default">
            <p className="text-[#3A6F43] text-lg mb-3">Total CO₂ (week)</p>
            <p className="text-5xl font-bold text-red-600">{totalCO2} kg</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition hover:scale-105 hover:shadow-2xl cursor-default">
            <p className="text-[#3A6F43] text-lg mb-3">Activities Logged</p>
            <p className="text-5xl font-bold text-[#59AC77]">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition hover:scale-105 hover:shadow-2xl cursor-default">
            <p className="text-[#3A6F43] text-lg mb-3">Daily Average</p>
            <p className="text-5xl font-bold text-[#3A6F43]">
              {(filtered.reduce((sum, a) => sum + Number(a.co2_estimate || 0), 0) / 7).toFixed(1)} kg
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-[#3A6F43] text-center">Emissions This Week</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e6" />
              <XAxis dataKey="day" tick={{ fill: '#3A6F43' }} />
              <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft', style: { fill: '#3A6F43' } }} />
              <Tooltip formatter={(v) => `${v} kg`} contentStyle={{ backgroundColor: '#FFD5D5', border: 'none' }} />
              <Bar dataKey="co2" fill="#59AC77" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters + Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-6 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white w-full sm:w-96 cursor-text text-[#3A6F43] placeholder-[#3A6F43]/60 transition"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-6 py-4 border border-[#FDAAAA] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FDAAAA] bg-white cursor-pointer transition text-[#3A6F43]"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Link
            href="/log"
            className="bg-[#3A6F43] hover:bg-[#59AC77] text-white font-bold px-10 py-5 rounded-xl shadow-lg transition transform hover:scale-110 hover:shadow-2xl cursor-pointer"
          >
            + Log New Activity
          </Link>
        </div>

        {/* Activity List */}
        <div className="space-y-8 mb-20">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl text-[#3A6F43] mb-8">No activities logged yet</p>
              <Link href="/log" className="bg-[#3A6F43] hover:bg-[#59AC77] text-white px-10 py-5 rounded-xl font-bold text-xl shadow-lg transition hover:scale-105 cursor-pointer">
                Start tracking gently 🌸
              </Link>
            </div>
          ) : (
            filtered.map(activity => (
              <div key={activity.id} className="bg-white rounded-2xl shadow-lg p-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-[#3A6F43] mb-3">{activity.details}</h3>
                    <div className="flex flex-wrap gap-4">
                      <span className="px-5 py-2 bg-[#59AC77]/20 text-[#3A6F43] rounded-full text-sm font-medium">
                        {activity.category}
                      </span>
                      <span className="text-[#3A6F43]">{format(new Date(activity.date), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-5xl font-bold ${Number(activity.co2_estimate) > 0 ? 'text-red-600' : 'text-[#59AC77]'}`}>
                      {Number(activity.co2_estimate) > 0 ? '+' : ''}{Number(activity.co2_estimate).toFixed(1)} kg
                    </p>
                    <p className="text-[#3A6F43] mt-2">CO₂ equivalent</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Your Signature Footer */}
        <footer className="mt-24 py-12 border-t border-[#FDAAAA]/30 text-center">
          <p className="text-[#3A6F43] text-lg">
            Built by <span className="font-bold">Syeda Aliza Ayaz</span>
          </p>
          <p className="text-[#3A6F43]/70 mt-2">© 2025 EcoLog – Small steps, big impact</p>
        </footer>
      </div>
    </div>
  );
}