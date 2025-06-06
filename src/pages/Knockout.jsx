import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

function Knockout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Knockout Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Knockout stage content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Knockout; 