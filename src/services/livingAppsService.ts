// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Benutzerverwaltung, Kalendereintraege, Wochenkalender } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- BENUTZERVERWALTUNG ---
  static async getBenutzerverwaltung(): Promise<Benutzerverwaltung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BENUTZERVERWALTUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBenutzerverwaltungEntry(id: string): Promise<Benutzerverwaltung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BENUTZERVERWALTUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBenutzerverwaltungEntry(fields: Benutzerverwaltung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BENUTZERVERWALTUNG}/records`, { fields });
  }
  static async updateBenutzerverwaltungEntry(id: string, fields: Partial<Benutzerverwaltung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BENUTZERVERWALTUNG}/records/${id}`, { fields });
  }
  static async deleteBenutzerverwaltungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BENUTZERVERWALTUNG}/records/${id}`);
  }

  // --- KALENDEREINTRAEGE ---
  static async getKalendereintraege(): Promise<Kalendereintraege[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KALENDEREINTRAEGE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKalendereintraegeEntry(id: string): Promise<Kalendereintraege | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KALENDEREINTRAEGE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKalendereintraegeEntry(fields: Kalendereintraege['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KALENDEREINTRAEGE}/records`, { fields });
  }
  static async updateKalendereintraegeEntry(id: string, fields: Partial<Kalendereintraege['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KALENDEREINTRAEGE}/records/${id}`, { fields });
  }
  static async deleteKalendereintraegeEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KALENDEREINTRAEGE}/records/${id}`);
  }

  // --- WOCHENKALENDER ---
  static async getWochenkalender(): Promise<Wochenkalender[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.WOCHENKALENDER}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getWochenkalenderEntry(id: string): Promise<Wochenkalender | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.WOCHENKALENDER}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createWochenkalenderEntry(fields: Wochenkalender['fields']) {
    return callApi('POST', `/apps/${APP_IDS.WOCHENKALENDER}/records`, { fields });
  }
  static async updateWochenkalenderEntry(id: string, fields: Partial<Wochenkalender['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.WOCHENKALENDER}/records/${id}`, { fields });
  }
  static async deleteWochenkalenderEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.WOCHENKALENDER}/records/${id}`);
  }

}