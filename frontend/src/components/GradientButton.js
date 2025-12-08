import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function GradientButton({ 
  children, 
  loading = false, 
  variant = 'primary', 
  sx = {}, 
  ...props 
}) {
  const gradients = {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
    secondary: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
    warning: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #ef4444 100%)',
  };

  const shadowColors = {
    primary: 'rgba(99, 102, 241, 0.4)',
    secondary: 'rgba(236, 72, 153, 0.4)',
    success: 'rgba(16, 185, 129, 0.4)',
    warning: 'rgba(239, 68, 68, 0.4)',
  };

  return (
    <Button
      disabled={loading || props.disabled}
      sx={{
        background: gradients[variant] || gradients.primary,
        backgroundSize: '200% 200%',
        color: 'white',
        fontWeight: 600,
        px: 4,
        py: 1.5,
        borderRadius: 3,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          animation: `${shimmer} 2s ease infinite`,
          transform: 'translateY(-2px)',
          boxShadow: `0 10px 30px ${shadowColors[variant] || shadowColors.primary}`,
        },
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s ease',
        },
        '&:hover::before': {
          left: '100%',
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}

export default GradientButton;
