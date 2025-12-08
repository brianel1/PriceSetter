-- Drop and recreate database to fix tablespace issues
DROP DATABASE IF EXISTS pricer_setter;
CREATE DATABASE pricer_setter;
USE pricer_setter;

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default user will be created by setup script
-- Run: cd backend && npm install && node scripts/setup-user.js
-- Then copy the INSERT statement and run it in MySQL

-- Pricing dataset table (MYR currency)
-- Student complete system range: RM350-1100
-- Regular complete system range: RM650-3500
CREATE TABLE pricing_dataset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_name VARCHAR(255) NOT NULL,
  complexity_level ENUM('simple', 'medium', 'complex') NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  student_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project patterns table for similarity detection
CREATE TABLE project_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  project_description TEXT,
  modules_json JSON,
  total_price DECIMAL(10, 2),
  is_student BOOLEAN DEFAULT FALSE,
  keywords TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations table
CREATE TABLE quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  modules_json JSON,
  total_price DECIMAL(10, 2),
  is_student BOOLEAN DEFAULT FALSE,
  quotation_text TEXT,
  status ENUM('draft', 'approved', 'rejected') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Realistic pricing based on development complexity (MYR)
-- Factors: time required, technical difficulty, security concerns, third-party integrations
-- Student range: RM350-1100 | Regular range: RM650-3500

INSERT INTO pricing_dataset (module_name, complexity_level, base_price, student_price, description) VALUES

-- PAYMENT GATEWAY (HIGH COMPLEXITY - security critical, third-party APIs, compliance)
('Payment Gateway', 'simple', 250.00, 120.00, 'Single provider (FPX/card), basic checkout'),
('Payment Gateway', 'medium', 480.00, 220.00, 'Multiple providers, recurring payments, refunds'),
('Payment Gateway', 'complex', 850.00, 380.00, 'Multi-currency, subscriptions, invoicing, fraud detection'),

-- USER AUTHENTICATION (MEDIUM-HIGH - security critical)
('User Authentication', 'simple', 80.00, 40.00, 'Basic email/password login, registration'),
('User Authentication', 'medium', 180.00, 85.00, 'Social login, password recovery, email verification'),
('User Authentication', 'complex', 350.00, 160.00, 'OAuth2, 2FA, SSO, role-based access control'),

-- REAL-TIME FEATURES (HIGH COMPLEXITY - WebSocket, scaling challenges)
('Chat/Messaging', 'simple', 150.00, 70.00, 'Basic text messaging between users'),
('Chat/Messaging', 'medium', 320.00, 145.00, 'Real-time chat, file sharing, read receipts'),
('Chat/Messaging', 'complex', 580.00, 260.00, 'Group chat, video calls, encryption, typing indicators'),

('Real-time Notifications', 'simple', 100.00, 50.00, 'Basic push notifications'),
('Real-time Notifications', 'medium', 220.00, 100.00, 'WebSocket updates, in-app notifications'),
('Real-time Notifications', 'complex', 400.00, 180.00, 'Real-time dashboard, live updates, notification center'),

-- API INTEGRATION (MEDIUM-HIGH - third-party dependencies)
('API Integration', 'simple', 90.00, 45.00, 'Single REST API connection'),
('API Integration', 'medium', 200.00, 95.00, 'Multiple APIs, error handling, rate limiting'),
('API Integration', 'complex', 380.00, 170.00, 'Complex integrations, webhooks, data sync'),

-- E-COMMERCE (MEDIUM-HIGH - business logic complexity)
('E-commerce Cart', 'simple', 120.00, 55.00, 'Add to cart, quantity update, checkout flow'),
('E-commerce Cart', 'medium', 260.00, 120.00, 'Discounts, promo codes, wishlist, saved carts'),
('E-commerce Cart', 'complex', 450.00, 200.00, 'Multi-vendor, inventory management, shipping calc'),

('Product Catalog', 'simple', 80.00, 40.00, 'Basic product listing with images'),
('Product Catalog', 'medium', 170.00, 80.00, 'Categories, filters, variants, stock tracking'),
('Product Catalog', 'complex', 320.00, 145.00, 'Advanced search, recommendations, bulk import'),

-- ADMIN PANEL (MEDIUM - standard but time-consuming)
('Admin Panel', 'simple', 100.00, 50.00, 'Basic CRUD interface for data management'),
('Admin Panel', 'medium', 220.00, 100.00, 'User management, settings, activity logs'),
('Admin Panel', 'complex', 400.00, 180.00, 'Full CMS, permissions, analytics dashboard'),

-- DASHBOARD & REPORTS (MEDIUM - data visualization)
('Dashboard', 'simple', 70.00, 35.00, 'Basic statistics display, summary cards'),
('Dashboard', 'medium', 160.00, 75.00, 'Charts, graphs, date filters'),
('Dashboard', 'complex', 300.00, 135.00, 'Interactive widgets, real-time data, custom views'),

