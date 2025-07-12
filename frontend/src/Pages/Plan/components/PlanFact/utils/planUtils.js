// Plan-related utility functions will go here

const qualityOrder = { A: 1, B: 2, C: 3, D: 4 };

export function sortPlanItems(items) {
  const result = items
    .filter(item => item.column_location === 'plan')
    .sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      const qualityA = qualityOrder[a.task_quality] || 5;
      const qualityB = qualityOrder[b.task_quality] || 5;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return qualityA - qualityB;
    });
  return result;
}

export const planUtilsPlaceholder = () => {}; 