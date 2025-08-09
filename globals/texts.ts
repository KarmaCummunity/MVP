// קובץ טקסטים מרכזי בעברית
export const texts = {
  // This legacy export remains for backward compatibility during migration
  // Real translations will be served from i18n JSON namespaces in locales/
};

// פונקציה להחלפת משתנים בטקסט
export const replaceText = (text: string, variables: Record<string, string>): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}; 