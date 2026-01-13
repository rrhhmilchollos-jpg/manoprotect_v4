import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import HowItWorks from '@/pages/HowItWorks';
import FamilyMode from '@/pages/FamilyMode';
import Contacts from '@/pages/Contacts';
import Profile from '@/pages/Profile';
import Knowledge from '@/pages/Knowledge';
import Community from '@/pages/Community';
import Pricing from '@/pages/Pricing';
import Downloads from '@/pages/Downloads';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/family-mode" element={<FamilyMode />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/community" element={<Community />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;