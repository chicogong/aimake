/**
 * App Entry Point
 * React Router setup
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { PricingPage } from '@/pages/PricingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="pricing" element={<PricingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
