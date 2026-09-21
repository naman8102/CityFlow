/**
 * CityFlow AI — Frontend Password Policy & Real-Time Strength Engine
 * Smart India Hackathon 2026 (SIH 2026) | PS SIH26205 | Team NEURALKNIGHTS
 */

export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export const evaluatePasswordStrength = (password = '') => {
  const str = String(password || '');

  const checks = {
    length: str.length >= 8 && str.length <= 15,
    uppercase: /[A-Z]/.test(str),
    lowercase: /[a-z]/.test(str),
    number: /[0-9]/.test(str),
    special: SPECIAL_CHAR_REGEX.test(str),
    noSpaces: str.length > 0 && !/\s/.test(str)
  };

  const validCount = Object.values(checks).filter(Boolean).length;
  const isValid = validCount === 6;

  // Calculate entropy score
  let score = 0;
  if (checks.length) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.lowercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;
  if (checks.noSpaces) score += 1;

  if (str.length >= 10 && str.length <= 15) score += 1;
  if (str.length >= 12 && str.length <= 15) score += 1;
  if ((str.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g) || []).length >= 2) score += 1;
  if ((str.match(/[0-9]/g) || []).length >= 2) score += 1;

  let strength = 'Weak';
  let tier = 1;

  if (!isValid || str.length < 8 || str.length > 15 || /\s/.test(str)) {
    strength = 'Weak';
    tier = 1;
  } else if (score < 8) {
    strength = 'Medium';
    tier = 2;
  } else if (score < 9) {
    strength = 'Strong';
    tier = 3;
  } else {
    strength = 'Very Strong';
    tier = 4;
  }

  return {
    isValid,
    checks,
    strength,
    tier,
    validCount,
    totalChecks: 6
  };
};

export const CHECKLIST_ITEMS = [
  { key: 'length', label: '8–15 characters' },
  { key: 'uppercase', label: 'At least 1 uppercase letter (A–Z)' },
  { key: 'lowercase', label: 'At least 1 lowercase letter (a–z)' },
  { key: 'number', label: 'At least 1 numeric digit (0–9)' },
  { key: 'special', label: 'At least 1 special character (!@#$%^&*)' },
  { key: 'noSpaces', label: 'No spaces allowed' }
];
