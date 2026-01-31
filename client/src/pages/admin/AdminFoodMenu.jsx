import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AuthContext } from '../../context/AuthContext';

const AdminFoodMenu = () => {
  const { token } = useContext(AuthContext);
  // Removed date state, only permanent changes allowed
  // menuData is an object: { Monday: { breakfast: {...}, ... }, ... } (now: { Monday: { breakfast, lunch, snacks, nightmeal } })
  const [menuData, setMenuData] = useState({});
  // Set default selectedDay to today
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const [selectedDay, setSelectedDay] = useState(todayName);
  // Removed isPermanent state, only permanent changes allowed
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch current week menu from backend with token
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get('/api/food', { headers });
        // Convert array to object by day, using nested meals structure
        const weekObj = {};
        (res.data || []).forEach(dayMenu => {
          if (dayMenu.meals) {
            weekObj[dayMenu.day] = dayMenu.meals;
          }
        });
        setMenuData(weekObj);
      } catch (err) {
        setMenuData({});
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [token]);


  // Local state for editing meal items as string, to preserve cursor position
  const [mealInputs, setMealInputs] = useState({});

  useEffect(() => {
    // Sync mealInputs with menuData when selectedDay changes
    const newInputs = {};
    ['breakfast','lunch','snacks','nightmeal'].forEach(meal => {
      newInputs[meal] = menuData[selectedDay]?.[meal]?.items?.join(', ') || '';
    });
    setMealInputs(newInputs);
  }, [selectedDay, menuData]);


  const handleMealInputChange = (meal, value) => {
    setMealInputs(inputs => ({ ...inputs, [meal]: value }));
  };

  // Removed handleDateChange, only permanent changes allowed

  const handleMealInputBlur = (meal, value) => {
    setMenuData(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [meal]: {
          ...(prev[selectedDay]?.[meal] || {}),
          items: value.split(',').map(i => i.trim()).filter(Boolean)
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setSubmitting(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.post('/api/food/admin/update', {
        permanent: true,
        day: selectedDay,
        menu: menuData[selectedDay],
      }, { headers });
      setStatus('Menu updated successfully!');
    } catch (err) {
      setStatus('Error updating menu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading menu..." />;
  }
  if (submitting) {
    return <LoadingSpinner fullScreen message="Updating menu..." />;
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6 mt-8">
      {status && <div className={`mb-4 text-center font-semibold ${status.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{status}</div>}
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Change Food Menu</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Select Day</label>
          <select
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
          >
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        {['breakfast','lunch','snacks','nightmeal'].map(meal => (
          <div key={meal} className="border rounded-lg p-3 mb-2">
            <h3 className="font-bold capitalize mb-2">{meal}</h3>
            <div className="mb-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Current:</span>
              <span className="ml-2">{menuData[selectedDay]?.[meal]?.items?.join(', ') || <span className='italic text-gray-400'>No items</span>}</span>
            </div>
            <label className="block text-xs mb-1">New Items (comma separated)</label>
            <input
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={mealInputs[meal] || ''}
              onChange={e => handleMealInputChange(meal, e.target.value)}
              onBlur={e => handleMealInputBlur(meal, e.target.value)}
            />
          </div>
        ))}
        {/* Only permanent change allowed, removed checkbox and date input */}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Update Menu
        </button>
        {status && <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
      </form>
    </div>
  );
};

export default AdminFoodMenu;
