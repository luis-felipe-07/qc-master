
import React, { useState, useEffect, useCallback } from 'react';
import { InspectionRecord, InspectionType, TechnicalParameter } from '../types';

interface InspectionFormProps {
  type: InspectionType;
  onSubmit: (record: InspectionRecord) => void;
  editingRecord: InspectionRecord | null;
  onCancel: () => void;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({ type, onSubmit, editingRecord, onCancel }) => {
  const [inspector, setInspector] = useState(editingRecord?.inspectorName || '');
  const [material, setMaterial] = useState(editingRecord?.materialId || '');
  const [batch, setBatch] = useState(editingRecord?.batchNumber || '');
  const [sector, setSector] = useState(editingRecord?.sector || '');
  const [comment, setComment] = useState(editingRecord?.comment || '');
  const [photo, setPhoto] = useState(editingRecord?.photo || '');

  // Process Parameters
  const initialProcessParams: TechnicalParameter[] = [
    { name: 'Comprimento', min: 0, max: 0, actual: 0, notApplicable: false },
    { name: 'Largura', min: 0, max: 0, actual: 0, notApplicable: false },
    { name: 'Umidade', min: 0, max: 0, actual: 0, notApplicable: false },
    { name: 'Retilineidade', min: 0, max: 0, actual: 0, notApplicable: false },
    { name: 'Esquadro', min: 0, max: 0, actual: 0, notApplicable: false },
    { name: 'Espessura', min: 0, max: 0, actual: 0, notApplicable: false },
  ];

  const [parameters, setParameters] = useState<TechnicalParameter[]>(
    editingRecord?.type === InspectionType.PROCESS ? editingRecord.parameters : initialProcessParams
  );

  // Weight Specific Fields
  const [length, setLength] = useState(editingRecord?.parameters.find(p => p.name === 'Comprimento')?.actual || 0);
  const [width, setWidth] = useState(editingRecord?.parameters.find(p => p.name === 'Largura')?.actual || 0);
  const [thickness, setThickness] = useState(editingRecord?.parameters.find(p => p.name === 'Espessura')?.actual || 0);
  const [humidity, setHumidity] = useState(editingRecord?.parameters.find(p => p.name === 'Umidade')?.actual || 0);
  const [weightWithGlue, setWeightWithGlue] = useState(editingRecord?.weightWithGlue || 0);
  const [weightWithoutGlue, setWeightWithoutGlue] = useState(editingRecord?.weightWithoutGlue || 0);
  const [pressTemp, setPressTemp] = useState(editingRecord?.pressTemperature || 0);
  const [pressTime, setPressTime] = useState(editingRecord?.pressTime || 0);
  const [wMin, setWMin] = useState(editingRecord?.parameters.find(p => p.name === 'Gramatura')?.min || 0);
  const [wMax, setWMax] = useState(editingRecord?.parameters.find(p => p.name === 'Gramatura')?.max || 0);

  // Auto-calculated fields
  const [m2, setM2] = useState(0);
  const [calculatedWeight, setCalculatedWeight] = useState(0);

  useEffect(() => {
    const area = length * width;
    setM2(area);
    if (area > 0) {
      setCalculatedWeight((weightWithGlue - weightWithoutGlue) / area);
    } else {
      setCalculatedWeight(0);
    }
  }, [length, width, weightWithGlue, weightWithoutGlue]);

  const handleParamChange = (index: number, field: keyof TechnicalParameter, value: any) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
  };

