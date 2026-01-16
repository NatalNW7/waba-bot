interface SpecialMapping {
  key: string;
  value?: unknown;
}

export type SpecialMappings = Record<string, SpecialMapping | unknown>;

/**
 * Parses a comma-separated string of relations into a Prisma 'include' object.
 *
 * @param includeStr - Comma-separated list of relations (e.g., 'services,plans').
 * @param validRelations - Array of relation names allowed for the model.
 * @param specialMappings - Optional object mapping a relation name to a specific Prisma 'include' structure.
 * @returns An 'include' object compatible with Prisma queries, or undefined if no valid relations are found.
 */
export function parseInclude(
  includeStr?: string,
  validRelations: string[] = [],
  specialMappings: SpecialMappings = {},
): Record<string, unknown> | undefined {
  if (!includeStr) return undefined;

  const includeObj: Record<string, unknown> = {};
  const requestedRelations = includeStr.split(',').map((r) => r.trim());

  requestedRelations.forEach((rel) => {
    if (validRelations.includes(rel)) {
      if (specialMappings[rel]) {
        // If there's a special mapping (like flattening or nested includes), use it.
        // We might need to handle cases where the key in Prisma differs from 'rel'.
        const mapping = specialMappings[rel];
        if (isSpecialMapping(mapping)) {
          includeObj[mapping.key] = mapping.value ?? true;
        } else {
          includeObj[rel] = mapping;
        }
      } else {
        includeObj[rel] = true;
      }
    }
  });

  return Object.keys(includeObj).length > 0 ? includeObj : undefined;
}

function isSpecialMapping(mapping: unknown): mapping is SpecialMapping {
  return (
    typeof mapping === 'object' &&
    mapping !== null &&
    'key' in mapping &&
    typeof (mapping as SpecialMapping).key === 'string'
  );
}
