
export enum InspectionType {
  PROCESS = 'Processo',
  WEIGHT = 'Gramatura'
}

export interface TechnicalParameter {
  name: string;
  min: number;
  max: number;
  actual: number;
  notApplicable: boolean;
}

export interface WeightParameter {
  name: string;
  min?: number;
  max?: number;
  actual: number;
  notApplicable: boolean;
}

export interface InspectionRecord {
  id: string;
  type: InspectionType;
  inspectorName: string;
  timestamp: string;
  materialId: string;
  batchNumber: string;
  sector: string;
  parameters: TechnicalParameter[];
  // Weight specific fields
  areaM2?: number;
  weightWithGlue?: number;
  weightWithoutGlue?: number;
  calculatedWeight?: number;
  pressTemperature?: number;
  pressTime?: number;
  // Common
  photo?: string;
  comment?: string;
  status: 'Aprovado' | 'Reprovado';
}

export interface ShippingRecord {
  id: string;
  invoiceNumber: string; // Nota Fiscal
  pdv: string;
  batchNumber: string;
  client: string;
  quantity: number;
  timestamp: string;
  photo?: string;
}
