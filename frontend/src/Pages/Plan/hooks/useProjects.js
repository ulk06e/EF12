import { useEffect } from 'react';

export function getDescendantProjectIds(projects, parentId) {
  const direct = projects.filter(p => p.parent_id === parentId).map(p => p.id)
  let all = [...direct]
  for (const id of direct) {
    all = all.concat(getDescendantProjectIds(projects, id))
  }
  return all
}
