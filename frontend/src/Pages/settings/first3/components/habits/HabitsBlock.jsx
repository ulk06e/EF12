import React, { useState, useEffect } from 'react';
import AddHabitPopup from './Popups/AddHabitPopup';
import { getLocalHabits, setLocalHabits, getLocalSettings, setLocalSettings } from '../../shared/localDb';
import { API_URL } from 'src/config/api';
import HabitPopup from 'src/pages/settings/first3/components/habits/Popups/HabitPopup.jsx';
import { updateSettings, fetchSettings } from 'src/pages/settings/first3/api/daily_basics';

export default function HabitsBlock({ addOpen, setAddOpen }) {
  // Placeholder for habits state
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitPopupOpen, setHabitPopupOpen] = useState(false);
  const [addMode, setAddMode] = useState(true); // true for add, false for edit
  const [editHabit, setEditHabit] = useState(null);

  useEffect(() => {
    async function fetchAllHabits() {
      try {
        // Fetch settings from backend
        const settings = await fetchSettings();
        const habits = settings.habits || [];
        setHabits(habits);
        setLocalHabits(habits);
        setLocalSettings(settings);
      } catch (e) {
        // fallback to localDb if backend fails
        const habits = getLocalHabits();
        setHabits(habits);
      } finally {
        setLoading(false);
      }
    }
    fetchAllHabits();
  }, []);

  // Add this async function for posting a new habit
  async function handleAddHabit(habit) {
    try {
      // Get current settings
      const settings = getLocalSettings();
      // Assign a new id if not present
      const newHabit = { ...habit, id: habit.id || Date.now() };
      const newHabits = [...(settings.habits || []), newHabit];
      const newSettings = { ...settings, habits: newHabits };
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings(newSettings);
      await updateSettings(newSettings);
      setAddOpen(false);
    } catch (e) {
      // fallback: add locally if backend fails
      const settings = getLocalSettings();
      const newHabit = { ...habit, id: habit.id || Date.now() };
      const newHabits = [...(settings.habits || []), newHabit];
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings({ ...settings, habits: newHabits });
      setAddOpen(false);
    }
  }

  async function handleEditHabit(editedHabit) {
    try {
      const settings = getLocalSettings();
      const newHabits = (settings.habits || []).map(h => h.id === editedHabit.id ? editedHabit : h);
      const newSettings = { ...settings, habits: newHabits };
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings(newSettings);
      await updateSettings(newSettings);
    } catch (e) {
      // fallback: update locally if backend fails
      const settings = getLocalSettings();
      const newHabits = (settings.habits || []).map(h => h.id === editedHabit.id ? editedHabit : h);
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings({ ...settings, habits: newHabits });
    }
    setHabitPopupOpen(false);
  }

  async function handleDeleteHabit(habitToDelete) {
    try {
      const settings = getLocalSettings();
      const newHabits = (settings.habits || []).filter(h => h.id !== habitToDelete.id);
      const newSettings = { ...settings, habits: newHabits };
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings(newSettings);
      await updateSettings(newSettings);
    } catch (e) {
      // fallback: delete locally if backend fails
      const settings = getLocalSettings();
      const newHabits = (settings.habits || []).filter(h => h.id !== habitToDelete.id);
      setHabits(newHabits);
      setLocalHabits(newHabits);
      setLocalSettings({ ...settings, habits: newHabits });
    }
    setHabitPopupOpen(false);
  }

  function openAddPopup() {
    setAddMode(true);
    setEditHabit(null);
    setAddOpen(true);
  }

  function openEditPopup(habit) {
    setAddMode(false);
    setEditHabit(habit);
    setAddOpen(true);
  }

  async function handleSubmitHabit(habit) {
    if (addMode) {
      await handleAddHabit(habit);
    } else {
      await handleEditHabit(habit);
    }
    setAddOpen(false);
  }

  return (
    <>
      {loading ? (
        <div className="no-items-message">Loading...</div>
      ) : habits.length === 0 ? (
        <div className="no-items-message">No habits yet</div>
      ) : (
        habits.map(habit => (
          <div className="card-relative" key={habit.id} onDoubleClick={() => {
            setSelectedHabit(habit);
            setHabitPopupOpen(true);
          }}>
            <div className="card-content time-block-row">
              <span>{habit.description}</span>
            </div>
          </div>
        ))
      )}
      <AddHabitPopup
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleSubmitHabit}
        mode={addMode ? 'add' : 'edit'}
        initialHabit={editHabit}
      />
      <HabitPopup
        open={habitPopupOpen}
        onClose={() => setHabitPopupOpen(false)}
        habit={selectedHabit}
        onEdit={handleEditHabit}
        onDelete={handleDeleteHabit}
      />
    </>
  );
} 