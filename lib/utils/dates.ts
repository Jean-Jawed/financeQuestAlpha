/**
 * FINANCEQUEST - DATE UTILITIES
 * Helpers pour manipulation des dates (skip week-ends, jours ouvrables, etc.)
 */

// ==========================================
// DATE MANIPULATION
// ==========================================

/**
 * Obtenir la date d'aujourd'hui au format YYYY-MM-DD
 */
export function getTodayDate(): string {
  const today = new Date();
  return formatDate(today);
}

/**
 * Formater une date en YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parser une date string YYYY-MM-DD en Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Vérifier si une date est un week-end (samedi ou dimanche)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
}

/**
 * Avancer d'un jour (skip les week-ends)
 * Retourne le prochain jour ouvrable
 * 
 * @param currentDate - Date actuelle (YYYY-MM-DD)
 * @returns Prochain jour ouvrable (YYYY-MM-DD)
 * 
 * @example
 * ```ts
 * nextBusinessDay('2023-06-16') // Vendredi
 * // → '2023-06-19' (Lundi suivant)
 * 
 * nextBusinessDay('2023-06-15') // Jeudi
 * // → '2023-06-16' (Vendredi)
 * ```
 */
export function nextBusinessDay(currentDate: string): string {
  const date = parseDate(currentDate);
  
  // Avancer d'1 jour
  date.setDate(date.getDate() + 1);
  
  // Si samedi (6), avancer au lundi (+ 2 jours)
  if (date.getDay() === 6) {
    date.setDate(date.getDate() + 2);
  }
  
  // Si dimanche (0), avancer au lundi (+ 1 jour)
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }
  
  return formatDate(date);
}

/**
 * Reculer d'un jour (skip les week-ends)
 * Retourne le jour ouvrable précédent
 */
export function previousBusinessDay(currentDate: string): string {
  const date = parseDate(currentDate);
  
  // Reculer d'1 jour
  date.setDate(date.getDate() - 1);
  
  // Si dimanche (0), reculer au vendredi (- 2 jours)
  if (date.getDay() === 0) {
    date.setDate(date.getDate() - 2);
  }
  
  // Si samedi (6), reculer au vendredi (- 1 jour)
  if (date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }
  
  return formatDate(date);
}

/**
 * Calculer le nombre de jours ouvrables entre 2 dates
 * Exclut les week-ends
 */
export function getBusinessDaysBetween(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Obtenir la liste de tous les jours ouvrables entre 2 dates
 */
export function getBusinessDaysArray(startDate: string, endDate: string): string[] {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  const businessDays: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    if (!isWeekend(current)) {
      businessDays.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

/**
 * Vérifier si date1 est avant date2
 */
export function isBefore(date1: string, date2: string): boolean {
  return parseDate(date1) < parseDate(date2);
}

/**
 * Vérifier si date1 est après date2
 */
export function isAfter(date1: string, date2: string): boolean {
  return parseDate(date1) > parseDate(date2);
}

/**
 * Vérifier si date est aujourd'hui
 */
export function isToday(date: string): boolean {
  return date === getTodayDate();
}

/**
 * Vérifier si date est dans le futur
 */
export function isFuture(date: string): boolean {
  return isAfter(date, getTodayDate());
}

/**
 * Vérifier si date est dans le passé
 */
export function isPast(date: string): boolean {
  return isBefore(date, getTodayDate());
}

/**
 * Obtenir le nombre de jours entre 2 dates (incluant week-ends)
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Ajouter un nombre de jours à une date
 */
export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Soustraire un nombre de jours à une date
 */
export function subtractDays(date: string, days: number): string {
  return addDays(date, -days);
}

/**
 * Obtenir le début du mois (YYYY-MM-01)
 */
export function getStartOfMonth(date: string): string {
  const d = parseDate(date);
  d.setDate(1);
  return formatDate(d);
}

/**
 * Obtenir la fin du mois (YYYY-MM-XX)
 */
export function getEndOfMonth(date: string): string {
  const d = parseDate(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0); // Dernier jour du mois précédent
  return formatDate(d);
}

/**
 * Obtenir le premier jour de la semaine (lundi)
 */
export function getStartOfWeek(date: string): string {
  const d = parseDate(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Si dimanche, reculer de 6 jours
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/**
 * Obtenir le dernier jour de la semaine (dimanche)
 */
export function getEndOfWeek(date: string): string {
  const d = parseDate(date);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Valider qu'une date est au format YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  
  const d = parseDate(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Valider qu'une date est dans la range autorisée (2020 - aujourd'hui)
 */
export function isValidGameDate(date: string): boolean {
  if (!isValidDateFormat(date)) return false;
  
  const minDate = '2020-01-01';
  const maxDate = getTodayDate();
  
  return !isBefore(date, minDate) && !isAfter(date, maxDate);
}

// ==========================================
// FORMATTING DISPLAY
// ==========================================

/**
 * Formater une date pour affichage (ex: "15 juin 2023")
 */
export function formatDateDisplay(date: string, locale = 'fr-FR'): string {
  const d = parseDate(date);
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formater une date courte (ex: "15/06/2023")
 */
export function formatDateShort(date: string, locale = 'fr-FR'): string {
  const d = parseDate(date);
  return d.toLocaleDateString(locale);
}

/**
 * Obtenir le nom du jour (ex: "Lundi")
 */
export function getDayName(date: string, locale = 'fr-FR'): string {
  const d = parseDate(date);
  return d.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Obtenir une durée relative (ex: "il y a 3 jours")
 */
export function getRelativeTime(date: string): string {
  const d = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} ans`;
}
