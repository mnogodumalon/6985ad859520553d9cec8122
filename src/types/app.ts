// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Wochenkalender {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum_von?: string; // Format: YYYY-MM-DD oder ISO String
    datum_bis?: string; // Format: YYYY-MM-DD oder ISO String
    teilnehmer_2?: string; // applookup -> URL zu 'Benutzerverwaltung' Record
    tour?: 'tour_3' | 'tour_1' | 'tour_2';
  };
}

export interface Benutzerverwaltung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    pionier?: boolean;
    teamup_link?: string;
    storebox_code?: string;
    vorname?: string;
    nachname?: string;
    versammlung?: 'bayreuth_sued' | 'bayreuth_englisch' | 'bayreuth_russisch' | 'bayreuth_west' | 'bayreuth_ost';
    email?: string;
    handynummer?: string;
  };
}

export interface Kalendereintraege {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum_von?: string; // Format: YYYY-MM-DD oder ISO String
    datum_bis?: string; // Format: YYYY-MM-DD oder ISO String
    teilnehmer_1?: string; // applookup -> URL zu 'Benutzerverwaltung' Record
    teilnehmer_2?: string; // applookup -> URL zu 'Benutzerverwaltung' Record
    tour?: 'tour_3' | 'tour_1' | 'tour_2';
  };
}

export const APP_IDS = {
  WOCHENKALENDER: '6985ad71cb3a25ac36638ce4',
  BENUTZERVERWALTUNG: '6985ad6bb11d2147bcc3466a',
  KALENDEREINTRAEGE: '6985ad70362c1183b8ef9c05',
} as const;

// Helper Types for creating new records
export type CreateWochenkalender = Wochenkalender['fields'];
export type CreateBenutzerverwaltung = Benutzerverwaltung['fields'];
export type CreateKalendereintraege = Kalendereintraege['fields'];