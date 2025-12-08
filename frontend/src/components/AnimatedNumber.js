import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1000, decimals = 2 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        fontFamily: 'monospace',
        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </Typography>
  );
}

export default AnimatedNumber;
