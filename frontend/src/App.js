import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Tabs, Tab, IconButton, Fade,
  BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme
} from '@mui/material';
import { keyframes } from '@mui/system';
import LogoutIcon from '@mui/icons-material/Logout';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DatasetIcon from '@mui/icons-material/Dataset';
import AnalyzeTab from './components/AnalyzeTab';
import QuotationsTab from './components/QuotationsTab';
import PricingTab from './components/PricingTab';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import AnimatedBackground from './components/AnimatedBackground';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

function App() {
  const [tab, setTab] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('pricer_token');
      if (token) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem('pricer_token');
      localStorage.removeItem('pricer_user');
      setIsAuthenticated(false);
      setLoading(false);
    }, 800);
  };

  const handleTabChange = (event, newValue) => {
    setTabLoading(true);
    setTimeout(() => {
      setTab(newValue);
      setTabLoading(false);
    }, 300);
  };

  if (loading) {
    return <LoadingScreen message={isAuthenticated ? 'Loading dashboard...' : 'Initializing...'} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AnimatedBackground />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Box sx={{ minHeight: '100vh', position: 'relative', zIndex: 1, pb: isMobile ? 8 : 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            animation: `${fadeIn} 0.5s ease`,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src="/logo_em.png"
                  alt="EchoMedia"
                  sx={{
                    width: { xs: 35, md: 45 },
                    height: { xs: 35, md: 45 },
                    borderRadius: 2,
                    objectFit: 'contain',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                  }}
                />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    PricerSetter
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    by EchoMedia
                  </Typography>
                </Box>
              </Box>

              {/* Desktop Tabs */}
              {!isMobile && (
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  sx={{
                    ml: 'auto',
                    mr: 2,
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 500,
                      minHeight: 60,
                      '&.Mui-selected': {
                        color: '#fff',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                      height: 3,
                      borderRadius: 2,
                    },
                  }}
                >
                  <Tab icon={<AnalyticsIcon />} label="Analyze" iconPosition="start" />
                  <Tab icon={<ReceiptLongIcon />} label="Quotations" iconPosition="start" />
                  <Tab icon={<DatasetIcon />} label="Pricing" iconPosition="start" />
                </Tabs>
              )}

              {/* Mobile: Page Title */}
              {isMobile && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    ml: 'auto',
                    mr: 2,
                    fontWeight: 600,
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {tab === 0 ? 'Analyze' : tab === 1 ? 'Quotations' : 'Pricing'}
                </Typography>
              )}

              {/* Logout */}
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  ml: isMobile ? 0 : 'auto',
                  '&:hover': {
                    color: '#ec4899',
                    background: 'rgba(236, 72, 153, 0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Container>
        </Box>

        {/* Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          {tabLoading ? (
            <LoadingScreen message="Loading..." fullScreen={false} />
          ) : (
            <Fade in={!tabLoading} timeout={500}>
              <Box>
                {tab === 0 && <AnalyzeTab />}
                {tab === 1 && <QuotationsTab />}
                {tab === 2 && <PricingTab />}
              </Box>
            </Fade>
          )}
        </Container>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <BottomNavigation
            value={tab}
            onChange={handleTabChange}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              height: 70,
              zIndex: 100,
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(255,255,255,0.5)',
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: '#6366f1',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                mt: 0.5,
                '&.Mui-selected': {
                  fontSize: '0.7rem',
                },
              },
            }}
          >
            <BottomNavigationAction label="Analyze" icon={<AnalyticsIcon />} />
            <BottomNavigationAction label="Quotations" icon={<ReceiptLongIcon />} />
            <BottomNavigationAction label="Pricing" icon={<DatasetIcon />} />
          </BottomNavigation>
        )}
      </Box>
    </>
  );
}

export default App;
