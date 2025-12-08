const pool = require('../config/db');

async function getProjectPatterns() {
  try {
    const [rows] = await pool.query(
      'SELECT id, project_title, keywords, modules_json, total_price, is_student FROM project_patterns'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching project patterns:', error);
    return [];
  }
}

async function saveProjectPattern(projectTitle, description, modules, totalPrice, keywords, isStudent = false) {
  try {
    const [result] = await pool.query(
      'INSERT INTO project_patterns (project_title, project_description, modules_json, total_price, keywords, is_student) VALUES (?, ?, ?, ?, ?, ?)',
      [projectTitle, description, JSON.stringify(modules), totalPrice, keywords.join(','), isStudent]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error saving project pattern:', error);
    throw error;
  }
}

async function saveQuotation(projectTitle, modules, totalPrice, quotationText, isStudent = false) {
  try {
    const [result] = await pool.query(
      'INSERT INTO quotations (project_title, modules_json, total_price, quotation_text, is_student) VALUES (?, ?, ?, ?, ?)',
      [projectTitle, JSON.stringify(modules), totalPrice, quotationText, isStudent]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error saving quotation:', error);
    throw error;
  }
}

async function getQuotations() {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return [];
  }
}

async function getQuotationById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return null;
  }
}

async function updateQuotationStatus(id, status) {
  try {
    await pool.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    return true;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return false;
  }
}

module.exports = {
  getProjectPatterns,
  saveProjectPattern,
  saveQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus
};
