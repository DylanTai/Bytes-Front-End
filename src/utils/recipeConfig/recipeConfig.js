// Recipe form constants and utility functions

// Volume unit options
export const VOLUME_UNITS = [
  { value: "tsp", label: "Teaspoon" },
  { value: "tbsp", label: "Tablespoon" },
  { value: "fl_oz", label: "Fluid Ounce" },
  { value: "cup", label: "Cup" },
  { value: "pt", label: "Pint" },
  { value: "qt", label: "Quart" },
  { value: "gal", label: "Gallon" },
  { value: "ml", label: "Milliliter" },
  { value: "l", label: "Liter" },
];

// Weight unit options
export const WEIGHT_UNITS = [
  { value: "g", label: "Gram" },
  { value: "kg", label: "Kilogram" },
  { value: "oz", label: "Ounce" },
  { value: "lb", label: "Pound" },
];

// Available dietary/allergen tags
export const AVAILABLE_TAGS = [
  { value: "contains_nuts", label: "Contains Nuts" },
  { value: "contains_dairy", label: "Contains Dairy" },
  { value: "contains_gluten", label: "Contains Gluten" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "contains_shellfish", label: "Contains Shellfish" },
  { value: "contains_eggs", label: "Contains Eggs" },
  { value: "spicy", label: "Spicy" },
];

// Conversion factors to base units (cup for volume, gram for weight)
const VOLUME_TO_CUP = {
  tsp: 1 / 48,
  tbsp: 1 / 16,
  fl_oz: 1 / 8,
  cup: 1,
  pt: 2,
  qt: 4,
  gal: 16,
  ml: 1 / 236.588,
  l: 4.22675,
};

const WEIGHT_TO_GRAM = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

/**
 * Convert quantity from one unit to another
 * @param {number} quantity - The quantity to convert
 * @param {string} fromUnit - The unit to convert from
 * @param {string} toUnit - The unit to convert to
 * @param {boolean} isVolume - True if converting volume, false if converting weight
 * @returns {number} The converted quantity, rounded to 2 decimal places
 */
export const convertQuantity = (quantity, fromUnit, toUnit, isVolume) => {
  if (!quantity || !fromUnit || !toUnit || fromUnit === toUnit) {
    return quantity;
  }
  
  const conversionTable = isVolume ? VOLUME_TO_CUP : WEIGHT_TO_GRAM;
 
  // Convert to base unit first, then to target unit
  const inBaseUnit = quantity * conversionTable[fromUnit];
  const converted = inBaseUnit / conversionTable[toUnit];
 
  // Round to 2 decimal places
  return Math.round(converted * 100) / 100;
};

/**
 * Calculate all possible unit values from a given quantity and unit
 * @param {number} quantity - The quantity
 * @param {string} unit - The current unit
 * @param {boolean} isVolume - True if volume, false if weight
 * @returns {Object} Object with all unit values pre-calculated
 */
export const calculateAllUnits = (quantity, unit, isVolume) => {
  if (!quantity || !unit) return {};
 
  const units = isVolume ? VOLUME_UNITS : WEIGHT_UNITS;
  const result = {};
 
  // Calculate value for each possible unit
  units.forEach(({ value }) => {
    result[value] = convertQuantity(quantity, unit, value, isVolume);
  });
 
  return result;
};

//Check if two units are compatible (both volume or both weight)
export const areUnitsCompatible = (unit1, unit2) => {
  if (!unit1 || !unit2) return false;
  
  const isUnit1Volume = VOLUME_UNITS.some(u => u.value === unit1);
  const isUnit2Volume = VOLUME_UNITS.some(u => u.value === unit2);
  
  // Both are volume or both are weight (not volume)
  return isUnit1Volume === isUnit2Volume;
};

//Find the optimal unit to display a quantity (highest unit closest to 1)
export const findOptimalUnit = (quantity, currentUnit, isVolume) => {
  if (!quantity || !currentUnit) return { quantity, unit: currentUnit };
  
  const units = isVolume ? VOLUME_UNITS : WEIGHT_UNITS;
  
  // Calculate quantity in each unit
  const unitValues = units.map(({ value }) => ({
    unit: value,
    quantity: convertQuantity(quantity, currentUnit, value, isVolume)
  }));
  
  // Filter units where quantity >= 1
  const validUnits = unitValues.filter(({ quantity }) => quantity >= 1);
  
  if (validUnits.length === 0) {
    // If no unit gives >= 1, use the smallest unit (first in array)
    return unitValues[0];
  }
  
  // Find the unit closest to 1
  const optimal = validUnits.reduce((best, current) => {
    const bestDiff = Math.abs(best.quantity - 1);
    const currentDiff = Math.abs(current.quantity - 1);
    return currentDiff < bestDiff ? current : best;
  });
  
  return {
    quantity: Math.round(optimal.quantity * 100) / 100,
    unit: optimal.unit
  };
};