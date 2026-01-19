
import React from 'react';
import { InspectionRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  inspections: InspectionRecord[];
  shippingCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ inspections, shippingCount }) => {
  const approved = inspections.filter(i => i.status === 'Aprovado').length;
  const rejected = inspections.filter(i => i.status === 'Reprovado').length;
  const total = inspections.length;
  const qualityRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Data for charts
  const statusData = [
    { name: 'Aprovado', value: approved, color: '#10b981' },
    { name: 'Reprovado', value: rejected, color: '#f43f5e' }
  ];

  const typeData = [
    { name: 'Processo', value: inspections.filter(i => i.type === 'Processo').length },
    { name: 'Gramatura', value: inspections.filter(i => i.type === 'Gramatura').length }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Métricas de controle de qualidade em tempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inspeções" value={total} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 7V2"/><path d="M15 7V2"/><path d="M12 22V7"/><path d="M5 13V8h14v5"/></svg>} />
        <StatCard title="Aprovadas" value={approved} color="text-emerald-600" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>} />
        <StatCard title="Reprovadas" value={rejected} color="text-rose-600" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>} />
        <StatCard title="Taxa de Qualidade" value={`${qualityRate}%`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14V8"/><path d="M12 18h.01"/></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Status das Inspeções</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Distribuição por Tipo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div><span className="text-xs text-slate-500">Processo</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span className="text-xs text-slate-500">Gramatura</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = "text-slate-900" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      <div className="text-slate-400">{icon}</div>
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);
