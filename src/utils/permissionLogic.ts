export const ENTITY_MAP = {
  0: 'user',
  1: 'supplier',
  2: 'material',
  3: 'purchase',
  4: 'customer',
  5: 'quotation',
  6: 'order',
  7: 'transaction',
  8: 'labor',
} as const;

const ENTITY_ARRAY = Object.values(ENTITY_MAP);

export type ENTITY_LIST = typeof ENTITY_MAP[keyof typeof ENTITY_MAP];

export const PERM_LEVELS = { '-': 0, 'R': 1, 'W': 2, 'D': 3, 'M': 4 } as const;

export type POSSIBLE_PERMISSIONS = keyof typeof PERM_LEVELS;

export function hasPermission(permString: string, entityName: ENTITY_LIST, requiredLevel: POSSIBLE_PERMISSIONS) {
  const index = ENTITY_ARRAY.findIndex(value => value === entityName);

  if (index === -1 || !permString[index]) {
    throw new Error('Error in the permission logic')
  };

  const userPermission = permString[index] as POSSIBLE_PERMISSIONS;

  if (!Object.keys(PERM_LEVELS).includes(userPermission)) {
    throw new Error('Error in the permission logic')
  }

  const userLevel = PERM_LEVELS[userPermission];
  const required = PERM_LEVELS[requiredLevel];

  return userLevel >= required;
}


export function definePermissions() { }