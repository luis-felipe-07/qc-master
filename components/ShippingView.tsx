
import React, { useState } from 'react';
import { ShippingRecord } from '../types';

interface ShippingViewProps {
  onSubmit: (record: ShippingRecord) => void;
  history: ShippingRecord[];
}

export const ShippingView: React.FC<ShippingViewProps> = ({ onSubmit, history }) => {
  const [invoice, setInvoice] = useState('');
  const [pdv, setPdv] = useState('');
  const [batch, setBatch] = useState('');
  const [client, setClient] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [photo, setPhoto] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: ShippingRecord = {
      id: Date.now().toString(),
      invoiceNumber: invoice,
      pdv,
      batchNumber: batch,
      client,
      quantity,
      timestamp: new Date().toISOString(),
      photo
    };
    onSubmit(record);
    // Reset form
    setInvoice('');
    setPdv('');
    setBatch('');
    setClient('');
    setQuantity(0);
    setPhoto('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Módulo de Expedição</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Novo Carregamento</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ShippingField label="Nota Fiscal" value={invoice} onChange={setInvoice} />
              <ShippingField label="PDV" value={pdv} onChange={setPdv} />
              <ShippingField label="Lote" value={batch} onChange={setBatch} />
              <ShippingField label="Cliente" value={client} onChange={setClient} />
              <ShippingField label="Quantidade de Produtos" type="number" value={quantity} onChange={v => setQuantity(parseInt(v))} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Foto do Carregamento</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative">
                {photo ? (
                  <img src={photo} alt="Carregamento" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 text-sm">Clique para adicionar foto do carregamento</div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg">
              Registrar Expedição
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-sm font-medium opacity-80 mb-1">Total Expedido</h3>
            <div className="text-3xl font-bold">{history.reduce((acc, curr) => acc + curr.quantity, 0)}</div>
            <p className="text-xs opacity-60 mt-2">Unidades registradas no sistema</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold">Histórico de Saídas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-center">NF/PDV</th>
                <th className="px-4 py-3 text-center">Quantidade</th>
                <th className="px-4 py-3 text-right">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Nenhuma expedição registrada.</td></tr>
              ) : (
                history.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold">{item.client}</td>
                    <td className="px-4 py-3 text-center text-xs">
                      <div>NF: {item.invoiceNumber}</div>
                      <div className="text-slate-400">PDV: {item.pdv}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-black text-emerald-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {item.photo && <img src={item.photo} className="w-8 h-8 rounded ml-auto object-cover" alt="Thumb" />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ShippingField: React.FC<{ label: string; value: string | number; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
    />
  </div>
);
