import React from 'react';
import {Composition} from 'remotion';
import {IraAiRace} from './Video';

export const Root: React.FC = () => (
  <Composition
    id="IraAiRace"
    component={IraAiRace}
    durationInFrames={2400}
    fps={30}
    width={1080}
    height={1920}
  />
);
