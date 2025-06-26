import React, { useState, useEffect } from 'react';
import '../../Plan/shared/Column.css';
import '../../Plan/shared/Card.css';
import './TimespanBlock.css';
import AddTimeBlockPopup from './AddTimeBlockPopup';
import TimeBlockPopup from './TimeBlockPopup';
import { fetchSettings, updateSettings } from './tapi';
import { setLocalTimeBlocks } from './localDb';

export default function TimespanBlock() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockPopupOpen, setBlockPopupOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSettings()
      .then(data => setTimeBlocks(data.time_blocks || []))
      .catch(err => { console.error(err); setTimeBlocks([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleAddTimeBlock = async (block) => {
    const newBlocks = [...timeBlocks, block];
    setTimeBlocks(newBlocks);
    setLocalTimeBlocks(newBlocks);
    try {
      await updateSettings({ time_blocks: newBlocks });
    } catch (err) {
      console.error(err);
    }
    setPopupOpen(false);
  };

  const handleEditBlock = async (editedBlock) => {
    const newBlocks = timeBlocks.map(b => b === selectedBlock ? editedBlock : b);
    setTimeBlocks(newBlocks);
    setLocalTimeBlocks(newBlocks);
    try {
      await updateSettings({ time_blocks: newBlocks });
    } catch (err) {
      console.error(err);
    }
    setBlockPopupOpen(false);
  };

  const handleDeleteBlock = async (blockToDelete) => {
    const newBlocks = timeBlocks.filter(b => b !== blockToDelete);
    setTimeBlocks(newBlocks);
    setLocalTimeBlocks(newBlocks);
    try {
      await updateSettings({ time_blocks: newBlocks });
    } catch (err) {
      console.error(err);
    }
    setBlockPopupOpen(false);
  };

  return (
    <div className="columns-container">
      <div className="column">
        <div className="column-header">
          <h3>Time Block</h3>
          <button className="add-button" onClick={() => setPopupOpen(true)}>Add</button>
        </div>
        {loading ? (
          <div className="no-items-message">Loading...</div>
        ) : timeBlocks.length === 0 ? (
          <div className="no-items-message">No time blocks yet</div>
        ) : (
          [...timeBlocks].sort((a, b) => (a.start || '').localeCompare(b.start || '')).map((block, idx) => (
            <div
              className="card-relative"
              key={idx}
              onDoubleClick={() => { setSelectedBlock(block); setBlockPopupOpen(true); }}
            >
              <div className="card-content time-block-row">
                <span style={{ fontWeight: 600 }}>{block.name}</span>
                <span>{block.start} - {block.end}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="column">
        <div className="column-header">
          <h3>Project</h3>
        </div>
      </div>
      <div className="column">
        <div className="column-header">
          <h3>Sub-project</h3>
        </div>
      </div>
      <AddTimeBlockPopup open={popupOpen} onClose={() => setPopupOpen(false)} onAdd={handleAddTimeBlock} />
      <TimeBlockPopup
        open={blockPopupOpen}
        onClose={() => setBlockPopupOpen(false)}
        timeBlock={selectedBlock}
        onEdit={handleEditBlock}
        onDelete={handleDeleteBlock}
      />
    </div>
  );
} 