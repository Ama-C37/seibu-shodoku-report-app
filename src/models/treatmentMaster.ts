export type PestMaster = {
  pestId: string;
  pestName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChemicalMaster = {
  chemicalId: string;
  pestId: string;
  chemicalName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TreatmentMethodMaster = {
  treatmentMethodId: string;
  chemicalId: string;
  treatmentMethodName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