  const checkStatus = () => {
    if (type === InspectionType.PROCESS) {
      return parameters.some(p => !p.notApplicable && (p.actual < p.min || p.actual > p.max)) ? 'Reprovado' : 'Aprovado';
    } else {
      // Logic for Weight Standard based on thickness
      let minS = 0, maxS = 0;
      if (thickness >= 1.3 && thickness <= 1.7) { minS = 360; maxS = 380.9; }
      else if (thickness >= 1.8 && thickness <= 2.1) { minS = 381; maxS = 400.9; }
      else if (thickness > 2.1) { minS = 401; maxS = 425.9; }

      // Also consider manual min/max if they are used as overrides
      const finalMin = wMin || minS;
      const finalMax = wMax || maxS;
      
      return (calculatedWeight >= finalMin && calculatedWeight <= finalMax) ? 'Aprovado' : 'Reprovado';
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const status = checkStatus();
    
    let finalParams = parameters;
    if (type === InspectionType.WEIGHT) {
      finalParams = [
        { name: 'Comprimento', min: 0, max: 0, actual: length, notApplicable: false },
        { name: 'Largura', min: 0, max: 0, actual: width, notApplicable: false },
        { name: 'Espessura', min: 0, max: 0, actual: thickness, notApplicable: false },
        { name: 'Umidade', min: 0, max: 0, actual: humidity, notApplicable: false },
        { name: 'Gramatura', min: wMin, max: wMax, actual: calculatedWeight, notApplicable: false }
      ];
    }

    const record: InspectionRecord = {
      id: editingRecord?.id || Date.now().toString(),
      type,
      inspectorName: inspector,
      timestamp: editingRecord?.timestamp || new Date().toISOString(),
      materialId: material,
      batchNumber: batch,
      sector,
      comment,
      photo,
      parameters: finalParams,
      status,
      // weight specific
      areaM2: m2,
      weightWithGlue,
      weightWithoutGlue,
      calculatedWeight,
      pressTemperature: pressTemp,
      pressTime: pressTime
    };

    onSubmit(record);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingRecord ? `Editando: ${type}` : `Nova Inspeção: ${type}`}
          </h2>
          <div className="space-x-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-md hover:bg-emerald-700 transition-colors">
              {editingRecord ? 'Atualizar Inspeção' : 'Concluir Inspeção'}
            </button>
            {editingRecord && (
              <button type="button" onClick={printReport} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold shadow-md hover:bg-slate-900">
                Emitir Relatório
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE REPORT HEADER */}
        <div className="hidden print:block bg-white p-8 border-b-2 border-slate-900 mb-8">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">QC MASTER PRO</h1>
                <p className="text-sm font-bold text-slate-500 italic">Laudo Técnico de Conformidade Industrial</p>
              </div>
              <div className="text-right">
                <div className={`text-xl font-black px-4 py-2 border-2 ${checkStatus() === 'Aprovado' ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'}`}>
                  {checkStatus() === 'Aprovado' ? 'CONFORME' : 'NÃO CONFORME'}
                </div>
                <p className="text-[10px] mt-1 text-slate-400">ID: {editingRecord?.id || 'NOVO'}</p>
              </div>
           </div>
        </div>

        {/* IDENTIFICATION SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Identificação do Material
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Inspetor" value={inspector} onChange={setInspector} />
            <FormField label="Setor" value={sector} onChange={setSector} />
            <FormField label="Identificação Material" value={material} onChange={setMaterial} />
            <FormField label="Número do Lote" value={batch} onChange={setBatch} />
          </div>
        </div>

        {/* PARAMETERS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14V8"/><path d="M12 18h.01"/></svg>
            Parâmetros Técnicos
          </h3>
          
          {type === InspectionType.PROCESS ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                      <th className="px-3 py-3 text-left">Parâmetro</th>
                      <th className="px-3 py-3 text-center">N.A.</th>
                      <th className="px-3 py-3 text-center">Mínimo</th>
                      <th className="px-3 py-3 text-center">Máximo</th>
                      <th className="px-3 py-3 text-center">Valor Real</th>
                      <th className="px-3 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parameters.map((p, i) => (
                      <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 font-medium">{p.name}</td>
                        <td className="px-3 py-3 text-center">
                          <input type="checkbox" checked={p.notApplicable} onChange={e => handleParamChange(i, 'notApplicable', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input type="number" step="0.01" value={p.min} onChange={e => handleParamChange(i, 'min', parseFloat(e.target.value))} disabled={p.notApplicable} className="w-20 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input type="number" step="0.01" value={p.max} onChange={e => handleParamChange(i, 'max', parseFloat(e.target.value))} disabled={p.notApplicable} className="w-20 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input type="number" step="0.01" value={p.actual} onChange={e => handleParamChange(i, 'actual', parseFloat(e.target.value))} disabled={p.notApplicable} className="w-24 px-2 py-1 text-center bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 font-bold outline-none" />
                        </td>
                        <td className="px-3 py-3 text-right">
                          {!p.notApplicable && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${p.actual >= p.min && p.actual <= p.max ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                              {p.actual >= p.min && p.actual <= p.max ? 'OK' : 'FORA'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {parameters.map((p, i) => (
                  <div key={p.name} className="p-4 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{p.name}</span>
                      <label className="flex items-center gap-2 text-xs text-slate-500">
                        N.A. <input type="checkbox" checked={p.notApplicable} onChange={e => handleParamChange(i, 'notApplicable', e.target.checked)} />
                      </label>
                    </div>
                    {!p.notApplicable && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center"><div className="text-[10px] text-slate-400 uppercase">Mín</div><input type="number" value={p.min} onChange={e => handleParamChange(i, 'min', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded text-center p-1" /></div>
                        <div className="text-center"><div className="text-[10px] text-slate-400 uppercase">Máx</div><input type="number" value={p.max} onChange={e => handleParamChange(i, 'max', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded text-center p-1" /></div>
                        <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold text-emerald-600">Real</div><input type="number" value={p.actual} onChange={e => handleParamChange(i, 'actual', parseFloat(e.target.value))} className="w-full border border-slate-300 font-bold rounded text-center p-1" /></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Weight Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="Comprimento (m)" type="number" value={length} onChange={val => setLength(parseFloat(val))} />
                <FormField label="Largura (m)" type="number" value={width} onChange={val => setWidth(parseFloat(val))} />
                <FormField label="Espessura (mm)" type="number" value={thickness} onChange={val => setThickness(parseFloat(val))} />
                <FormField label="Umidade (%)" type="number" value={humidity} onChange={val => setHumidity(parseFloat(val))} />
                <FormField label="Peso s/ Cola (g)" type="number" value={weightWithoutGlue} onChange={val => setWeightWithoutGlue(parseFloat(val))} />
                <FormField label="Peso c/ Cola (g)" type="number" value={weightWithGlue} onChange={val => setWeightWithGlue(parseFloat(val))} />
                <FormField label="T. Prensa (°C)" type="number" value={pressTemp} onChange={val => setPressTemp(parseFloat(val))} />
                <FormField label="Tempo Prensagem (s)" type="number" value={pressTime} onChange={val => setPressTime(parseFloat(val))} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
                   <div className="text-emerald-800 text-sm font-bold uppercase tracking-widest">Gramatura Calculada</div>
                   <div className="text-4xl font-black text-emerald-900">{calculatedWeight.toFixed(2)} <span className="text-lg">g/m²</span></div>
                   <div className="text-[10px] text-emerald-600 font-medium">({weightWithGlue} - {weightWithoutGlue}) / {m2.toFixed(4)} m²</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                   <div className="text-slate-500 text-xs font-bold uppercase mb-4">Tolerância Personalizada</div>
                   <div className="grid grid-cols-2 gap-4">
                     <FormField label="Mínimo (Manual)" type="number" value={wMin} onChange={val => setWMin(parseFloat(val))} />
                     <FormField label="Máximo (Manual)" type="number" value={wMax} onChange={val => setWMax(parseFloat(val))} />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MEDIA SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
               Registro com Foto
             </h3>
             <div className="space-y-4">
               <div className="flex items-center justify-center w-full">
                 <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative">
                   {photo ? (
                     <img src={photo} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                   ) : (
                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                       <p className="text-sm text-slate-500 font-medium">Clique p/ carregar foto</p>
                     </div>
                   )}
                   <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                 </label>
               </div>
               {photo && <button type="button" onClick={() => setPhoto('')} className="w-full py-2 text-xs font-bold text-rose-500 hover:text-rose-700">Remover Foto</button>}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               Observações
             </h3>
             <textarea 
               className="w-full h-40 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder-slate-400"
               placeholder="Escreva aqui observações adicionais sobre esta inspeção..."
               value={comment}
               onChange={e => setComment(e.target.value)}
             />
          </div>
        </div>

        {/* PRINT LAYOUT ADDITIONAL DATA */}
        <div className="hidden print:block space-y-6 mt-8">
           <div className="grid grid-cols-2 gap-8">
             <div className="border border-slate-200 p-4 rounded-lg">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Resumo da Inspeção</h4>
               <p className="text-sm"><strong>Data:</strong> {new Date(editingRecord?.timestamp || '').toLocaleString()}</p>
               <p className="text-sm"><strong>Material:</strong> {material}</p>
               <p className="text-sm"><strong>Lote:</strong> {batch}</p>
               <p className="text-sm"><strong>Setor:</strong> {sector}</p>
               <p className="text-sm"><strong>Inspetor:</strong> {inspector}</p>
             </div>
             {photo && (
               <div className="border border-slate-200 p-2 rounded-lg text-center">
                 <img src={photo} alt="Evidência" className="max-h-40 mx-auto rounded" />
                 <p className="text-[10px] mt-1 text-slate-400">Evidência Fotográfica Anexa</p>
               </div>
             )}
           </div>

           <div className="border border-slate-900">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Detalhamento dos Parâmetros</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-2 text-left">Indicador</th>
                    <th className="px-3 py-2 text-center">Mínimo</th>
                    <th className="px-3 py-2 text-center">Máximo</th>
                    <th className="px-3 py-2 text-center">Valor Real</th>
                    <th className="px-3 py-2 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {type === InspectionType.PROCESS ? (
                    parameters.map(p => (
                      <tr key={p.name}>
                        <td className="px-3 py-2 font-bold">{p.name}</td>
                        <td className="px-3 py-2 text-center">{p.notApplicable ? '-' : p.min}</td>
                        <td className="px-3 py-2 text-center">{p.notApplicable ? '-' : p.max}</td>
                        <td className="px-3 py-2 text-center font-bold">{p.notApplicable ? 'N.A.' : p.actual}</td>
                        <td className="px-3 py-2 text-right font-black">
                          {p.notApplicable ? '-' : (p.actual >= p.min && p.actual <= p.max ? 'APROVADO' : 'REPROVADO')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr><td className="px-3 py-2 font-bold">Espessura (mm)</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center font-bold">{thickness}</td><td className="px-3 py-2 text-right">-</td></tr>
                      <tr><td className="px-3 py-2 font-bold">Umidade (%)</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center font-bold">{humidity}</td><td className="px-3 py-2 text-right">-</td></tr>
                      <tr><td className="px-3 py-2 font-bold">Peso Sem Cola (g)</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center font-bold">{weightWithoutGlue}</td><td className="px-3 py-2 text-right">-</td></tr>
                      <tr><td className="px-3 py-2 font-bold">Peso Com Cola (g)</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center">-</td><td className="px-3 py-2 text-center font-bold">{weightWithGlue}</td><td className="px-3 py-2 text-right">-</td></tr>
                      <tr className="bg-slate-50">
                        <td className="px-3 py-3 font-black text-sm">GRAMATURA (g/m²)</td>
                        <td className="px-3 py-3 text-center font-bold">{wMin || '-'}</td>
                        <td className="px-3 py-3 text-center font-bold">{wMax || '-'}</td>
                        <td className="px-3 py-3 text-center font-black text-lg">{calculatedWeight.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right font-black text-sm">{checkStatus().toUpperCase()}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
           </div>

           {comment && (
             <div className="border border-slate-200 p-4 rounded-lg">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Parecer Técnico / Observações</h4>
               <p className="text-sm italic">"{comment}"</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-20 pt-16">
             <div className="text-center">
               <div className="border-t border-slate-900 pt-2 font-bold text-xs uppercase">Inspetor Responsável</div>
               <div className="text-sm mt-1">{inspector}</div>
             </div>
             <div className="text-center">
               <div className="border-t border-slate-900 pt-2 font-bold text-xs uppercase">Supervisor de Qualidade</div>
               <div className="text-[10px] text-slate-400 mt-1 italic">Assinatura / Carimbo</div>
             </div>
           </div>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string | number; onChange: (val: string) => void; type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">{label}</label>
    <input 
      type={type}
      step="0.01"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400"
    />
  </div>
);
