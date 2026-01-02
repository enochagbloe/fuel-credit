# Fuel Credit System - Implementation Guide

## Project Overview
A comprehensive fuel credit system enabling users to purchase fuel on credit, manage repayments, earn rewards, and providing management tools for attendants and administrators.

## Technology Stack
### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **File Structure**: TypeScript support configured

### Frontend
- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **Language**: TypeScript

## User Roles & Responsibilities

### 1. User (Fuel Buyer)
- Register/login with KYC (optional)
- Scan QR codes at fuel stations
- Choose payment method (Credit/Debit)
- Track credit balance and repayment
- Earn and redeem reward points
- View transaction history

### 2. Attendant (Fuel Seller)
- Generate time-limited QR codes
- Approve fuel dispensing requests
- View transaction logs
- Track performance metrics
- Monitor commission earnings

### 3. Admin (System Manager)
- Manage stations and attendants
- Monitor all transactions
- Oversee credit management and risk
- Configure rewards system
- Generate analytics and reports

## Implementation Phases

### Phase 1: Core Infrastructure ✅
- [x] Backend server setup
- [x] Database schema with Prisma
- [x] Authentication system
- [x] Basic API structure

### Phase 2: User Management System
#### Backend APIs
- [ ] User registration/login endpoints
- [ ] KYC document upload (optional)
- [ ] Credit limit assignment
- [ ] User profile management

#### Frontend Screens
- [ ] Registration/Login screens
- [ ] User dashboard
- [ ] Profile management screen
- [ ] KYC upload screen (optional)

### Phase 3: Core Transaction System
#### Backend APIs
- [ ] QR code generation and validation
- [ ] Transaction creation and approval
- [ ] Payment processing integration
- [ ] Transaction status updates

#### Frontend Screens
- [ ] QR scanner screen
- [ ] Transaction details form
- [ ] Payment method selection
- [ ] Transaction confirmation screen

### Phase 4: Credit Management
#### Backend APIs
- [ ] Credit balance tracking
- [ ] Payment processing
- [ ] Credit limit adjustment
- [ ] Payment reminders

#### Frontend Screens
- [ ] Credit dashboard
- [ ] Payment screen
- [ ] Payment history
- [ ] Credit limit display

### Phase 5: Rewards System
#### Backend APIs
- [ ] Points calculation and allocation
- [ ] Rewards catalog management
- [ ] Points redemption processing

#### Frontend Screens
- [ ] Rewards catalog
- [ ] Points balance display
- [ ] Redemption screen
- [ ] Rewards history

### Phase 6: Attendant Features
#### Backend APIs
- [ ] QR code generation for attendants
- [ ] Transaction approval system
- [ ] Attendant performance tracking

#### Frontend Screens
- [ ] Attendant dashboard
- [ ] QR code generator
- [ ] Transaction approval interface
- [ ] Performance metrics

### Phase 7: Admin Panel
#### Backend APIs
- [ ] Station management
- [ ] Attendant management
- [ ] Analytics and reporting
- [ ] System configuration

#### Frontend Screens
- [ ] Admin dashboard
- [ ] Station management interface
- [ ] User management panel
- [ ] Analytics dashboard

## Database Schema Requirements

