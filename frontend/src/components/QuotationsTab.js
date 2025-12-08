import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Grow, Fade
} from '@mui/material';
import { keyframes } from '@mui/system';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { getQuotations, updateQuotationStatus } from '../api';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import LoadingScreen from './LoadingScreen';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

function QuotationsTab() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await getQuotations();
      setQuotations(data);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleView = (quotation) => {
    setSelectedQuotation(quotation);
    setDialogOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuotationStatus(id, status);
      fetchQuotations();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDownloadPDF = async (quotation) => {
    setPdfLoading(quotation.id);
    try {
      const modules = typeof quotation.modules_json === 'string'
        ? JSON.parse(quotation.modules_json)
        : quotation.modules_json;

      await generateQuotationPDF({
        projectTitle: quotation.project_title,
        modules: modules,
        total: parseFloat(quotation.total_price),
        summary: '',
        isStudent: quotation.is_student
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setPdfLoading(null);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      approved: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'rgba(16, 185, 129, 0.5)' },
      rejected: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.5)' },
      draft: { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.5)' },
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return <LoadingScreen message="Loading quotations..." fullScreen={false} />;
  }

  return (
    <Box sx={{ animation: `${slideUp} 0.5s ease` }}>
      <GlassCard sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReceiptLongIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Saved Quotations
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </Box>

        {quotations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ReceiptLongIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              No quotations saved yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.2)' }}>
              Analyze a project to create your first quotation
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Project Title</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total (MYR)</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((q, index) => {
                  const statusStyle = getStatusStyle(q.status);
                  return (
                    <Fade in timeout={300 + index * 100} key={q.id}>
                      <TableRow sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>#{q.id}</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 500 }}>{q.project_title}</TableCell>
                        <TableCell>
                          {q.is_student ? (
                            <Chip
                              icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                              label="Student"
                              size="small"
                              sx={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.5)',
                              }}
                            />
                          ) : (
                            <Chip
                              label="Regular"
                              size="small"
                              sx={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.5)',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                          RM {parseFloat(q.total_price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={q.status}
                            size="small"
                            sx={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`,
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(q.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleView(q)}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPDF(q)}
                              disabled={pdfLoading === q.id}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)' } }}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(q.id, 'approved')}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' } }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(q.id, 'rejected')}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassCard>

      {/* View Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95), rgba(20, 20, 40, 0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>Quotation Details</DialogTitle>
        <DialogContent>
          {selectedQuotation && (
            <Box
              component="pre"
              sx={{
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#d4d4d4',
                p: 3,
                borderRadius: 2,
                overflow: 'auto',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {selectedQuotation.quotation_text}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <GradientButton
            variant="secondary"
            onClick={() => handleDownloadPDF(selectedQuotation)}
            disabled={pdfLoading === selectedQuotation?.id}
          >
            <PictureAsPdfIcon sx={{ mr: 1 }} />
            Download PDF
          </GradientButton>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QuotationsTab;
