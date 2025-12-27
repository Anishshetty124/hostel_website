import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// DIRECT IMPORTS (No Lazy Loading = No Crashes)
import UserLayout from './components/layouts/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import MyRoom from './pages/user/MyRoom';
import FoodMenu from './pages/user/FoodMenu';
import Gallery from './pages/user/Gallery';
import Laundry from './pages/user/Laundry';
import Complaints from './pages/user/Complaints';
import Games from './pages/user/Games';

// Admin Imports
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect Root to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Navigate to="/dashboard" />} />

        {/* USER ROUTES */}
        <Route path="/dashboard" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="rooms" element={<MyRoom />} />
          <Route path="food" element={<FoodMenu />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="laundry" element={<Laundry />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="games" element={<Games />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<ManageRooms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;