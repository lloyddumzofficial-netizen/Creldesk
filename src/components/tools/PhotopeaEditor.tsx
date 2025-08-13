import React from 'react';
import { Card } from '../ui/Card';

export const PhotopeaEditor: React.FC = () => {
  return (
    <div className="h-full">
      <Card className="h-full p-0 overflow-hidden">
        <iframe
          src="https://www.photopea.com"
          className="w-full h-[800px] border-0"
          title="Photopea Editor"
          allow="camera; microphone; clipboard-read; clipboard-write"
        />
      </Card>
    </div>
  );
};