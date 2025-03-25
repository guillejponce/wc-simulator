import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

function Groups() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Group Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Group stage content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Groups; 