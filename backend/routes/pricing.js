const express = require('express');
const router = express.Router();
const { analyzeProject, checkSimilarity } = require('../services/openaiService');
const { calculateProjectPrice, getAllPricingData, addPricingEntry, getPricingEntryById, updatePricingEntry, deletePricingEntry } = require('../services/pricingService');
const { getProjectPatterns, saveProjectPattern, saveQuotation, getQuotations, getQuotationById, updateQuotationStatus } = require('../services/projectService');

function generateQuotationTemplate(projectTitle, modules, total, summary, date, isStudent) {
  const clientType = isStudent ? 'STUDENT' : 'REGULAR';
  const moduleLines = modules.map((m, i) => 
    `${i + 1}. ${m.name.padEnd(30)} | ${m.level.padEnd(8)} | RM ${m.price.toFixed(2)}`
  ).join('\n');

  return `
================================================================================
                           PROJECT QUOTATION
================================================================================

Quotation Date: ${date}
Project Title:  ${projectTitle}
Client Type:    ${clientType}

--------------------------------------------------------------------------------
                              PROJECT SUMMARY
--------------------------------------------------------------------------------
${summary}

--------------------------------------------------------------------------------
                              MODULE BREAKDOWN
--------------------------------------------------------------------------------
#   Module Name                    | Level    | Price (MYR)
--------------------------------------------------------------------------------
${moduleLines}
--------------------------------------------------------------------------------
                                              TOTAL: RM ${total.toFixed(2)}
================================================================================

NOTES:
- All prices are in Malaysian Ringgit (MYR)
${isStudent ? '- Student discount has been applied\n' : ''}- Prices are estimates based on standard complexity levels
- Final pricing may vary based on specific requirements
- This quotation is valid for 30 days from the date above
- Payment terms: 50% upfront, 50% on completion

================================================================================
                         Thank you for your business!
================================================================================
`.trim();
}

// Analyze project and generate quotation
router.post('/analyze', async (req, res) => {
  try {
    const { requirement, isStudent } = req.body;

    if (!requirement || requirement.trim().length < 10) {
      return res.json({
        status: 'insufficient_info',
        modules: [],
        total: 0,
        summary: '',
        similar_project: false,
        required_details: ['Please provide a more detailed project description (at least 10 characters)'],
        quotation_template: ''
      });
    }

    // Step 1: Analyze with OpenAI
    const analysis = await analyzeProject(requirement);

    if (analysis.status === 'insufficient_info') {
      return res.json({
        status: 'insufficient_info',
        modules: [],
        total: 0,
        summary: analysis.summary || '',
        similar_project: false,
        required_details: analysis.required_details || ['Please provide more details about the project'],
        quotation_template: ''
      });
    }

    // Step 2: Calculate prices from database (with student flag)
    const { modules: pricedModules, total } = await calculateProjectPrice(analysis.modules, isStudent === true);

    // Step 3: Check for similar projects
    const existingProjects = await getProjectPatterns();
    const similarityResult = await checkSimilarity(analysis.keywords || [], existingProjects);

    // Step 4: Generate quotation template
    const projectTitle = analysis.summary?.split('.')[0] || 'Untitled Project';
    const date = new Date().toLocaleDateString('en-MY', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const quotationTemplate = generateQuotationTemplate(
      projectTitle,
      pricedModules,
      total,
      analysis.summary,
      date,
      isStudent === true
    );

    // Step 5: Return JSON response
    const response = {
      status: 'ok',
      modules: pricedModules,
      total,
      summary: analysis.summary,
      similar_project: similarityResult.similar || false,
      matched_project_id: similarityResult.matchedProjectId || null,
      required_details: [],
      quotation_template: quotationTemplate,
      keywords: analysis.keywords || [],
      isStudent: isStudent === true
    };

    res.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      modules: [],
      total: 0
    });
  }
});

// Save quotation
router.post('/quotations', async (req, res) => {
  try {
    const { projectTitle, modules, total, quotationText, isStudent } = req.body;
    const id = await saveQuotation(projectTitle, modules, total, quotationText, isStudent);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all quotations
router.get('/quotations', async (req, res) => {
  try {
    const quotations = await getQuotations();
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single quotation
router.get('/quotations/:id', async (req, res) => {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quotation status
router.patch('/quotations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await updateQuotationStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save project pattern
router.post('/patterns', async (req, res) => {
  try {
    const { projectTitle, description, modules, totalPrice, keywords, isStudent } = req.body;
    const id = await saveProjectPattern(projectTitle, description, modules, totalPrice, keywords, isStudent);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pricing dataset
router.get('/pricing-data', async (req, res) => {
  try {
    const data = await getAllPricingData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add pricing entry
router.post('/pricing-data', async (req, res) => {
  try {
    const { moduleName, complexityLevel, basePrice, studentPrice, description } = req.body;
    const id = await addPricingEntry(moduleName, complexityLevel, basePrice, studentPrice, description);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single pricing entry
router.get('/pricing-data/:id', async (req, res) => {
  try {
    const entry = await getPricingEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Pricing entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pricing entry
router.put('/pricing-data/:id', async (req, res) => {
  try {
    const { moduleName, complexityLevel, basePrice, studentPrice, description } = req.body;
    const success = await updatePricingEntry(req.params.id, moduleName, complexityLevel, basePrice, studentPrice, description);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Pricing entry not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete pricing entry
router.delete('/pricing-data/:id', async (req, res) => {
  try {
    const success = await deletePricingEntry(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Pricing entry not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
