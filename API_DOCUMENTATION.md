# CryptoPilot API Documentation

This document outlines all available API endpoints, their purposes, parameters, and expected responses. This information is crucial for both developers and administrators to understand and modify the system.

## Authentication APIs

### Register User
- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Description**: Creates a new user account
- **Parameters**:
  - `username` (string, required): Unique username
  - `password` (string, required): User password
  - `email` (string, optional): User email
- **Response**:
  - Success (201): User object (without password)
  - Error (400): `{ message: "Username already exists" }` or `{ message: "Invalid input data", errors: [...] }`
- **Administrative Controls**:
  - Can be disabled via Admin Panel
  - Registration requirements can be modified in Admin Settings

### Login
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Description**: Authenticates a user and creates a session
- **Parameters**:
  - `username` (string, required): Username
  - `password` (string, required): User password
- **Response**:
  - Success (200): User object (without password)
  - Error (401): `{ message: "Authentication failed" }`
- **Administrative Controls**:
  - Failed login attempts are logged
  - Account lockout threshold configurable in Admin Panel

### Logout
- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Description**: Ends the user's session
- **Parameters**: None
- **Response**:
  - Success (200): `{ message: "Logged out successfully" }`
- **Administrative Controls**:
  - Force logout for specific users from Admin Panel

### Get Current User
- **Endpoint**: `/api/auth/me`
- **Method**: GET
- **Description**: Retrieves information about the currently authenticated user
- **Parameters**: None
- **Response**:
  - Success (200): User object (without password)
  - Error (401): `{ message: "Not authenticated" }`
- **Administrative Controls**:
  - Can impersonate users from Admin Panel for troubleshooting

## Cryptocurrency APIs

### Get All Cryptocurrencies
- **Endpoint**: `/api/cryptocurrencies`
- **Method**: GET
- **Description**: Retrieves list of available cryptocurrencies
- **Parameters**: None
- **Response**:
  - Success (200): Array of cryptocurrency objects
- **Administrative Controls**:
  - Enable/disable specific cryptocurrencies
  - Add custom cryptocurrencies
  - Update pricing sources

### Get Top Cryptocurrencies
- **Endpoint**: `/api/cryptocurrencies/top/:limit`
- **Method**: GET
- **Description**: Retrieves top cryptocurrencies by market cap
- **Parameters**:
  - `limit` (number, path): Number of cryptocurrencies to retrieve
- **Response**:
  - Success (200): Array of cryptocurrency objects
- **Administrative Controls**:
  - Modify ranking criteria
  - Feature specific cryptocurrencies

### Get Cryptocurrency by Symbol
- **Endpoint**: `/api/cryptocurrencies/:symbol`
- **Method**: GET
- **Description**: Retrieves information about a specific cryptocurrency
- **Parameters**:
  - `symbol` (string, path): Cryptocurrency symbol (e.g., BTC)
- **Response**:
  - Success (200): Cryptocurrency object
  - Error (404): `{ message: "Cryptocurrency not found" }`
- **Administrative Controls**:
  - Override market data for testing
  - Add manual price adjustments

## Wallet APIs

### Get User Wallets
- **Endpoint**: `/api/wallets`
- **Method**: GET
- **Description**: Retrieves wallets owned by the authenticated user
- **Authentication**: Required
- **Parameters**: None
- **Response**:
  - Success (200): Array of wallet objects
- **Administrative Controls**:
  - View all user wallets
  - Freeze/unfreeze wallets
  - Add admin notes to wallets

### Create Wallet
- **Endpoint**: `/api/wallets`
- **Method**: POST
- **Description**: Creates a new wallet for the authenticated user
- **Authentication**: Required
- **Parameters**:
  - `address` (string, required): Wallet address
  - `blockchain` (string, required): Blockchain network
- **Response**:
  - Success (201): Wallet object
  - Error (400): `{ message: "Invalid input data", errors: [...] }`
- **Administrative Controls**:
  - Limit wallet creation per user
  - Approve wallet addresses
  - Restrict blockchain networks

## Token APIs

### Get User Tokens
- **Endpoint**: `/api/tokens`
- **Method**: GET
- **Description**: Retrieves tokens owned by the authenticated user
- **Authentication**: Required
- **Parameters**: None
- **Response**:
  - Success (200): Array of token objects
- **Administrative Controls**:
  - View all user tokens
  - Revoke tokens
  - Add restrictions to tokens

### Generate Token
- **Endpoint**: `/api/tokens/generate`
- **Method**: POST
- **Description**: Generates a new flash token
- **Authentication**: Required
- **Parameters**:
  - `symbol` (string, required): Token symbol
  - `amount` (string, required): Token amount
  - `blockchain` (string, required): Blockchain network
  - `securityLevel` (string, required): Security level
  - `isAiEnhanced` (boolean, optional): Whether AI security is enabled
