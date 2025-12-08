const pool = require('../config/db');

async function getPriceForModule(moduleName, complexityLevel, isStudent = false) {
  const priceColumn = isStudent ? 'student_price' : 'base_price';
  
  try {
    // Try exact match first
    let [rows] = await pool.query(
      `SELECT ${priceColumn} as price FROM pricing_dataset WHERE LOWER(module_name) = LOWER(?) AND complexity_level = ?`,
      [moduleName, complexityLevel]
    );

    if (rows.length > 0) {
      return rows[0].price;
    }

    // Try partial match
    [rows] = await pool.query(
      `SELECT ${priceColumn} as price FROM pricing_dataset WHERE LOWER(module_name) LIKE LOWER(?) AND complexity_level = ?`,
      [`%${moduleName}%`, complexityLevel]
    );

    if (rows.length > 0) {
      return rows[0].price;
    }

    // Default pricing based on complexity (MYR)
    // Student: RM350-1100 range, Regular: RM650-3500 range
    const defaultPrices = isStudent 
      ? { simple: 40, medium: 90, complex: 165 }
      : { simple: 85, medium: 190, complex: 380 };

    return defaultPrices[complexityLevel] || (isStudent ? 70 : 150);
  } catch (error) {
    console.error('Pricing lookup error:', error);
    return isStudent ? 75 : 150;
  }
}

async function calculateProjectPrice(modules, isStudent = false) {
  const pricedModules = [];
  let total = 0;

  for (const module of modules) {
    const price = await getPriceForModule(module.name, module.level, isStudent);
    pricedModules.push({
      name: module.name,
      level: module.level,
      description: module.description || '',
      price: parseFloat(price)
    });
    total += parseFloat(price);
  }

  return { modules: pricedModules, total };
}

async function getAllPricingData() {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing_dataset ORDER BY module_name, complexity_level');
    return rows;
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return [];
  }
}

async function addPricingEntry(moduleName, complexityLevel, basePrice, studentPrice, description) {
  try {
    const [result] = await pool.query(
      'INSERT INTO pricing_dataset (module_name, complexity_level, base_price, student_price, description) VALUES (?, ?, ?, ?, ?)',
      [moduleName, complexityLevel, basePrice, studentPrice, description]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error adding pricing entry:', error);
    throw error;
  }
}

async function getPricingEntryById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing_dataset WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching pricing entry:', error);
    return null;
  }
}

async function updatePricingEntry(id, moduleName, complexityLevel, basePrice, studentPrice, description) {
  try {
    const [result] = await pool.query(
      'UPDATE pricing_dataset SET module_name = ?, complexity_level = ?, base_price = ?, student_price = ?, description = ? WHERE id = ?',
      [moduleName, complexityLevel, basePrice, studentPrice, description, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating pricing entry:', error);
    throw error;
  }
}

async function deletePricingEntry(id) {
  try {
    const [result] = await pool.query('DELETE FROM pricing_dataset WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting pricing entry:', error);
    throw error;
  }
}

module.exports = { 
  getPriceForModule, 
  calculateProjectPrice, 
  getAllPricingData, 
  addPricingEntry,
  getPricingEntryById,
  updatePricingEntry,
  deletePricingEntry
};
