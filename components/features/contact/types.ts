export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  website_verify?: string; // Honeypot
  website?: string;
  projectType?: string;
  budget?: string;
  deadline?: string;
  message: string;
  privacy: boolean;
  package_name?: string;
  // Dynamic fields
  goal?: string;
  assets?: string;
  traffic?: string;
  scope?: string;
  integrations?: string;
  history?: string;
  tech?: string;
  features?: string;
  users?: string;
  process?: string;
  area?: string;
  appStage?: string;
  auditScope?: string;
  // Index signature for dynamic fields
  [key: string]: string | number | boolean | undefined;
}

export interface FormConfigField {
  name: keyof ContactFormData & string;
  label: string;
  type: 'select' | 'input';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FormConfigGroup {
  title: string;
  description: string;
  fields: FormConfigField[];
}

export interface Step2Content {
  title: string;
  typeLabel: string;
  options: { value: string; label: string }[];
}
