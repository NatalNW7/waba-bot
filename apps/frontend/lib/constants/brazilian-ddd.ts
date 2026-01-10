/**
 * Brazilian DDD (area codes) organized by state
 * DDD = Discagem Direta à Distância (Direct Distance Dialing)
 */

export interface BrazilianDDD {
  code: string;
  state: string;
  stateAbbr: string;
}

/**
 * Complete list of Brazilian DDDs organized by state
 */
export const BRAZILIAN_DDDS: BrazilianDDD[] = [
  // São Paulo
  { code: "11", state: "São Paulo", stateAbbr: "SP" },
  { code: "12", state: "São Paulo", stateAbbr: "SP" },
  { code: "13", state: "São Paulo", stateAbbr: "SP" },
  { code: "14", state: "São Paulo", stateAbbr: "SP" },
  { code: "15", state: "São Paulo", stateAbbr: "SP" },
  { code: "16", state: "São Paulo", stateAbbr: "SP" },
  { code: "17", state: "São Paulo", stateAbbr: "SP" },
  { code: "18", state: "São Paulo", stateAbbr: "SP" },
  { code: "19", state: "São Paulo", stateAbbr: "SP" },

  // Rio de Janeiro
  { code: "21", state: "Rio de Janeiro", stateAbbr: "RJ" },
  { code: "22", state: "Rio de Janeiro", stateAbbr: "RJ" },
  { code: "24", state: "Rio de Janeiro", stateAbbr: "RJ" },

  // Espírito Santo
  { code: "27", state: "Espírito Santo", stateAbbr: "ES" },
  { code: "28", state: "Espírito Santo", stateAbbr: "ES" },

  // Minas Gerais
  { code: "31", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "32", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "33", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "34", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "35", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "37", state: "Minas Gerais", stateAbbr: "MG" },
  { code: "38", state: "Minas Gerais", stateAbbr: "MG" },

  // Paraná
  { code: "41", state: "Paraná", stateAbbr: "PR" },
  { code: "42", state: "Paraná", stateAbbr: "PR" },
  { code: "43", state: "Paraná", stateAbbr: "PR" },
  { code: "44", state: "Paraná", stateAbbr: "PR" },
  { code: "45", state: "Paraná", stateAbbr: "PR" },
  { code: "46", state: "Paraná", stateAbbr: "PR" },

  // Santa Catarina
  { code: "47", state: "Santa Catarina", stateAbbr: "SC" },
  { code: "48", state: "Santa Catarina", stateAbbr: "SC" },
  { code: "49", state: "Santa Catarina", stateAbbr: "SC" },

  // Rio Grande do Sul
  { code: "51", state: "Rio Grande do Sul", stateAbbr: "RS" },
  { code: "53", state: "Rio Grande do Sul", stateAbbr: "RS" },
  { code: "54", state: "Rio Grande do Sul", stateAbbr: "RS" },
  { code: "55", state: "Rio Grande do Sul", stateAbbr: "RS" },

  // Distrito Federal / Goiás
  { code: "61", state: "Distrito Federal", stateAbbr: "DF" },
  { code: "62", state: "Goiás", stateAbbr: "GO" },
  { code: "64", state: "Goiás", stateAbbr: "GO" },

  // Tocantins
  { code: "63", state: "Tocantins", stateAbbr: "TO" },

  // Mato Grosso
  { code: "65", state: "Mato Grosso", stateAbbr: "MT" },
  { code: "66", state: "Mato Grosso", stateAbbr: "MT" },

  // Mato Grosso do Sul
  { code: "67", state: "Mato Grosso do Sul", stateAbbr: "MS" },

  // Acre
  { code: "68", state: "Acre", stateAbbr: "AC" },

  // Rondônia
  { code: "69", state: "Rondônia", stateAbbr: "RO" },

  // Bahia
  { code: "71", state: "Bahia", stateAbbr: "BA" },
  { code: "73", state: "Bahia", stateAbbr: "BA" },
  { code: "74", state: "Bahia", stateAbbr: "BA" },
  { code: "75", state: "Bahia", stateAbbr: "BA" },
  { code: "77", state: "Bahia", stateAbbr: "BA" },

  // Sergipe
  { code: "79", state: "Sergipe", stateAbbr: "SE" },

  // Pernambuco
  { code: "81", state: "Pernambuco", stateAbbr: "PE" },
  { code: "87", state: "Pernambuco", stateAbbr: "PE" },

  // Alagoas
  { code: "82", state: "Alagoas", stateAbbr: "AL" },

  // Paraíba
  { code: "83", state: "Paraíba", stateAbbr: "PB" },

  // Rio Grande do Norte
  { code: "84", state: "Rio Grande do Norte", stateAbbr: "RN" },

  // Ceará
  { code: "85", state: "Ceará", stateAbbr: "CE" },
  { code: "88", state: "Ceará", stateAbbr: "CE" },

  // Piauí
  { code: "86", state: "Piauí", stateAbbr: "PI" },
  { code: "89", state: "Piauí", stateAbbr: "PI" },

  // Pará
  { code: "91", state: "Pará", stateAbbr: "PA" },
  { code: "93", state: "Pará", stateAbbr: "PA" },
  { code: "94", state: "Pará", stateAbbr: "PA" },

  // Amazonas
  { code: "92", state: "Amazonas", stateAbbr: "AM" },
  { code: "97", state: "Amazonas", stateAbbr: "AM" },

  // Roraima
  { code: "95", state: "Roraima", stateAbbr: "RR" },

  // Amapá
  { code: "96", state: "Amapá", stateAbbr: "AP" },

  // Maranhão
  { code: "98", state: "Maranhão", stateAbbr: "MA" },
  { code: "99", state: "Maranhão", stateAbbr: "MA" },
];

/**
 * Get DDD info by code
 */
export function getDDDByCode(code: string): BrazilianDDD | undefined {
  return BRAZILIAN_DDDS.find((ddd) => ddd.code === code);
}

/**
 * Search DDDs by state name or code
 */
export function searchDDDs(query: string): BrazilianDDD[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return BRAZILIAN_DDDS;

  return BRAZILIAN_DDDS.filter(
    (ddd) =>
      ddd.code.includes(normalizedQuery) ||
      ddd.state.toLowerCase().includes(normalizedQuery) ||
      ddd.stateAbbr.toLowerCase().includes(normalizedQuery),
  );
}
