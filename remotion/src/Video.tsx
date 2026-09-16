import React from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const C = {
  ink: '#07101b',
  navy: '#0b1727',
  cyan: '#5ee7ff',
  amber: '#ffb54a',
  red: '#ff5162',
  paper: '#eee7d9',
  white: '#f7fbff',
};

const presenterFiles = [
  'presenter/01.mp4',
  'presenter/02.mp4',
  'presenter/03.mp4',
  'presenter/04.mp4',
  'presenter/05.mp4',
  'presenter/06.mp4',
  'presenter/07.mp4',
  'presenter/08.mp4',
];

const fade = (frame: number, duration = 300) =>
  interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Label: React.FC<{children: React.ReactNode; color?: string; top?: number}> = ({
  children,
  color = C.cyan,
  top = 170,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        color: C.white,
        fontFamily: 'Arial, sans-serif',
        fontSize: 72,
        fontWeight: 900,
        lineHeight: 1.02,
        letterSpacing: -2,
        textShadow: '0 5px 24px #000',
        opacity: fade(frame),
        translate: `0 ${interpolate(frame, [0, 15], [40, 0], {extrapolateRight: 'clamp'})}px`,
      }}
    >
      <span style={{boxShadow: `inset 0 -18px 0 ${color}55`}}>{children}</span>
    </div>
  );
};

const SourceTag: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      left: 58,
      bottom: 62,
      right: 58,
      color: '#dce7f4',
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      lineHeight: 1.25,
      padding: '14px 20px',
      background: '#06101dcc',
      borderLeft: `5px solid ${C.cyan}`,
    }}
  >
    {children}
  </div>
);

