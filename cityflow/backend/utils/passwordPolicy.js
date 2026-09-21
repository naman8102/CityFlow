/**
 * CityFlow AI — Authentication Security & Password Policy Engine
 * Smart India Hackathon 2026 (SIH 2026) | PS SIH26205 | Team NEURALKNIGHTS
 *
 * Password Specifications:
 * - Length: 8 to 15 characters inclusive
 * - Character Composition:
 *   - At least 1 uppercase letter (A-Z)
 *   - At least 1 lowercase letter (a-z)
 *   - At least 1 numeric digit (0-9)
 *   - At least 1 special character (!@#$%^&*()_+-=[]{};':"|,.<>/?`~)
 * - Whitespace: No spaces allowed
 * - Dynamic Strength: Weak | Medium | Strong | Very Strong
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

  // Calculate entropy score based on variety, length, and criteria fulfillment
  let score = 0;
  if (checks.length) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.lowercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;
  if (checks.noSpaces) score += 1;

  // Bonus points for variety within 8-15 bounds
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

export const validatePasswordPolicy = (password) => {
  if (typeof password !== 'string') {
    throw new Error('Password must be a valid text string.');
  }

  if (password.length < 8 || password.length > 15) {
    throw new Error('Password must be between 8 and 15 characters in length.');
  }

  if (/\s/.test(password)) {
    throw new Error('Password cannot contain spaces.');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter (A-Z).');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter (a-z).');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one numeric digit (0-9).');
  }

  if (!SPECIAL_CHAR_REGEX.test(password)) {
    throw new Error('Password must contain at least one special character (e.g. !@#$%^&*).');
  }

  const evaluation = evaluatePasswordStrength(password);
  if (!evaluation.isValid) {
    throw new Error('Password does not satisfy all required security criteria.');
  }

  return true;
};
