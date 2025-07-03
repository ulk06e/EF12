// Project-related utility functions

export function getColumnProjects(projects, parentId) {
  return projects
    .filter(p => (parentId ? p.parent_id === parentId : !p.parent_id))
    .filter(p => !p.completed)
    .sort((a, b) => {
      // Sort by current_level (descending)
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      // Then by current_xp (descending)
      return b.current_xp - a.current_xp;
    });
}

export function getDescendantProjectIds(projects, parentId) {
  const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id);
  let all = [...direct];
  for (const id of direct) {
    all = all.concat(getDescendantProjectIds(projects, id));
  }
  return all;
}

export function getPrevLevelXP(level) {
  return 100 * Math.pow(level, 2);
} 