import React, { useState, useEffect } from 'react';
import '../../../Plan/shared/Column.css';
import '../../../Plan/shared/Card.css';
import './TimespanBlock.css';
import AddTimeBlockPopup from './AddTimeBlockPopup';
import TimeBlockPopup from './TimeBlockPopup';
import { fetchSettings, updateSettings } from './tapi';
import { getLocalSettings, setLocalSettings } from 'src/Pages/Plan/cache/localDb'; 

export default function TimespanBlock({ addOpen, setAddOpen }) {
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockPopupOpen, setBlockPopupOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSettings()
      .then(data => {
        setTimeBlocks(data.time_blocks || []);
        setLocalSettings(data);
      })
      .catch(err => { console.error(err); setTimeBlocks([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleAddTimeBlock = async (block) => {
    const settings = getLocalSettings();
    const newBlocks = [...(settings.time_blocks || []), block];
    const newSettings = { ...settings, time_blocks: newBlocks };
    setTimeBlocks(newBlocks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
    } catch (err) {
      console.error(err);
    }
    setAddOpen(false);
  };

  const handleEditBlock = async (editedBlock) => {
    const settings = getLocalSettings();
    const newBlocks = (settings.time_blocks || []).map(b => b.id === editedBlock.id ? editedBlock : b);
    const newSettings = { ...settings, time_blocks: newBlocks };
    setTimeBlocks(newBlocks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
    } catch (err) {
      console.error(err);
    }
    setBlockPopupOpen(false);
  };

  const handleDeleteBlock = async (blockToDelete) => {
    const settings = getLocalSettings();
    const newBlocks = (settings.time_blocks || []).filter(b => b.id !== blockToDelete.id);
    const newSettings = { ...settings, time_blocks: newBlocks };
    setTimeBlocks(newBlocks);
    setLocalSettings(newSettings);
    try {
      await updateSettings({ ...newSettings });
    } catch (err) {
      console.error(err);
    }
    setBlockPopupOpen(false);
  };

  return (
    <>
      {loading ? (
        <div className="no-items-message">Loading...</div>
      ) : timeBlocks.length === 0 ? (
        <div className="no-items-message">No time blocks yet</div>
      ) : (
        [...timeBlocks].sort((a, b) => (a.start || '').localeCompare(b.start || '')).map((block) => (
          <div
            className="card-relative"
            key={block.id}
            onDoubleClick={() => { setSelectedBlock(block); setBlockPopupOpen(true); }}
          >
            <div className="card-content time-block-row">
              <span>{block.name}</span>
              <span>{block.start} - {block.end}</span>
            </div>
          </div>
        ))
      )}
      <AddTimeBlockPopup open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddTimeBlock} />
      <TimeBlockPopup
        open={blockPopupOpen}
        onClose={() => setBlockPopupOpen(false)}
        timeBlock={selectedBlock}
        onEdit={handleEditBlock}
        onDelete={handleDeleteBlock}
      />
    </>
  );
} 