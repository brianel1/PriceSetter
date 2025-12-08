import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

function LoadingScreen({ message = 'Loading...', fullScreen = true }) {
  return (
    <Box
      sx={{
        ...(fullScreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
          zIndex: 9999,
        } : {
          py: 8,
        }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated circles */}
      <Box sx={{ position: 'relative', width: 120, height: 120, mb: 4 }}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '3px solid transparent',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: `${rotate} 1s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            border: '3px solid transparent',
            borderTopColor: '#ec4899',
            borderRadius: '50%',
            animation: `${rotate} 0.8s linear infinite reverse`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '60%',
            height: '60%',
            top: '20%',
            left: '20%',
            border: '3px solid transparent',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: `${rotate} 0.6s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 40,
            height: 40,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src="/logo_em.png"
            alt="Loading"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'contain',
              animation: `${pulse} 1s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>
      
      <Typography
        variant="h6"
        sx={{
          background: 'linear-gradient(90deg, #6366f1, #ec4899, #6366f1)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient 2s linear infinite',
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% center' },
            '100%': { backgroundPosition: '200% center' },
          },
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingScreen;