('Reports', 'simple', 80.00, 40.00, 'Basic data export, simple reports'),
('Reports', 'medium', 180.00, 85.00, 'PDF/Excel export, scheduled reports, charts'),
('Reports', 'complex', 340.00, 155.00, 'Custom report builder, analytics, data visualization'),

-- CRUD OPERATIONS (LOW-MEDIUM - foundational)
('CRUD Operations', 'simple', 50.00, 25.00, 'Basic create, read, update, delete'),
('CRUD Operations', 'medium', 110.00, 55.00, 'Validation, relationships, pagination'),
('CRUD Operations', 'complex', 200.00, 95.00, 'Complex queries, bulk operations, audit trail'),

-- FILE MANAGEMENT (MEDIUM - storage, processing)
('File Upload', 'simple', 60.00, 30.00, 'Basic single file upload'),
('File Upload', 'medium', 140.00, 65.00, 'Multiple files, image preview, validation'),
('File Upload', 'complex', 280.00, 125.00, 'Cloud storage, image processing, CDN integration'),

-- SEARCH (LOW-HIGH depending on complexity)
('Search', 'simple', 50.00, 25.00, 'Basic text search, simple filters'),
('Search', 'medium', 120.00, 55.00, 'Advanced filters, sorting, pagination'),
('Search', 'complex', 250.00, 115.00, 'Full-text search, autocomplete, faceted search'),

-- EMAIL/NOTIFICATIONS (LOW-MEDIUM)
('Email System', 'simple', 60.00, 30.00, 'Basic transactional emails'),
('Email System', 'medium', 140.00, 65.00, 'Email templates, queue system, tracking'),
('Email System', 'complex', 260.00, 120.00, 'Marketing emails, scheduling, analytics'),

-- DATABASE DESIGN (MEDIUM - foundational architecture)
('Database Design', 'simple', 70.00, 35.00, 'Simple schema, basic tables'),
('Database Design', 'medium', 160.00, 75.00, 'Normalized design, indexes, relationships'),
('Database Design', 'complex', 300.00, 135.00, 'Complex schema, optimization, migrations'),

-- UI/UX IMPLEMENTATION (MEDIUM)
('UI/UX Design', 'simple', 80.00, 40.00, 'Basic responsive layout, standard components'),
('UI/UX Design', 'medium', 180.00, 85.00, 'Custom design, animations, mobile-friendly'),
('UI/UX Design', 'complex', 340.00, 155.00, 'Design system, accessibility, complex interactions'),

-- SECURITY (HIGH - critical for production)
('Security', 'simple', 70.00, 35.00, 'Input validation, basic sanitization'),
('Security', 'medium', 180.00, 85.00, 'CSRF/XSS protection, encryption, secure headers'),
('Security', 'complex', 350.00, 160.00, 'Security audit, penetration testing, compliance'),

-- DEPLOYMENT & DEVOPS (MEDIUM-HIGH)
('Deployment', 'simple', 60.00, 30.00, 'Basic shared hosting setup'),
('Deployment', 'medium', 150.00, 70.00, 'VPS setup, SSL, CI/CD pipeline'),
('Deployment', 'complex', 300.00, 135.00, 'Cloud architecture, auto-scaling, monitoring'),

-- BOOKING/SCHEDULING (MEDIUM-HIGH - time logic complexity)
('Booking System', 'simple', 120.00, 55.00, 'Basic appointment booking'),
('Booking System', 'medium', 260.00, 120.00, 'Calendar integration, availability management'),
('Booking System', 'complex', 450.00, 200.00, 'Multi-resource booking, recurring, reminders'),

-- USER MANAGEMENT (MEDIUM)
('User Management', 'simple', 70.00, 35.00, 'Basic user profiles, settings'),
('User Management', 'medium', 160.00, 75.00, 'Profile editing, avatar upload, preferences'),
('User Management', 'complex', 300.00, 135.00, 'Multi-role users, teams, permissions'),

-- INVENTORY/STOCK (MEDIUM-HIGH - business logic)
('Inventory Management', 'simple', 100.00, 50.00, 'Basic stock tracking'),
('Inventory Management', 'medium', 220.00, 100.00, 'Stock alerts, multiple locations, history'),
('Inventory Management', 'complex', 400.00, 180.00, 'Batch tracking, expiry, automated reorder'),

-- FORMS & SURVEYS (LOW-MEDIUM)
('Form Builder', 'simple', 60.00, 30.00, 'Basic contact/feedback forms'),
('Form Builder', 'medium', 140.00, 65.00, 'Dynamic forms, validation, file attachments'),
('Form Builder', 'complex', 280.00, 125.00, 'Drag-drop builder, conditional logic, analytics'),

-- MAPS & LOCATION (MEDIUM-HIGH - third-party APIs)
('Maps Integration', 'simple', 80.00, 40.00, 'Basic map display, single marker'),
('Maps Integration', 'medium', 180.00, 85.00, 'Multiple markers, directions, geolocation'),
('Maps Integration', 'complex', 340.00, 155.00, 'Route optimization, geofencing, tracking');
