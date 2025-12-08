# PricerSetter - AI Project Quotation System

Internal tool for analyzing project requirements and generating quotations.

## Setup

### 1. Database (XAMPP MySQL)
1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Run the SQL script: `backend/config/schema.sql`

### 2. Backend
```bash
cd backend
npm install
# Edit .env and add your OpenAI API key
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## Usage
1. Open http://localhost:3000
2. Enter project requirements in the text area
3. Click "Analyze & Generate Quotation"
4. Review modules, pricing, and quotation template
5. Save quotation or export as text

## API Endpoints
- POST /api/analyze - Analyze project requirements
- GET/POST /api/quotations - Manage quotations
- GET/POST /api/pricing-data - Manage pricing dataset
- POST /api/patterns - Save project patterns
