import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Fade, InputAdornment, IconButton, Tooltip, Alert
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DatasetIcon from '@mui/icons-material/Dataset';
import WarningIcon from '@mui/icons-material/Warning';
import { getPricingData, addPricingEntry, updatePricingEntry, deletePricingEntry } from '../api';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import LoadingScreen from './LoadingScreen';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const initialFormState = {
  moduleName: '',
  complexityLevel: 'simple',
  basePrice: '',
  studentPrice: '',
  description: ''
};

function PricingTab() {
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      const data = await getPricingData();
      setPricingData(data);
    } catch (err) {
      console.error('Failed to fetch pricing data:', err);
      setError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const handleOpenDialog = (entry = null) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        moduleName: entry.module_name,
        complexityLevel: entry.complexity_level,
        basePrice: entry.base_price,
        studentPrice: entry.student_price,
        description: entry.description || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.moduleName || !formData.basePrice || !formData.studentPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updatePricingEntry(editingId, formData);
      } else {
        await addPricingEntry(formData);
      }
      handleCloseDialog();
      fetchPricingData();
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deletePricingEntry(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchPricingData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete entry');
    } finally {
      setSaving(false);
    }
  };

  const getLevelStyle = (level) => {
    const styles = {
      simple: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'rgba(16, 185, 129, 0.5)' },
      medium: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.5)' },
      complex: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.5)' },
    };
    return styles[level] || styles.simple;
  };

  if (loading) {
    return <LoadingScreen message="Loading pricing data..." fullScreen={false} />;
  }

  return (
    <Box sx={{ animation: `${slideUp} 0.5s ease` }}>
      <GlassCard sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <DatasetIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                Pricing Dataset
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {pricingData.length} module{pricingData.length !== 1 ? 's' : ''} configured
              </Typography>
            </Box>
          </Box>
          <GradientButton onClick={() => handleOpenDialog()}>
            <AddIcon sx={{ mr: 1 }} />
            Add Entry
          </GradientButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Module Name</TableCell>
                <TableCell sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Complexity</TableCell>
                <TableCell align="right" sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Regular Price</TableCell>
                <TableCell align="right" sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Student Price</TableCell>
                <TableCell sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ background: 'rgba(15, 15, 35, 0.95)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricingData.map((item, index) => {
                const levelStyle = getLevelStyle(item.complexity_level);
                return (
                  <Fade in timeout={100 + index * 30} key={item.id}>
                    <TableRow sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: 'white', fontWeight: 500 }}>{item.module_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.complexity_level}
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
                      <TableCell align="right" sx={{ color: '#6366f1', fontWeight: 600 }}>
                        RM {parseFloat(item.base_price).toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#10b981', fontWeight: 600 }}>
                        RM {parseFloat(item.student_price).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(item)}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(item.id)}
                              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </Fade>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
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
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          {editingId ? 'Edit Pricing Entry' : 'Add Pricing Entry'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Module Name *"
            value={formData.moduleName}
            onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
            sx={{ mt: 2, mb: 2, ...inputStyles }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Complexity Level</InputLabel>
            <Select
              value={formData.complexityLevel}
              label="Complexity Level"
              onChange={(e) => setFormData({ ...formData, complexityLevel: e.target.value })}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
              }}
            >
              <MenuItem value="simple">Simple</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="complex">Complex</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Regular Price *"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5)' }}>RM</InputAdornment>,
            }}
            sx={{ mb: 2, ...inputStyles }}
          />
          <TextField
            fullWidth
            label="Student Price *"
            type="number"
            value={formData.studentPrice}
            onChange={(e) => setFormData({ ...formData, studentPrice: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5)' }}>RM</InputAdornment>,
            }}
            sx={{ mb: 2, ...inputStyles }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={inputStyles}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <GradientButton onClick={handleCloseDialog} variant="secondary" sx={{ mr: 1 }}>
            Cancel
          </GradientButton>
          <GradientButton onClick={handleSave} loading={saving}>
            {editingId ? 'Update' : 'Add'} Entry
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.95), rgba(20, 20, 40, 0.95))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#ef4444' }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete this pricing entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <GradientButton onClick={() => setDeleteDialogOpen(false)} variant="secondary" sx={{ mr: 1 }}>
            Cancel
          </GradientButton>
          <GradientButton onClick={handleDelete} loading={saving} variant="warning">
            Delete
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
};

export default PricingTab;
