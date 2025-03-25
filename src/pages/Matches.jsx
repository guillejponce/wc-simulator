import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

function Matches() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Matches content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Matches; 