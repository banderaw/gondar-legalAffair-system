// Role constants for the application
// These should match the backend User model RoleChoices exactly

export const ROLES = {
  ADMIN: 'admin',
  HEAD: 'head',
  LEGAL_OFFICER: 'legal_officer',
  REPORTER: 'reporter',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.HEAD]: 'Head',
  [ROLES.LEGAL_OFFICER]: 'Legal Officer',
  [ROLES.REPORTER]: 'Reporter',
};

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.HEAD, label: ROLE_LABELS[ROLES.HEAD] },
  { value: ROLES.LEGAL_OFFICER, label: ROLE_LABELS[ROLES.LEGAL_OFFICER] },
  { value: ROLES.REPORTER, label: ROLE_LABELS[ROLES.REPORTER] },
];

// Role groups for permissions
export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.HEAD];
export const LEGAL_TEAM_ROLES = [ROLES.ADMIN, ROLES.HEAD, ROLES.LEGAL_OFFICER];
export const INTERNAL_ROLES = [ROLES.ADMIN, ROLES.HEAD, ROLES.LEGAL_OFFICER];
export const ALL_ROLES = Object.values(ROLES);
