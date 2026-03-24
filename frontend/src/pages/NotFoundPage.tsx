/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">页面不存在</p>
      <Link to="/">
        <Button variant="outline" className="mt-6">
          返回首页
        </Button>
      </Link>
    </div>
  );
}
