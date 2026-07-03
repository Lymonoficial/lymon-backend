/** Allowed image content types mapped to the extension used in the R2 key. */
export const LOGO_EXT_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Dedicated R2 prefix a tenant's logo lives under. */
export function tenantLogoPrefix(tenantId: string): string {
  return `tenants/${tenantId}/logo/`;
}
