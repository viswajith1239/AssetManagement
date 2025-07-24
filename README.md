🗂️ Asset Management Application
A full-stack web application to streamline the management of organizational assets — including hardware, software, vendors, and inventory tracking — using the MERN stack with MySQL.

🚀 Tech Stack
Frontend: React.js (with React Router, Yup, React-Hook-Form, MUI/Ant Design)
Backend: Node.js, Express.js (MVC Architecture)
Database: MySQL (via Sequelize ORM)
Excel Operations: xlsx / exceljs
Validation: express-validator or Joi
State Management: Context API / Redux Toolkit
📦 Features (Week 1 Scope)
✅ Master Modules (CRUD)
Asset Categories
Asset Subcategories
Branches
Vendors
Manufacturers
✅ GRN Module
GRN Header + Dynamic Line Items Table
Auto-generated GRN Numbers (Format: GRN-YYYYMM-XXX)
Validation using React Hook Form + Yup
Live calculation of totals using watchers
Confirmation modal on cancel
Responsive layout (Mobile + Desktop)
Toast notifications
✅ Excel Upload & Download
Import/Export for Asset Categories
Export for GRN Register & Asset Summary Reports
✅ Reports
GRN Register Report (with filters & export)
Asset Summary Report (by Category & Branch)
🗃️ Database Schema
ERD & Normalized MySQL schema includes:

Master Tables
asset_categories(id, name, description, status, created_at, updated_at)
asset_subcategories(id, category_id, name, description, status, created_at, updated_at)
branches(id, name, location, code, status, created_at, updated_at)
vendors(id, name, contact_person, email, phone, address, gst_number, created_at, updated_at)
manufacturers(id, name, description, created_at, updated_at)
GRN Tables
grn_headers(id, grn_number, grn_date, invoice_number, vendor_id, branch_id, created_at, updated_at)
grn_line_items(id, grn_id, subcategory_id, item_description, quantity, unit_price, tax_percent, taxable_value, total_amount, created_at, updated_at)
📂 Project Structure
asset-management-app/ │ ├── backend/ │ ├── config/ │ │ └── database.js │ ├── controllers/ │ │ └── assetCategoryController.js │ ├── middlewares/ │ │ └── errorHandler.js │ ├── models/ │ │ └── AssetCategory.js │ ├── routes/ │ │ └── assetCategories.js │ ├── uploads/ │ ├── node_modules/ │ ├── config.env │ ├── package.json │ ├── package-lock.json │ └── server.js │ ├── frontend/ │ ├── public/ │ │ └── index.html │ ├── src/ │ │ ├── assets/ │ │ │ └── logo.svg │ │ ├── components/ │ │ │ ├── GRN/ │ │ │ │ ├── HeaderForm.jsx │ │ │ │ ├── LineItemTable.jsx │ │ │ │ └── TotalsPanel.jsx │ │ │
│ │ ├── pages/ │ │ │ ├── GRN/ │ │ │ │ ├── Form.jsx │ │ │ │ └── List.jsx │ │ │ └── Master/ │ │ │ ├── Categories.jsx │ │ │ ├── Vendors.jsx │ │ │ └── Branches.jsx │ │ ├── services/ │ │ │ └── api.js │ │ │ │ │ ├── App.jsx │ │ └── main.jsx │ ├── package.json │ └── vite.config.js │ └──

Frontend Setup
cd frontend npm install npm run dev

Backend Setup
cd backend npm install npm start
