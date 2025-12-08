import React from 'react';
import { Paper } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.4); }
`;

function GlassCard({ children, hover = true, glow: showGlow = false, sx = {}, ...props }) {
  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-4px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          },
        }),
        ...(showGlow && {
          animation: `${glow} 3s ease-in-out infinite`,
        }),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export default GlassCard;
