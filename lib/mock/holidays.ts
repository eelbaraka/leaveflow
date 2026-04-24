import type { Holiday } from "../types";

// 2026 holidays across countries used by employees
export const holidays: Holiday[] = [
  // US
  { id: "h-us-1", name: "New Year's Day", date: "2026-01-01", countryCode: "US", countryName: "United States" },
  { id: "h-us-2", name: "Martin Luther King Jr. Day", date: "2026-01-19", countryCode: "US", countryName: "United States" },
  { id: "h-us-3", name: "Presidents' Day", date: "2026-02-16", countryCode: "US", countryName: "United States" },
  { id: "h-us-4", name: "Memorial Day", date: "2026-05-25", countryCode: "US", countryName: "United States" },
  { id: "h-us-5", name: "Juneteenth", date: "2026-06-19", countryCode: "US", countryName: "United States" },
  { id: "h-us-6", name: "Independence Day", date: "2026-07-03", countryCode: "US", countryName: "United States" },
  { id: "h-us-7", name: "Labor Day", date: "2026-09-07", countryCode: "US", countryName: "United States" },
  { id: "h-us-8", name: "Thanksgiving", date: "2026-11-26", countryCode: "US", countryName: "United States" },
  { id: "h-us-9", name: "Christmas Day", date: "2026-12-25", countryCode: "US", countryName: "United States" },

  // UK
  { id: "h-uk-1", name: "New Year's Day", date: "2026-01-01", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-2", name: "Good Friday", date: "2026-04-03", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-3", name: "Easter Monday", date: "2026-04-06", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-4", name: "Early May Bank Holiday", date: "2026-05-04", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-5", name: "Spring Bank Holiday", date: "2026-05-25", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-6", name: "Summer Bank Holiday", date: "2026-08-31", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-7", name: "Christmas Day", date: "2026-12-25", countryCode: "UK", countryName: "United Kingdom" },
  { id: "h-uk-8", name: "Boxing Day", date: "2026-12-28", countryCode: "UK", countryName: "United Kingdom" },

  // Germany
  { id: "h-de-1", name: "Neujahr", date: "2026-01-01", countryCode: "DE", countryName: "Germany" },
  { id: "h-de-2", name: "Karfreitag", date: "2026-04-03", countryCode: "DE", countryName: "Germany" },
  { id: "h-de-3", name: "Ostermontag", date: "2026-04-06", countryCode: "DE", countryName: "Germany" },
  { id: "h-de-4", name: "Tag der Arbeit", date: "2026-05-01", countryCode: "DE", countryName: "Germany" },
  { id: "h-de-5", name: "Tag der Deutschen Einheit", date: "2026-10-03", countryCode: "DE", countryName: "Germany" },
  { id: "h-de-6", name: "Weihnachten", date: "2026-12-25", countryCode: "DE", countryName: "Germany" },

  // India
  { id: "h-in-1", name: "Republic Day", date: "2026-01-26", countryCode: "IN", countryName: "India" },
  { id: "h-in-2", name: "Holi", date: "2026-03-04", countryCode: "IN", countryName: "India" },
  { id: "h-in-3", name: "Independence Day", date: "2026-08-15", countryCode: "IN", countryName: "India" },
  { id: "h-in-4", name: "Gandhi Jayanti", date: "2026-10-02", countryCode: "IN", countryName: "India" },
  { id: "h-in-5", name: "Diwali", date: "2026-11-08", countryCode: "IN", countryName: "India" },

  // Japan
  { id: "h-jp-1", name: "New Year's Day", date: "2026-01-01", countryCode: "JP", countryName: "Japan" },
  { id: "h-jp-2", name: "Coming of Age Day", date: "2026-01-12", countryCode: "JP", countryName: "Japan" },
  { id: "h-jp-3", name: "Golden Week", date: "2026-05-04", countryCode: "JP", countryName: "Japan" },
  { id: "h-jp-4", name: "Marine Day", date: "2026-07-20", countryCode: "JP", countryName: "Japan" },
  { id: "h-jp-5", name: "Mountain Day", date: "2026-08-11", countryCode: "JP", countryName: "Japan" },

  // Morocco
  { id: "h-ma-1", name: "New Year's Day", date: "2026-01-01", countryCode: "MA", countryName: "Morocco" },
  { id: "h-ma-2", name: "Independence Manifesto Day", date: "2026-01-11", countryCode: "MA", countryName: "Morocco" },
  { id: "h-ma-3", name: "Labour Day", date: "2026-05-01", countryCode: "MA", countryName: "Morocco" },
  { id: "h-ma-4", name: "Throne Day", date: "2026-07-30", countryCode: "MA", countryName: "Morocco" },
  { id: "h-ma-5", name: "Green March", date: "2026-11-06", countryCode: "MA", countryName: "Morocco" },
  { id: "h-ma-6", name: "Independence Day", date: "2026-11-18", countryCode: "MA", countryName: "Morocco" },

  // Brazil
  { id: "h-br-1", name: "Confraternização Universal", date: "2026-01-01", countryCode: "BR", countryName: "Brazil" },
  { id: "h-br-2", name: "Carnaval", date: "2026-02-17", countryCode: "BR", countryName: "Brazil" },
  { id: "h-br-3", name: "Tiradentes", date: "2026-04-21", countryCode: "BR", countryName: "Brazil" },
  { id: "h-br-4", name: "Independência", date: "2026-09-07", countryCode: "BR", countryName: "Brazil" },
  { id: "h-br-5", name: "Natal", date: "2026-12-25", countryCode: "BR", countryName: "Brazil" },

  // Spain
  { id: "h-es-1", name: "Año Nuevo", date: "2026-01-01", countryCode: "ES", countryName: "Spain" },
  { id: "h-es-2", name: "Día del Trabajador", date: "2026-05-01", countryCode: "ES", countryName: "Spain" },
  { id: "h-es-3", name: "Fiesta Nacional", date: "2026-10-12", countryCode: "ES", countryName: "Spain" },
  { id: "h-es-4", name: "Navidad", date: "2026-12-25", countryCode: "ES", countryName: "Spain" },

  // Sweden
  { id: "h-se-1", name: "Nyårsdagen", date: "2026-01-01", countryCode: "SE", countryName: "Sweden" },
  { id: "h-se-2", name: "Midsommar", date: "2026-06-19", countryCode: "SE", countryName: "Sweden" },
  { id: "h-se-3", name: "Juldagen", date: "2026-12-25", countryCode: "SE", countryName: "Sweden" },

  // Norway
  { id: "h-no-1", name: "Nyttårsdag", date: "2026-01-01", countryCode: "NO", countryName: "Norway" },
  { id: "h-no-2", name: "Grunnlovsdag", date: "2026-05-17", countryCode: "NO", countryName: "Norway" },
  { id: "h-no-3", name: "Juledag", date: "2026-12-25", countryCode: "NO", countryName: "Norway" },

  // UAE
  { id: "h-ae-1", name: "New Year's Day", date: "2026-01-01", countryCode: "AE", countryName: "UAE" },
  { id: "h-ae-2", name: "Eid al-Fitr", date: "2026-03-20", countryCode: "AE", countryName: "UAE" },
  { id: "h-ae-3", name: "National Day", date: "2026-12-02", countryCode: "AE", countryName: "UAE" },
];

export const countries = Array.from(
  new Map(holidays.map((h) => [h.countryCode, { code: h.countryCode, name: h.countryName }])).values()
);
