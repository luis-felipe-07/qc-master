
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InspectionForm } from './components/InspectionForm';
import { ShippingView } from './components/ShippingView';
import { InspectionRecord, ShippingRecord, InspectionType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'process' | 'weight' | 'history' | 'shipping'>('dashboard');
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [shippingRecords, setShippingRecords] = useState<ShippingRecord[]>([]);
  const [editingInspection, setEditingInspection] = useState<InspectionRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInspections = localStorage.getItem('qc_inspections');
    const savedShipping = localStorage.getItem('qc_shipping');
    if (savedInspections) setInspections(JSON.parse(savedInspections));
    if (savedShipping) setShippingRecords(JSON.parse(savedShipping));
  }, []);

  // Save data to localStorage on changes
  useEffect(() => {
    localStorage.setItem('qc_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('qc_shipping', JSON.stringify(shippingRecords));
  }, [shippingRecords]);

  const addInspection = (record: InspectionRecord) => {
    if (editingInspection) {
      setInspections(prev => prev.map(ins => ins.id === record.id ? record : ins));
      setEditingInspection(null);
    } else {
      setInspections(prev => [record, ...prev]);
    }
    setActiveTab('history');
  };

  const addShipping = (record: ShippingRecord) => {
    setShippingRecords(prev => [record, ...prev]);
  };

  const deleteInspection = (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      setInspections(prev => prev.filter(ins => ins.id !== id));
    }
  };

  const startEdit = (record: InspectionRecord) => {
    setEditingInspection(record);
    setActiveTab(record.type === InspectionType.PROCESS ? 'process' : 'weight');
  };

  return (
    <div className="flex min-h-screen bg-green-50 text-slate-800">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setEditingInspection(null);
          setIsMobileMenuOpen(false);
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden pt-16 md:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            inspections={inspections} 
            shippingCount={shippingRecords.length}
          />
        )}
        
        {(activeTab === 'process' || activeTab === 'weight') && (
          <InspectionForm 
            type={activeTab === 'process' ? InspectionType.PROCESS : InspectionType.WEIGHT}
            onSubmit={addInspection}
            editingRecord={editingInspection}
            onCancel={() => {
              setEditingInspection(null);
              setActiveTab('history');
            }}
          />
        )}
        
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Histórico de Inspeções</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Data/Hora</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Material/Lote</th>
                      <th className="px-4 py-3">Inspetor</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum registro encontrado.</td>
                      </tr>
                    ) : (
                      inspections.map(ins => (
                        <tr key={ins.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{new Date(ins.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ins.type === InspectionType.PROCESS ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                              {ins.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{ins.materialId}</div>
                            <div className="text-xs text-slate-400">Lote: {ins.batchNumber}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{ins.inspectorName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ins.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {ins.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button 
                              onClick={() => startEdit(ins)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button 
                              onClick={() => deleteInspection(ins.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Excluir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <ShippingView 
            onSubmit={addShipping} 
            history={shippingRecords}
          />
        )}
      </main>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden no-print"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
    </div>
  );
};

export default App;