- **Response**:
  - Success (201): `{ token: Token, transaction: Transaction }`
  - Error (400): `{ message: "Invalid input data", errors: [...] }`
- **Administrative Controls**:
  - Set generation limits
  - Configure security levels
  - Monitor generation patterns
  - Override security checks

## Transaction APIs

### Get User Transactions
- **Endpoint**: `/api/transactions`
- **Method**: GET
- **Description**: Retrieves transactions performed by the authenticated user
- **Authentication**: Required
- **Parameters**: None
- **Response**:
  - Success (200): Array of transaction objects
- **Administrative Controls**:
  - View all transactions
  - Filter by transaction type
  - Export transaction logs
  - Flag suspicious activities

### Convert Token
- **Endpoint**: `/api/transactions/convert`
- **Method**: POST
- **Description**: Converts one cryptocurrency to another
- **Authentication**: Required
- **Parameters**:
  - `fromSymbol` (string, required): Source token symbol
  - `toSymbol` (string, required): Destination token symbol
  - `amount` (string, required): Amount to convert
  - `blockchain` (string, required): Blockchain network
- **Response**:
  - Success (201): Transaction object
  - Error (400): `{ message: "Invalid input data", errors: [...] }`
- **Administrative Controls**:
  - Set conversion limits
  - Adjust conversion rates
  - Block specific conversions
  - Set fee structures

### Transfer Token
- **Endpoint**: `/api/transactions/transfer`
- **Method**: POST
- **Description**: Transfers tokens to another wallet
- **Authentication**: Required
- **Parameters**:
  - `fromSymbol` (string, required): Token symbol
  - `amount` (string, required): Amount to transfer
  - `recipientAddress` (string, required): Destination wallet address
  - `blockchain` (string, required): Blockchain network
- **Response**:
  - Success (201): Transaction object
  - Error (400): `{ message: "Invalid input data", errors: [...] }`
- **Administrative Controls**:
  - Set transfer limits
  - Whitelist/blacklist addresses
  - Approve large transfers
  - Monitor unusual transfer patterns

## Admin-only APIs

### User Management

#### Get All Users
- **Endpoint**: `/api/admin/users`
- **Method**: GET
- **Description**: Retrieves all registered users
- **Authentication**: Admin required
- **Parameters**:
  - `page` (number, query, optional): Page number for pagination
  - `limit` (number, query, optional): Number of users per page
  - `sortBy` (string, query, optional): Field to sort by
  - `sortOrder` (string, query, optional): Sort order (asc/desc)
  - `search` (string, query, optional): Search term for username/email
- **Response**:
  - Success (200): `{ users: Array, total: number, pages: number }`

#### Get User by ID
- **Endpoint**: `/api/admin/users/:id`
- **Method**: GET
- **Description**: Retrieves detailed information about a specific user
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
- **Response**:
  - Success (200): User object with detailed information
  - Error (404): `{ message: "User not found" }`

#### Update User
- **Endpoint**: `/api/admin/users/:id`
- **Method**: PATCH
- **Description**: Updates a user's information
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
  - `username` (string, optional): New username
  - `email` (string, optional): New email
  - `isActive` (boolean, optional): Account status
  - `role` (string, optional): User role
- **Response**:
  - Success (200): Updated user object
  - Error (404): `{ message: "User not found" }`
  - Error (400): `{ message: "Invalid input data", errors: [...] }`

#### Delete User
- **Endpoint**: `/api/admin/users/:id`
- **Method**: DELETE
- **Description**: Deletes a user account
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
- **Response**:
  - Success (200): `{ message: "User deleted successfully" }`
  - Error (404): `{ message: "User not found" }`

#### Reset User Password
- **Endpoint**: `/api/admin/users/:id/reset-password`
- **Method**: POST
- **Description**: Resets a user's password
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
  - `newPassword` (string, required): New password
- **Response**:
  - Success (200): `{ message: "Password reset successfully" }`
  - Error (404): `{ message: "User not found" }`

#### Suspend User
- **Endpoint**: `/api/admin/users/:id/suspend`
- **Method**: POST
- **Description**: Suspends a user account
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
  - `reason` (string, optional): Reason for suspension
  - `duration` (number, optional): Suspension duration in days
- **Response**:
  - Success (200): `{ message: "User suspended successfully" }`
  - Error (404): `{ message: "User not found" }`

#### Unsuspend User
- **Endpoint**: `/api/admin/users/:id/unsuspend`
- **Method**: POST
- **Description**: Removes suspension from a user account
- **Authentication**: Admin required
- **Parameters**:
  - `id` (number, path): User ID
- **Response**:
  - Success (200): `{ message: "User unsuspended successfully" }`
  - Error (404): `{ message: "User not found" }`

### System Analytics

