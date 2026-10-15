export type ProfileValues = Record<string, string | null>;
export type ProfileDraft = Record<string, string>;
export type ProfileErrors = Record<string, string>;

export interface ProfileField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date";
  required: boolean;
  maxLength?: number;
  autoComplete?: string;
  fullWidth?: boolean;
}

export interface ProfileData {
  id: number;
  values: ProfileValues;
  active: boolean;
}

/** Read/update only; account creation and lifecycle belong to separate flows. */
export interface ProfileAdapter {
  fields: readonly ProfileField[];
  emailChangesLogin: boolean;
  read(id: number, signal?: AbortSignal): Promise<ProfileData>;
  update(id: number, values: ProfileValues): Promise<ProfileData>;
}
