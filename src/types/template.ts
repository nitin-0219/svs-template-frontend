export interface Template {

  templateId: string;
  name: string;
  createdAt: string;
}

export interface Signer {
  signerId: string;
  signerName: string;
  signerEmail: string;
}

export interface DocumentCreationPayload {
  templateId: string;
  signers: Signer[];
}

export interface DocumentCreationResponse {
  documentId: string;
  signingLinks: {
    signerId: string;
    signingLink: string;
  }[];
}

export interface SigningField {
  id: string;
  type: "text" | "date" | "checkbox" | "signature";
  page: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  label: string;
  required: boolean;
  value?: string | boolean | Date;
}

export interface Document {
  id: string;
  name: string;
  status: "pending" | "completed" | "expired";
  fields: SigningField[];
  pdfUrl: string;
}

export interface SignerAssignment {
  signerId: string;
  signerName: string;
  signerEmail: string;
  fields: string[]; // IDs of fields assigned to this signer
  status: "pending" | "completed";
}
