/**
 * App Entry Point
 * React Router setup — Universal Jobs Model
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApiAuthProvider } from '@/components/ApiAuthProvider';
import { Layout } from '@/components/layout/Layout';
import { CreatePage } from '@/pages/CreatePage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { PricingPage } from '@/pages/PricingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ApiAuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CreatePage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ApiAuthProvider>
    </BrowserRouter>
  );
}

export default App;
