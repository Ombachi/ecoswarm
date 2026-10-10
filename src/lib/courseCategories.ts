export const COURSE_CATEGORIES = [
  'Renewable Energy',
  'Regenerative Agriculture & Agroforestry',
  'Circular Economy & Waste Management',
  'Water Conservation & Marine Life',
  'Climate Policy & Advocacy',
] as const;

export const courseCategoryUrl = (category: string) => `/courses?${new URLSearchParams({ category })}`;