export interface User {
  id: string;
  name: string;
  profile: string;
  goals: string[];
  preferences?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}
