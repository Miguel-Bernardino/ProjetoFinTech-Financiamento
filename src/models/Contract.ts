import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  financeId: string;
  userId: string;
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  contractNumber: string;
  terms: string;
  generatedAt: Date;
  signedAt?: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  expiresAt: Date;
}

const ContractSchema = new Schema({
  financeId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'signed', 'rejected', 'expired'], 
    default: 'pending' 
  },
  contractNumber: { type: String, required: true, unique: true },
  terms: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  signedAt: { type: Date },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
