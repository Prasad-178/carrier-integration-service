export interface Address {
  name: string;
  company?: string;
  addressLines: string[];
  city: string;
  stateProvince?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  email?: string;
  isResidential?: boolean;
}