#### Get System Statistics
- **Endpoint**: `/api/admin/statistics`
- **Method**: GET
- **Description**: Retrieves system-wide statistics
- **Authentication**: Admin required
- **Parameters**:
  - `period` (string, query, optional): Time period (day/week/month/year)
- **Response**:
  - Success (200): Statistics object with user counts, transaction counts, etc.

#### Get Authentication Logs
- **Endpoint**: `/api/admin/logs/auth`
- **Method**: GET
- **Description**: Retrieves authentication activity logs
- **Authentication**: Admin required
- **Parameters**:
  - `page` (number, query, optional): Page number
  - `limit` (number, query, optional): Logs per page
  - `userId` (number, query, optional): Filter by user ID
  - `action` (string, query, optional): Filter by action type (login/logout/register)
  - `status` (string, query, optional): Filter by status (success/failure)
  - `startDate` (string, query, optional): Start date for filtering
  - `endDate` (string, query, optional): End date for filtering
- **Response**:
  - Success (200): `{ logs: Array, total: number, pages: number }`

#### Get Transaction Logs
- **Endpoint**: `/api/admin/logs/transactions`
- **Method**: GET
- **Description**: Retrieves transaction activity logs
- **Authentication**: Admin required
- **Parameters**:
  - `page` (number, query, optional): Page number
  - `limit` (number, query, optional): Logs per page
  - `userId` (number, query, optional): Filter by user ID
  - `type` (string, query, optional): Filter by transaction type
  - `status` (string, query, optional): Filter by status
  - `startDate` (string, query, optional): Start date for filtering
  - `endDate` (string, query, optional): End date for filtering
- **Response**:
  - Success (200): `{ logs: Array, total: number, pages: number }`

### Configuration Management

#### Get System Configuration
- **Endpoint**: `/api/admin/config`
- **Method**: GET
- **Description**: Retrieves system configuration settings
- **Authentication**: Admin required
- **Parameters**: None
- **Response**:
  - Success (200): Configuration object

#### Update System Configuration
- **Endpoint**: `/api/admin/config`
- **Method**: PATCH
- **Description**: Updates system configuration settings
- **Authentication**: Admin required
- **Parameters**:
  - `securitySettings` (object, optional): Security configuration
  - `featureFlags` (object, optional): Feature enable/disable flags
  - `apiSettings` (object, optional): API configuration
  - `uiSettings` (object, optional): UI configuration
- **Response**:
  - Success (200): Updated configuration object
  - Error (400): `{ message: "Invalid configuration", errors: [...] }`

## Integrations with External APIs

### CoinMarketCap API Integration
- **Endpoint**: `/api/integrations/coinmarketcap/listings`
- **Method**: GET
- **Description**: Fetches cryptocurrency listings from CoinMarketCap API
- **Authentication**: Required
- **Parameters**:
  - `limit` (number, query, optional): Number of cryptocurrencies to retrieve
  - `start` (number, query, optional): Starting position
  - `convert` (string, query, optional): Currency to convert prices to
- **Response**:
  - Success (200): CoinMarketCap API response
  - Error (500): `{ message: "Failed to fetch cryptocurrency data" }`
- **Administrative Controls**:
  - Configure API key
  - Set cache duration
  - Configure fallback behavior

### Blockchain Network APIs
- **Endpoint**: `/api/integrations/blockchain/:network/status`
- **Method**: GET
- **Description**: Checks the status of a blockchain network
- **Authentication**: Required
- **Parameters**:
  - `network` (string, path): Blockchain network (ethereum/binance/tron/solana)
- **Response**:
  - Success (200): Network status information
  - Error (500): `{ message: "Failed to fetch network status" }`
- **Administrative Controls**:
  - Configure RPC endpoints
  - Set network preferences
  - Enable/disable networks

## How to Modify API Behavior

Administrators can modify API behavior in three ways:

### 1. Through Admin Dashboard
The admin dashboard provides a user interface to modify API behavior, set limits, and configure system settings without requiring code changes.

### 2. Database Configuration
Many API behaviors are controlled by configuration records in the database. Administrators can directly edit these records to modify system behavior.

### 3. Environment Variables
Some core behaviors are controlled by environment variables. Administrators can modify these to change system behavior without redeploying.

## API Security Controls

### Rate Limiting
All APIs are rate-limited to prevent abuse. The default limits are:
- 100 requests per minute for public APIs
- 300 requests per minute for authenticated user APIs
- 500 requests per minute for admin APIs

Administrators can adjust these limits in the admin panel.

### Access Control
- Public: No authentication required
- User: Regular user authentication required
- Admin: Administrator authentication required

### API Keys
External integrations can use API keys for authentication instead of session cookies.
Administrators can generate, view, and revoke API keys in the admin panel.

### Audit Logging
All API requests are logged for security and debugging purposes.
Administrators can view and search these logs in the admin panel.