### Core Tables
```sql
-- Users table
Users {
  id: UUID (Primary Key)
  name: String
  email: String (Unique)
  phone: String (Unique)
  role: Enum (USER, ATTENDANT, ADMIN)
  creditLimit: Decimal
  currentBalance: Decimal
  totalPoints: Integer
  kycStatus: Enum (PENDING, APPROVED, REJECTED)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Stations table
Stations {
  id: UUID (Primary Key)
  name: String
  location: String
  coordinates: String
  isActive: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

-- Transactions table
Transactions {
  id: UUID (Primary Key)
  userId: UUID (Foreign Key)
  attendantId: UUID (Foreign Key)
  stationId: UUID (Foreign Key)
  fuelType: String
  quantity: Decimal
  amount: Decimal
  paymentMethod: Enum (CREDIT, DEBIT)
  status: Enum (PENDING, APPROVED, COMPLETED, CANCELLED)
  qrCodeId: UUID (Foreign Key)
  createdAt: DateTime
  completedAt: DateTime
}

-- QR Codes table
QRCodes {
  id: UUID (Primary Key)
  attendantId: UUID (Foreign Key)
  stationId: UUID (Foreign Key)
  code: String (Unique)
  expiresAt: DateTime
  isUsed: Boolean
  createdAt: DateTime
}

-- Payments table
Payments {
  id: UUID (Primary Key)
  userId: UUID (Foreign Key)
  transactionId: UUID (Foreign Key)
  amount: Decimal
  paymentMethod: String
  paymentGatewayRef: String
  status: Enum (PENDING, COMPLETED, FAILED)
  paidAt: DateTime
  createdAt: DateTime
}

-- Rewards table
Rewards {
  id: UUID (Primary Key)
  name: String
  description: String
  pointsCost: Integer
  isActive: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

-- User Rewards (Redemptions)
UserRewards {
  id: UUID (Primary Key)
  userId: UUID (Foreign Key)
  rewardId: UUID (Foreign Key)
  pointsUsed: Integer
  redeemedAt: DateTime
}
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users/dashboard` - User dashboard data
- `GET /api/users/credit-info` - Credit balance and limit
- `POST /api/users/kyc` - Upload KYC documents
- `GET /api/users/transactions` - User transaction history

### Transactions
- `POST /api/transactions/create` - Create new transaction
- `PUT /api/transactions/:id/approve` - Approve transaction (Attendant)
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/scan-qr` - Process QR scan

### QR Codes
- `POST /api/qr/generate` - Generate QR code (Attendant)
- `GET /api/qr/:code` - Validate QR code
- `PUT /api/qr/:code/expire` - Expire QR code

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/setup-auto` - Setup auto-debit

### Rewards
- `GET /api/rewards/catalog` - Get rewards catalog
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/rewards/history` - Redemption history
- `GET /api/rewards/points` - Get user points

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/stations` - Manage stations
- `GET /api/admin/attendants` - Manage attendants
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/stations` - Create station
- `PUT /api/admin/stations/:id` - Update station

## Key Features Implementation Details

### Points System
- **Instant Payment**: 3 points
- **Early Repayment**: 3 points
- **On-time Repayment**: 2 points
- **Late Repayment**: 1 point
- **Points to Credit**: 50 points = GHS 100 limit increase

### Credit Limits
- **New Users**: GHS 100 initial limit
- **Growth**: Based on points accumulation
- **Risk Management**: Automated alerts for high-risk users

### QR Code System
- **Validity**: 5 minutes after generation
- **Security**: Unique codes with station/attendant metadata
- **Tracking**: Full audit trail for fraud prevention

### Payment Integration
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Credit/Debit Cards
- Bank transfers
- Auto-debit setup option

## Security Considerations
- JWT token authentication
- Rate limiting on API endpoints
- QR code expiration and single-use validation
- KYC verification for credit limits
- Transaction approval workflow
- Audit trails for all financial operations

## Development Priorities
1. **High Priority**: User registration, QR scanning, basic transactions
2. **Medium Priority**: Credit management, payment processing
3. **Low Priority**: Advanced analytics, premium features

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end testing for critical user flows
- Security testing for payment flows
- Load testing for QR code generation/validation

## Deployment Considerations
- Backend: Railway/Heroku/DigitalOcean
- Database: PostgreSQL (hosted)
- File Storage: AWS S3/Cloudinary for KYC documents
- Mobile App: Expo Application Services (EAS)
- Real-time Features: WebSocket/Server-Sent Events for live updates

---

## Current Status
✅ Backend infrastructure complete
⏳ Ready for feature implementation phases

## Next Steps
1. Implement user authentication flows
2. Create database schema with Prisma migrations
3. Develop QR code generation and scanning
4. Build transaction approval workflow
5. Implement payment processing integration