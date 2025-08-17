export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'medium' | 'strong';
  requirements: (PasswordRequirement & { met: boolean })[];
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'Contains number',
    test: (password: string) => /\d/.test(password),
  },
  {
    label: 'Contains special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export function validatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      requirements: passwordRequirements.map(req => ({
        ...req,
        met: false,
      })),
    };
  }

  const requirements = passwordRequirements.map(req => ({
    ...req,
    met: req.test(password),
  }));

  const metRequirements = requirements.filter(req => req.met).length;
  const baseScore = (metRequirements / passwordRequirements.length) * 80;
  
  // Bonus points for length
  const lengthBonus = Math.min((password.length - 8) * 2, 20);
  
  const score = Math.min(baseScore + lengthBonus, 100);

  let level: 'weak' | 'medium' | 'strong';
  if (score < 40) {
    level = 'weak';
  } else if (score < 80) {
    level = 'medium';
  } else {
    level = 'strong';
  }

  return {
    score,
    level,
    requirements,
  };
}

export function isPasswordValid(password: string): boolean {
  const strength = validatePasswordStrength(password);
  return strength.requirements.every(req => req.met);
}

// Alias for backwards compatibility
export const calculatePasswordStrength = validatePasswordStrength;