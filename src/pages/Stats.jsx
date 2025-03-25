import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

function Stats() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Statistics content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Stats; 