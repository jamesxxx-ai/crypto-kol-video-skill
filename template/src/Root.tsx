import React from 'react';
import {Composition, Still} from 'remotion';
import {Main} from './Main';
import {Cover} from './cover';
import tl from './timeline.json';
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={(tl as any).total} fps={30} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
