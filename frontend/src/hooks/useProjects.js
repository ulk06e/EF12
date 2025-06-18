import { useEffect } from 'react';

export function getDescendantProjectIds(projects, parentId) {
  const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id)
  let all = [...direct]
  for (const id of direct) {
    all = all.concat(getDescendantProjectIds(projects, id))
  }
  return all
}

export function handleProjectSelect(newSelected, projects, setSelectedProjectIds) {
  let [sel1, sel2, sel3] = newSelected
  // If selecting in col 1, auto-select top child in col 2 and col 3
  if (sel1 && newSelected[1] === null) {
    const col2 = projects.filter(p => p.parent_id === sel1)
    sel2 = col2.length > 0 ? col2[0].id : null
  }
  if (sel2 && newSelected[2] === null) {
    const col3 = projects.filter(p => p.parent_id === sel2)
    sel3 = col3.length > 0 ? col3[0].id : null
  }
  setSelectedProjectIds([sel1, sel2, sel3])
}

export function useAutoSelectProjects(projects, selectedProjectIds, setSelectedProjectIds) {
  useEffect(() => {
    // Only auto-select if no projects are currently selected
    const hasAnySelection = selectedProjectIds.some(id => id !== null);
    
    if (projects.length > 0 && !hasAnySelection) {
      const top1 = projects.find(p => !p.parent_id);
      if (top1) {
        const col2 = projects.filter(p => p.parent_id === top1.id);
        const top2 = col2.length > 0 ? col2[0] : null;
        const col3 = top2 ? projects.filter(p => p.parent_id === top2.id) : [];
        const top3 = col3.length > 0 ? col3[0] : null;
        setSelectedProjectIds([
          top1.id,
          top2 ? top2.id : null,
          top3 ? top3.id : null
        ]);
      }
    }
  }, [projects, selectedProjectIds]);
} 