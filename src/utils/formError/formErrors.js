const normalizeMessages = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeMessages(item))
      .filter((message) => typeof message === "string" && message.trim().length > 0);
  }
  if (typeof value === "string" || typeof value === "number") {
    const message = String(value).trim();
    return message ? [message] : [];
  }
  return [];
};

const ensureArrayEntry = (container, key) => {
  if (!container[key]) {
    container[key] = [];
  }
  return container[key];
};

const ensureIndexedEntry = (collection, index) => {
  while (collection.length <= index) {
    collection.push({});
  }
  if (!collection[index]) {
    collection[index] = {};
  }
  return collection[index];
};

export const createRecipeErrorState = (ingredientCount = 0, stepCount = 0) => ({
  general: [],
  fields: {},
  ingredients: Array.from({ length: ingredientCount }, () => ({})),
  steps: Array.from({ length: stepCount }, () => ({})),
});

export const cloneRecipeErrorState = (errors) => ({
  general: [...(errors?.general || [])],
  fields: Object.entries(errors?.fields || {}).reduce((acc, [key, messages]) => {
    acc[key] = [...messages];
    return acc;
  }, {}),
  ingredients: (errors?.ingredients || []).map((entry) =>
    Object.entries(entry || {}).reduce((acc, [key, messages]) => {
      acc[key] = [...messages];
      return acc;
    }, {})
  ),
  steps: (errors?.steps || []).map((entry) =>
    Object.entries(entry || {}).reduce((acc, [key, messages]) => {
      acc[key] = [...messages];
      return acc;
    }, {})
  ),
});

export const addFieldError = (errors, field, messages) => {
  const normalized = normalizeMessages(messages);
  if (!normalized.length) return;
  const target = ensureArrayEntry(errors.fields, field);
  target.push(...normalized);
};

export const addGeneralError = (errors, messages, context) => {
  const normalized = normalizeMessages(messages);
  if (!normalized.length) return;

  if (context?.type === "ingredient") {
    addIngredientError(errors, context.index ?? 0, "general", normalized);
    return;
  }

  if (context?.type === "step") {
    addStepError(errors, context.index ?? 0, "general", normalized);
    return;
  }

  errors.general.push(...normalized);
};

export const addIngredientError = (errors, index, field, messages) => {
  const normalized = normalizeMessages(messages);
  if (!normalized.length) return;
  const entry = ensureIndexedEntry(errors.ingredients, index);
  const target = ensureArrayEntry(entry, field || "general");
  target.push(...normalized);
};

export const addStepError = (errors, index, field, messages) => {
  const normalized = normalizeMessages(messages);
  if (!normalized.length) return;
  const entry = ensureIndexedEntry(errors.steps, index);
  const target = ensureArrayEntry(entry, field || "general");
  target.push(...normalized);
};

export const applyDetailsToRecipeErrors = (errors, details, context) => {
  if (details === undefined || details === null) return;

  if (Array.isArray(details)) {
    const literalMessages = details.filter(
      (item) => typeof item === "string" || typeof item === "number"
    );

    if (literalMessages.length) {
      addGeneralError(errors, literalMessages.map(String), context);
    }

    details.forEach((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        applyDetailsToRecipeErrors(errors, item, context);
      }
    });

    return;
  }

  if (typeof details === "object") {
    Object.entries(details).forEach(([key, value]) => {
      if (key === "non_field_errors" || key === "detail") {
        applyDetailsToRecipeErrors(errors, value, context);
        return;
      }

      if (context?.type === "ingredient") {
        addIngredientError(errors, context.index ?? 0, key, value);
        return;
      }

      if (context?.type === "step") {
        addStepError(errors, context.index ?? 0, key, value);
        return;
      }

      if (key === "ingredients" && Array.isArray(value)) {
        value.forEach((item, ingredientIndex) => {
          applyDetailsToRecipeErrors(errors, item, {
            type: "ingredient",
            index: ingredientIndex,
          });
        });
        return;
      }

      if (key === "steps" && Array.isArray(value)) {
        value.forEach((item, stepIndex) => {
          applyDetailsToRecipeErrors(errors, item, {
            type: "step",
            index: stepIndex,
          });
        });
        return;
      }

      if (typeof value === "object" && value !== null) {
        applyDetailsToRecipeErrors(errors, value, context);
        return;
      }

      addFieldError(errors, key, value);
    });

    return;
  }

  addGeneralError(errors, [String(details)], context);
};

export const hasRecipeErrors = (errors) => {
  if (!errors) return false;

  if (errors.general?.length) return true;

  if (errors.fields) {
    const fieldHasErrors = Object.values(errors.fields).some(
      (messages) => Array.isArray(messages) && messages.length > 0
    );
    if (fieldHasErrors) return true;
  }

  if (Array.isArray(errors.ingredients)) {
    const ingredientHasErrors = errors.ingredients.some((entry) =>
      entry && Object.values(entry).some(
        (messages) => Array.isArray(messages) && messages.length > 0
      )
    );
    if (ingredientHasErrors) return true;
  }

  if (Array.isArray(errors.steps)) {
    const stepHasErrors = errors.steps.some((entry) =>
      entry && Object.values(entry).some(
        (messages) => Array.isArray(messages) && messages.length > 0
      )
    );
    if (stepHasErrors) return true;
  }

  return false;
};