const Paper: React.FC<{
  title: string;
  lines: string[];
  source: string;
  accent?: string;
}> = ({title, lines, source, accent = C.amber}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: '#06101dd9',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fade(frame),
      }}
    >
      <div
        style={{
          width: 820,
          minHeight: 980,
          padding: '76px 72px',
          background: C.paper,
          color: '#1a1a18',
          boxShadow: '0 30px 100px #000b',
          rotate: `${interpolate(frame, [0, 20], [-3, -1], {extrapolateRight: 'clamp'})}deg`,
          scale: interpolate(frame, [0, 20], [0.86, 1], {
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        <div style={{fontSize: 30, color: '#555', letterSpacing: 5}}>RESEARCH RECORD</div>
        <div style={{fontSize: 67, lineHeight: 1.03, fontWeight: 800, marginTop: 30}}>{title}</div>
        <div style={{width: 160, height: 8, background: accent, margin: '42px 0'}} />
        {lines.map((line) => (
          <div key={line} style={{fontSize: 39, lineHeight: 1.35, margin: '26px 0'}}>
            {line}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            bottom: 60,
            paddingTop: 18,
            borderTop: '2px solid #999',
            fontFamily: 'Arial, sans-serif',
            fontSize: 23,
            color: '#555',
          }}
        >
          SOURCE: {source}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const RiskCards: React.FC = () => {
  const frame = useCurrentFrame();
  const risks = [
    ['01', 'CYBER', 'Automated intrusion'],
    ['02', 'BIO', 'Research misuse'],
    ['03', 'POWER', 'Real-world control'],
  ];
  return (
    <AbsoluteFill style={{background: '#050b14e8', padding: '270px 64px 180px'}}>
      <div style={{fontFamily: 'Arial', color: C.white, fontSize: 66, fontWeight: 900}}>
        SUPERHUMAN SYSTEMS
      </div>
      <div style={{fontFamily: 'Arial', color: C.amber, fontSize: 31, marginTop: 18}}>
        COXON'S WARNING — NOT A FORECAST
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 32, marginTop: 100}}>
        {risks.map(([number, title, detail], i) => {
          const enter = interpolate(frame, [15 + i * 18, 35 + i * 18], [120, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          return (
            <div
              key={title}
              style={{
                height: 230,
                border: `2px solid ${i === 2 ? C.amber : C.cyan}88`,
                background: '#0b1727ee',
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                alignItems: 'center',
                padding: '0 42px',
                translate: `${enter}px 0`,
                fontFamily: 'Arial',
              }}
            >
              <div style={{fontSize: 68, color: i === 2 ? C.amber : C.cyan, fontWeight: 900}}>
                {number}
              </div>
              <div>
                <div style={{fontSize: 59, color: C.white, fontWeight: 900}}>{title}</div>
                <div style={{fontSize: 31, color: '#aebed0', marginTop: 10}}>{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 45, [0, 22, 44], [0.75, 1, 0.75]);
  return (
    <AbsoluteFill style={{background: '#06101de8', padding: '250px 70px 170px', fontFamily: 'Arial'}}>
      <div style={{color: C.white, fontSize: 74, fontWeight: 900}}>ONE COMPANY?</div>
      <div style={{display: 'flex', gap: 26, marginTop: 110}}>
        {[
          ['ANTHROPIC', 'MORE RESPONSIBLE', C.cyan],
          ['OPENAI', 'LESS RESPONSIBLE', C.amber],
        ].map(([name, note, color]) => (
          <div key={name} style={{flex: 1, background: '#0b1727', border: `3px solid ${color}`, padding: 36}}>
            <div style={{fontSize: 48, color, fontWeight: 900}}>{name}</div>
            <div style={{fontSize: 28, color: '#b9c6d4', marginTop: 28}}>{note}</div>
            <div style={{height: 16, background: '#1d2a3a', marginTop: 60}}>
              <div style={{width: name === 'ANTHROPIC' ? '72%' : '43%', height: '100%', background: color}} />
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign: 'center', color: C.red, fontSize: 70, fontWeight: 900, marginTop: 145, scale: pulse}}>
        THE PROBLEM IS COMPETITION
      </div>
      <SourceTag>Assessment attributed to Jacob Coxon; it is his comparison, not an independent ranking.</SourceTag>
    </AbsoluteFill>
  );
};

const RaceLoop: React.FC<{final?: boolean}> = ({final = false}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame % 90, [0, 90], [0, 1]);
  const bars = [0.9, 0.78, 0.66].map((n, i) => Math.min(1, n * progress + i * 0.12));
  return (
    <AbsoluteFill style={{background: '#050b14eb', padding: '230px 62px 160px', fontFamily: 'Arial'}}>
      <div style={{color: C.white, fontSize: final ? 77 : 68, fontWeight: 900, lineHeight: 1.02}}>
        {final ? 'WHO HITS THE BRAKE FIRST?' : 'THE RACE TRAP'}
      </div>
      <div style={{marginTop: 110, display: 'flex', flexDirection: 'column', gap: 58}}>
        {['LAB A', 'LAB B', 'LAB C'].map((lab, i) => (
          <div key={lab}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#dce7f4', fontSize: 32}}>
              <span>{lab}</span><span>POWER</span>
            </div>
            <div style={{height: 52, background: '#182435', marginTop: 15}}>
              <div
                style={{
                  height: '100%',
                  width: `${bars[i] * 100}%`,
                  background: i === 0 ? C.red : i === 1 ? C.amber : C.cyan,
                  boxShadow: `0 0 28px ${i === 0 ? C.red : i === 1 ? C.amber : C.cyan}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 125, borderTop: '2px solid #526477', paddingTop: 55, color: '#b9c6d4', fontSize: 37, lineHeight: 1.35}}>
        SLOW DOWN → FEAR FALLING BEHIND → SPEED UP → EVERYONE FEELS FORCED TO FOLLOW
      </div>
      {final && (
        <div style={{marginTop: 90, color: C.amber, fontSize: 60, fontWeight: 900, textAlign: 'center'}}>
          SAFETY NEEDS COORDINATION
        </div>
      )}
    </AbsoluteFill>
  );
};

const PresenterTimeline: React.FC = () => (
  <>
    {presenterFiles.map((src, i) => (
      <Sequence key={src} from={i * 300} durationInFrames={300} layout="absolute-fill">
        <Video
          src={staticFile(src)}
          durationInFrames={300}
          objectFit="cover"
          style={{width: '100%', height: '100%'}}
        />
      </Sequence>
    ))}
  </>
);

export const IraAiRace: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      <PresenterTimeline />
      <Audio src={staticFile('audio/ambient.wav')} volume={0.08} />

      <Sequence from={0} durationInFrames={150}>
        <Label color={C.red}>AI DANGEROUS… OR THE RACE?</Label>
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <Label color={C.amber}>COMPANIES. COMPETITION. CONTROL.</Label>
      </Sequence>

      <Sequence from={360} durationInFrames={145}>
        <AbsoluteFill style={{background: '#050b14'}}>
          <Img src={staticFile('images/jacob-coxon-approved.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(transparent 45%, #030811f2 90%)'}} />
          <div style={{position: 'absolute', left: 64, bottom: 190, color: C.white, fontFamily: 'Arial'}}>
            <div style={{fontSize: 74, fontWeight: 900}}>JACOB COXON</div>
            <div style={{fontSize: 32, color: C.cyan, marginTop: 14}}>FORMER OPENAI & ANTHROPIC RESEARCHER</div>
            <div style={{fontSize: 23, color: '#aebed0', marginTop: 25}}>AI-GENERATED RECONSTRUCTION</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={620} durationInFrames={120}>
        <Paper
          title="GPT-4o System Card"
          lines={['Contributors and evaluation credits', 'Jacob Coxon — listed contributor']}
          source="OpenAI GPT-4o System Card, 2024"
          accent={C.cyan}
        />
      </Sequence>
      <Sequence from={740} durationInFrames={120}>
        <Paper
          title="GPT-4.5 System Card"
          lines={['Training, evaluation and safety record', 'Jacob Coxon — listed contributor']}
          source="OpenAI GPT-4.5 System Card, Feb. 27, 2025"
        />
      </Sequence>

      <Sequence from={920} durationInFrames={225}><RiskCards /></Sequence>

      <Sequence from={1260} durationInFrames={160}>
        <Paper
          title="A WARNING — NOT PROOF"
          lines={['Some frontier-lab staff believe advanced AI could become an existential threat.', 'The claim remains disputed and unproven.']}
          source="Coxon’s public statement and 2026 interviews"
          accent={C.red}
        />
      </Sequence>
      <Sequence from={1420} durationInFrames={80}><Label color={C.cyan} top={1320}>WARNING ≠ PROVEN FACT</Label></Sequence>

      <Sequence from={1590} durationInFrames={170}><Comparison /></Sequence>
      <Sequence from={1870} durationInFrames={195}><RaceLoop /></Sequence>
      <Sequence from={2160} durationInFrames={240}><RaceLoop final /></Sequence>

      <div style={{position: 'absolute', top: 50, right: 54, color: '#ffffff70', fontFamily: 'Arial', fontSize: 22}}>
        IRA / AI RACE
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 8, width: `${(frame / 2399) * 100}%`, background: C.amber}} />
    </AbsoluteFill>
  );
};
