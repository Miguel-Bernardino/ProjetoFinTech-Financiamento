import { Schema, model, Document } from "mongoose"

export interface IFinance extends Document {
  brand: string;
  modelName: string;
  type: "SUV" | "Sedan" | "Hatch" | "Convertible" | "Coupe" | "Minivan" | "Pickup Truck" | "Wagon" | "Van" | "Other";
  value: number; // Valor Total do Veículo
  countOfMonths: number;
  userId: string;
  
  // Novos campos sugeridos:
  downPayment?: number; // Valor de Entrada (opcional)
  interestRate: number; // Taxa de Juros Anual (ex: 0.08 para 8%)
  installmentValue?: number; // Valor da Parcela (opcional, calculado)
  vehicleSpecs?: any; // informações obtidas da API externa sobre o veículo (opcional)
  financeDate: Date; // Data do Financiamento
  status: "approved" | "rejected" | "pending" | "in_progress" | "completed"; // Status mais detalhado
  deleted: boolean;
}

export const financeSchema = new Schema<IFinance>(
  {
    brand: {
      type: String,
      required: [true, "Marca é obrigatória"],
      trim: true
    },
    
    modelName: {
      type: String,
      required: [true, "Modelo é obrigatório"],
      trim: true
    },
    
    type: {
      type: String,
      enum: ["SUV", "Sedan", "Hatch", "Convertible", "Coupe", "Minivan", "Pickup Truck", "Wagon", "Van", "Other"],
      required: [true, "Tipo é obrigatório"]
    },
    
    value: {
      type: Number,
      required: [true, "Valor é obrigatório"],
    },

    financeDate: {
      type: Date,
      required: [true, "Data de financiamento é obrigatória"],
    },

    downPayment: {
      type: Number,
      required: [true, "Entrada é obrigatória"],
    },

    interestRate: {
      type: Number,
      required: [true, "Taxa de juros é obrigatória"],
    },

    installmentValue: {
      type: Number,
      required: [true, "Valor da parcela é obrigatório"],
    },
    vehicleSpecs: {
      type: Object,
      required: false,
    },
    
    countOfMonths: {
      type: Number,
      required: [true, "Contagem de meses é obrigatória"],
    },
    
    userId: {
      type: String,
      required: [true, "ID do usuário é obrigatório"],
    },
    
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "completed", "rejected"],
      default: "pending"
    },
    deleted: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

export const Finance = model<IFinance>('Finance', financeSchema);
