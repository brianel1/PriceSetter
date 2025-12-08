import React, { useState } from 'react';
import { Box, TextField, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { keyframes } from '@mui/system';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalculateIcon from '@mui/icons-material/Calculate';
import { login } from '../api';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
`;

function LoginPage({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await login(code);
      if (result.success) {
        localStorage.setItem('pricer_token', result.token);
        onLogin(result.token);
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      setError('Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <GlassCard
        hover={false}
        sx={{
          p: 5,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src="/logo_em.png"
          alt="EchoMedia"
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            objectFit: 'contain',
            mx: 'auto',
            mb: 3,
            animation: `${float} 3s ease-in-out infinite, ${pulse} 2s ease-in-out infinite`,
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #fff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PricerSetter
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
          Enter your access code to continue
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showCode ? 'text' : 'password'}
            placeholder="Access Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCode(!showCode)}
                    edge="end"
                    sx={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {showCode ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
              '& input': {
                color: 'white',
              },
            }}
          />
          
          <GradientButton
            type="submit"
            loading={loading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </GradientButton>
        </form>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 4, display: 'block' }}>
          Powered by EchoMedia
        </Typography>
      </GlassCard>
    </Box>
  );
}

export default LoginPage;
