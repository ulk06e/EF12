import React from 'react';
import TaskCard from 'src/Pages/Plan/components/PlanFact/renderers/TaskCard.jsx';
import GapCard from 'src/Pages/Plan/components/PlanFact/renderers/GapCard.jsx';
import { getComparisonXP } from 'src/Pages/Plan/components/PlanFact/utils/xpUtils.js';
import { getTodayDateString } from 'src/shared/utils/time.js';

export default function FactColumn({
  todayXP,
  xpData,
  viewMode,
  factCards,
  setXpPopupTaskId,
  projects,
  selectedDay
}) {
  // Render fact column in overview mode with unaccounted time as grey cards (>=15m) and as red text (<15m)
  const renderFactColumnOverview = () => {
    const cards = [];
    for (let i = factCards.length - 1; i >= 0; i--) {
      const item = factCards[i];
      if (item.unaccounted != null && item.unaccounted >= 15) {
        cards.push(
          <GapCard key={`fact-gap-${i}`} minutes={Math.round(item.unaccounted)} viewMode={viewMode} />
        );
      }
      const showUnaccountedInline = item.unaccounted != null && item.unaccounted > 0 && item.unaccounted < 15;
      cards.push(
        <TaskCard key={item.id} item={{ ...item, showUnaccountedInline }} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />
      );
    }
    return cards.reverse();
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3>Fact</h3>
        <div className="column-header-actions">
          <button className="add-button" style={{ cursor: 'default', background: 'white', color: '#374151' }}>
            {(() => {
              const comp = getComparisonXP(todayXP, xpData);
              const todayXPColor = comp ? '#dc2626' : '#059669'; // red if comp exists, green otherwise
              const compXPColor = '#059669'; // same as .card-text-xp-bottom
              const compLabelColor = '#374151'; // button text color
              const isToday = selectedDay === getTodayDateString();
              return (
                <>
                  <span style={{ color: todayXPColor }}>{todayXP} XP</span>
                  {comp && isToday ? (
                    <span>
                      <span style={{ color: compXPColor }}>&nbsp;/&nbsp;{comp.value} XP </span>
                      <span style={{ color: compLabelColor }} className="xp-compare-label">({comp.label})</span>
                    </span>
                  ) : null}
                </>
              );
            })()}
          </button>
        </div>
      </div>
      {factCards.length === 0 && <div className="no-items-message">No completed tasks</div>}
      {viewMode === 'overview' ? renderFactColumnOverview() : factCards.map((item) => <TaskCard key={item.id} item={item} isPlan={false} viewMode={viewMode} onClick={() => setXpPopupTaskId(item.id)} projects={projects} />)}
    </div>
  );
} 