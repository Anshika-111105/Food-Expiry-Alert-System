# Smart Food Expiry Date Management System

[![Database](https://img.shields.io/badge/database-MySQL%20%7C%20PostgreSQL-blue.svg)]()
[![Backend](https://img.shields.io/badge/backend-Python%20Flask-green.svg)]()
[![Status](https://img.shields.io/badge/status-Active-success.svg)]()

**A comprehensive database-driven solution to combat food wastage by efficiently tracking expiry dates and sending timely alerts.**

## Table of Contents

- [Abstract](#abstract)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Future Scope](#future-scope)
- [Contributing](#contributing)

## Abstract

Food wastage due to expired products is a common problem affecting households, restaurants, and retail stores worldwide. This project develops a database-driven system that efficiently manages food inventory by tracking expiry dates, sending alerts before items expire, and helping users utilize items on time. By maintaining a centralized database, the system ensures accurate data storage, easy access, and timely notifications, reducing both food wastage and financial losses.

## Problem Statement

Every year, billions of dollars worth of food is wasted due to:
- Lack of proper inventory tracking
- Forgotten expiry dates
- Poor planning and management
- No systematic alerts for near-expiry items

This system addresses these challenges by providing an automated, intelligent solution for food expiry management.

## Objectives

1. **Create a User-Friendly Database**: Design and implement a robust database for managing food items and their expiry dates
2. **Automated Alert System**: Send notifications 2-3 days before items expire to minimize food waste
3. **Smart Categorization**: Automatically categorize food items based on status:
   - Fresh
   - Near Expiry
   - Expired
4. **Generate Insights**: Provide useful analytics for better inventory planning and decision-making

## Key Features

### Core Features

- **Food Item Entry**
  - Add item name, category, purchase date, expiry date, and quantity
  - Support for multiple categories (Dairy, Vegetables, Fruits, Meat, etc.)
  - Batch entry for bulk items

- **Expiry Tracking**
  - Automatically calculate days remaining before expiry
  - Real-time status updates
  - Color-coded inventory view

- **Alert System**
  - Notify users 2–3 days before expiry
  - Email/SMS notifications (optional)
  - Customizable alert thresholds

- **Inventory View**
  - Separate lists for Fresh, Near Expiry, and Expired items
  - Filter and sort by category, date, or status
  - Quick search functionality

### Optional Features

- **Recipe Suggestions**: Get recipe recommendations based on near-expiry items
- **Analytics Dashboard**: Visual insights into consumption patterns and wastage trends
- **Shopping List Generator**: Create shopping lists based on consumption history

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│            (Web Browser / Mobile App)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend Layer                           │
│         (Python Flask / Node.js / PHP)                   │
│  • Authentication & Authorization                        │
│  • Business Logic                                        │
│  • API Endpoints                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer                              │
│         (MySQL / PostgreSQL / SQLite)                    │
│  • Users Table                                           │
│  • Food_Items Table                                      │
│  • Alerts Table                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Alert Service                               │
│         (Email/SMS API Integration)                      │
│  • Scheduled Notifications                               │
│  • Multi-channel Delivery                                │
└─────────────────────────────────────────────────────────┘
```

## Database Design

### Entities and Relationships

**ER Diagram**: Users → Food_Items → Alerts

### Database Tables

#### 1. Users Table
```sql
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    notification_preference ENUM('email', 'sms', 'both') DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Food_Items Table
```sql
CREATE TABLE Food_Items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) DEFAULT 'pieces',
    status ENUM('Fresh', 'Near Expiry', 'Expired') DEFAULT 'Fresh',
    days_remaining INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
```

#### 3. Alerts Table
```sql
CREATE TABLE Alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    alert_date DATE NOT NULL,
    alert_type VARCHAR(50) DEFAULT 'Near Expiry',
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    FOREIGN KEY (item_id) REFERENCES Food_Items(item_id) ON DELETE CASCADE
);
```

### Key Relationships

- **One-to-Many**: One user can have many food items
- **One-to-Many**: One food item can generate many alerts

## Installation

### Prerequisites

- Python 3.8+ or Node.js 14+
- MySQL 8.0+ or PostgreSQL 12+
- pip (Python package manager) or npm (Node package manager)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-food-expiry-system.git
cd smart-food-expiry-system

# Create virtual environment (Python)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database
cp config.example.py config.py
# Edit config.py with your database credentials

# Initialize database
python init_db.py

# Run the application
python app.py
```

The application will be available at `http://localhost:5000`

## Usage

### Adding Food Items

1. Log in to your account
2. Click "Add New Item"
3. Fill in the details:
   - Item Name (e.g., "Milk")
   - Category (e.g., "Dairy")
   - Purchase Date
   - Expiry Date
   - Quantity and Unit
4. Click "Save"

### Viewing Inventory

Navigate to the dashboard to see:
- **Fresh Items**: Items with >3 days until expiry
- **Near Expiry**: Items expiring within 2-3 days
- **Expired Items**: Items past their expiry date

### Managing Alerts

- Alerts are automatically generated 2-3 days before expiry
- Check your email/SMS for notifications
- Configure alert preferences in Settings

### Sample Queries

```sql
-- View all near-expiry items
SELECT * FROM Food_Items 
WHERE status = 'Near Expiry' 
ORDER BY expiry_date ASC;

-- Get items expiring in next 3 days
SELECT * FROM Food_Items 
WHERE days_remaining <= 3 AND days_remaining > 0;

-- Generate wastage report
SELECT category, COUNT(*) as expired_count, SUM(quantity) as total_wasted
FROM Food_Items 
WHERE status = 'Expired' 
GROUP BY category;
```

## Tech Stack

| Layer | Technology Used | Purpose |
|-------|----------------|---------|
| **Database** | MySQL / PostgreSQL / SQLite | Data storage and management |
| **Backend** | Python Flask / PHP / Node.js | Business logic and API |
| **Frontend** | HTML, CSS, JavaScript | User interface (optional) |
| **Alert Service** | Email/SMS API | Notification delivery |

### Recommended Libraries

**Python (Flask)**
- Flask - Web framework
- SQLAlchemy - ORM
- Flask-Mail - Email notifications
- APScheduler - Scheduled tasks
- python-dotenv - Configuration management

**JavaScript (Node.js)**
- Express.js - Web framework
- Sequelize - ORM
- Nodemailer - Email service
- node-cron - Task scheduling

## Expected Outcome

Upon completion, this project will deliver:

- A fully functional DBMS with structured database design
- Automated expiry tracking with real-time status updates
- Alert functionality via email/SMS notifications
- Comprehensive inventory view with categorization
- Query system for generating reports and insights
- User-friendly interface for non-technical users
- Significant reduction in food wastage and financial losses

## Future Scope

This system can be enhanced with:

- **Recipe Integration**: Suggest recipes based on near-expiry ingredients
- **Grocery Integration**: Connect with online grocery stores for automatic ordering
- **Mobile App**: Native iOS and Android applications
- **Barcode Scanning**: Quick item entry using barcode scanner
- **AI Predictions**: Machine learning for consumption pattern analysis
- **Multi-user Support**: Family/team accounts with shared inventory
- **Donation Alerts**: Connect with food banks for near-expiry items

## Target Users

- **Households**: Manage daily food inventory and reduce waste
- **Restaurants**: Track bulk items and minimize losses
- **Retail Stores**: Monitor stock and optimize ordering
- **Cafeterias**: Manage large-scale food operations
- **Food Banks**: Track donations and expiry dates

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or suggestions, please reach out:
- Email: anshikasaklani894@gmail.com
- GitHub: [(https://github.com/yourusername](https://github.com/Anshika-111105))

## Acknowledgments

- Thanks to all contributors who helped shape this project
- Inspired by the global movement to reduce food wastage
- Built with modern database management principles

---

**Smart Food Expiry Date Management System** - Making food management smarter, reducing waste, saving money!
