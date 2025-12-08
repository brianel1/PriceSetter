import React, { useState } from 'react';
import {
  Box, TextField, Typography, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Divider, Grow, Zoom
} from '@mui/material';
import { keyframes } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { analyzeProject, saveQuotation, savePattern } from '../api';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import AnimatedNumber from './AnimatedNumber';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

function AnalyzeTab() {
  const [step, setStep] = useState(1);
  const [isStudent, setIsStudent] = useState(null);
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleClientTypeSelect = (type) => {
    setIsStudent(type === 'student');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setIsStudent(null);
    setResult(null);
    setRequirement('');
    setError('');
    setSaved(false);
  };

  const handleAnalyze = async () => {
    if (!requirement.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const data = await analyzeProject(requirement, isStudent);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze project');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || result.status !== 'ok') return;
    try {
      const projectTitle = result.summary?.split('.')[0] || 'Untitled Project';
      await saveQuotation({
        projectTitle,
        modules: result.modules,
        total: result.total,
        quotationText: result.quotation_template,
        isStudent
      });
      await savePattern({
        projectTitle,
        description: result.summary,
        modules: result.modules,
        totalPrice: result.total,
        keywords: result.keywords || [],
        isStudent
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save quotation');
    }
  };

  const handleExportPDF = async () => {
    if (!result || result.status !== 'ok') return;
    setPdfLoading(true);
    try {
      const projectTitle = result.summary?.split('.')[0] || 'Untitled Project';
      await generateQuotationPDF({
        projectTitle,
        modules: result.modules,
        total: result.total,
        summary: result.summary,
        isStudent
      });
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      simple: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'rgba(16, 185, 129, 0.5)' },
      medium: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.5)' },
      complex: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.5)' },
    };
    return colors[level] || colors.simple;
  };

  // Step 1: Client Type Selection
  if (step === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Grow in timeout={500}>
          <Box>
            <GlassCard sx={{ p: 5, maxWidth: 550, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <AutoAwesomeIcon sx={{ color: 'white', fontSize: 35 }} />
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                Select Client Type
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
                Choose the pricing tier for this project
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                {[
                  { type: 'student', icon: SchoolIcon, label: 'Student', desc: 'Discounted rates', color: '#10b981' },
                  { type: 'regular', icon: BusinessIcon, label: 'Regular', desc: 'Standard rates', color: '#6366f1' },
                ].map((item, index) => (
                  <Zoom in timeout={300 + index * 100} key={item.type}>
                    <Box
                      onClick={() => handleClientTypeSelect(item.type)}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: 160,
                        '&:hover': {
                          border: `2px solid ${item.color}`,
                          background: `${item.color}15`,
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 30px ${item.color}30`,
                        },
                      }}
                    >
                      <item.icon sx={{ fontSize: 50, color: item.color, mb: 1 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Zoom>
                ))}
              </Box>
            </GlassCard>
          </Box>
        </Grow>
      </Box>
    );
  }

  // Step 2: Project Requirements
  return (
    <Box sx={{ animation: `${slideUp} 0.5s ease` }}>
      <GlassCard sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            Project Requirements
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={isStudent ? <SchoolIcon /> : <BusinessIcon />}
              label={isStudent ? 'Student Pricing' : 'Regular Pricing'}
              sx={{
                background: isStudent ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: isStudent ? '#10b981' : '#6366f1',
                border: `1px solid ${isStudent ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.5)'}`,
                fontWeight: 600,
              }}
            />
            <GradientButton variant="secondary" onClick={handleBack} sx={{ py: 1, px: 2 }}>
              Change
            </GradientButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={5}
          placeholder="Describe your project requirements here... (e.g., I need an e-commerce website with user authentication, product catalog, shopping cart, payment integration, and admin panel)"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& textarea': { color: 'white' },
          }}
        />

        <GradientButton
          onClick={handleAnalyze}
          loading={loading}
          disabled={!requirement.trim()}
        >
          <AutoAwesomeIcon sx={{ mr: 1 }} />
          {loading ? 'Analyzing with AI...' : 'Analyze & Generate Quotation'}
        </GradientButton>
      </GlassCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
          {error}
        </Alert>
      )}

      {result?.status === 'insufficient_info' && (
        <Alert severity="warning" sx={{ mb: 3, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fcd34d' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>More information needed:</Typography>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            {result.required_details?.map((detail, i) => <li key={i}>{detail}</li>)}
          </ul>
        </Alert>
      )}

      {result?.status === 'ok' && (
        <Grow in timeout={500}>
          <Box>
            <GlassCard glow sx={{ p: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  Analysis Result
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isStudent && (
                    <Chip label="Student Rate" sx={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)' }} size="small" />
                  )}
                  {result.similar_project && (
                    <Chip label="Similar project found" sx={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.5)' }} size="small" />
                  )}
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                {result.summary}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Module</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Complexity</TableCell>
                      <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Price (MYR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.modules.map((module, index) => {
                      const levelStyle = getLevelColor(module.level);
                      return (
                        <TableRow key={index} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>{index + 1}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 500 }}>{module.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={module.level}
                              size="small"
                              sx={{
                                background: levelStyle.bg,
                                color: levelStyle.color,
                                border: `1px solid ${levelStyle.border}`,
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                            RM {module.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total */}
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Total Estimated Price
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  RM <AnimatedNumber value={result.total} />
                </Typography>
              </Box>
            </GlassCard>

            {/* Actions */}
            <GlassCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <GradientButton
                  variant="success"
                  onClick={handleSave}
                  disabled={saved}
                >
                  <SaveIcon sx={{ mr: 1 }} />
                  {saved ? 'Saved!' : 'Save Quotation'}
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  onClick={handleExportPDF}
                  loading={pdfLoading}
                >
                  <PictureAsPdfIcon sx={{ mr: 1 }} />
                  Download PDF
                </GradientButton>
              </Box>
            </GlassCard>
          </Box>
        </Grow>
      )}
    </Box>
  );
}

export default AnalyzeTab;
