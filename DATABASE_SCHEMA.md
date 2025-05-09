# CryptoPilot Database Schema

## Core Tables

### users
- `id` (Primary Key, Serial)
- `username` (Text, Unique, Not Null)
- `password` (Text, Not Null)
- `email` (Text, Nullable)
- `display_name` (Text, Nullable)
- `phone_number` (Text, Nullable)
- `profile_picture` (Text, Nullable)
- `role` (Text, Default "user", Not Null) - Options: "user", "admin"
- `is_active` (Boolean, Default true, Not Null)
- `is_suspended` (Boolean, Default false, Not Null)
- `suspension_reason` (Text, Nullable)
- `suspension_end_date` (Timestamp, Nullable)
- `last_login_at` (Timestamp, Nullable)
- `last_logout_at` (Timestamp, Nullable)
- `preferences` (JSON, Default {})
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### wallets
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `address` (Text, Not Null)
- `name` (Text, Not Null)
- `blockchain` (Text, Not Null) - e.g., "ethereum", "bitcoin"
- `is_primary` (Boolean, Default false, Not Null)
- `balance` (Decimal, Default 0, Not Null)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### tokens
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `symbol` (Text, Not Null)
- `amount` (Decimal, Not Null)
- `blockchain` (Text, Not Null)
- `type` (Text, Not Null) - Options: "generate", "convert", "transfer"
- `status` (Text, Default "active", Not Null) - Options: "active", "locked", "expired"
- `token_address` (Text, Nullable)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### transactions
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `type` (Text, Not Null) - Options: "generate", "convert", "transfer"
- `from_symbol` (Text, Nullable)
- `to_symbol` (Text, Nullable)
- `amount` (Decimal, Not Null)
- `recipient_address` (Text, Nullable)
- `blockchain` (Text, Not Null)
- `status` (Text, Not Null) - Options: "pending", "completed", "failed", "cancelled"
- `hash` (Text, Nullable) - Transaction hash on blockchain
- `fee` (Decimal, Nullable)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### cryptocurrencies
- `id` (Primary Key, Serial)
- `name` (Text, Not Null)
- `symbol` (Text, Not Null, Unique)
- `logo` (Text, Nullable)
- `blockchain` (Text, Not Null)
- `price` (Decimal, Not Null)
- `market_cap` (Decimal, Nullable)
- `volume_24h` (Decimal, Nullable)
- `circulating_supply` (Decimal, Nullable)
- `change_24h` (Decimal, Default 0)
- `change_7d` (Decimal, Default 0)
- `rank` (Integer, Nullable)
- `is_active` (Boolean, Default true, Not Null)
- `is_default` (Boolean, Default false, Not Null)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

## Admin and System Tables

### auth_logs
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Nullable)
- `action` (Text, Not Null) - Options: "login", "logout", "register", "password_reset", "failed_login", etc.
- `status` (Text, Not Null) - Options: "success", "failure"
- `ip_address` (Text, Nullable)
- `user_agent` (Text, Nullable)
- `details` (JSON, Nullable) - Additional information about the action
- `created_at` (Timestamp, Default Now)

### api_keys
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `name` (Text, Not Null)
- `key` (Text, Not Null, Unique)
- `secret` (Text, Not Null)
- `type` (Text, Not Null) - Options: "read", "write", "admin"
- `is_active` (Boolean, Default true, Not Null)
- `last_used_at` (Timestamp, Nullable)
- `expires_at` (Timestamp, Nullable)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### system_config
- `id` (Primary Key, Serial)
- `key` (Text, Not Null, Unique)
- `value` (JSON, Not Null)
- `description` (Text, Nullable)
- `is_public` (Boolean, Default false, Not Null)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### user_notifications
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `type` (Text, Not Null) - Options: "alert", "info", "success", "warning", "error"
- `title` (Text, Not Null)
- `message` (Text, Not Null)
- `is_read` (Boolean, Default false, Not Null)
- `link` (Text, Nullable)
- `created_at` (Timestamp, Default Now)

### price_alerts
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `cryptocurrency_id` (Integer, Foreign Key to cryptocurrencies.id, Not Null)
- `target_price` (Decimal, Not Null)
- `direction` (Text, Not Null) - Options: "above", "below"
- `is_active` (Boolean, Default true, Not Null)
- `is_triggered` (Boolean, Default false, Not Null)
- `notification_method` (Text, Not Null) - Options: "email", "sms", "push", "in_app"
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### portfolio_snapshots
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Not Null)
- `total_value_usd` (Decimal, Not Null)
- `day_change_percent` (Decimal, Not Null)
- `week_change_percent` (Decimal, Not Null)
- `month_change_percent` (Decimal, Not Null)
- `assets` (JSON, Not Null) - Snapshot of asset distribution
- `created_at` (Timestamp, Default Now)

### ai_insights
- `id` (Primary Key, Serial)
- `user_id` (Integer, Foreign Key to users.id, Nullable) - NULL for global insights
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `category` (Text, Not Null) - Options: "price", "market", "portfolio", "security"
- `impact` (Text, Not Null) - Options: "low", "medium", "high"
- `action_recommended` (Text, Nullable)
- `is_active` (Boolean, Default true, Not Null)
- `expiry_date` (Timestamp, Nullable)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

### market_data
- `id` (Primary Key, Serial)
- `cryptocurrency_id` (Integer, Foreign Key to cryptocurrencies.id, Not Null)
- `price` (Decimal, Not Null)
- `market_cap` (Decimal, Nullable)
- `volume_24h` (Decimal, Nullable)
- `change_24h` (Decimal, Default 0)
- `timestamp` (Timestamp, Default Now, Not Null)

### integration_configs
- `id` (Primary Key, Serial)
- `name` (Text, Not Null, Unique) - e.g., "coinmarketcap", "etherscan"
- `is_active` (Boolean, Default false, Not Null)
- `config` (JSON, Not Null) - API keys, endpoints, etc.
- `last_sync` (Timestamp, Nullable)
- `created_at` (Timestamp, Default Now)
- `updated_at` (Timestamp, Default Now)

## Relationship Summary

- **users** → One-to-Many → **wallets**, **tokens**, **transactions**, **auth_logs**, **api_keys**, **user_notifications**, **price_alerts**, **portfolio_snapshots**, **ai_insights**
- **cryptocurrencies** → One-to-Many → **tokens**, **market_data**, **price_alerts**
- All tables include appropriate timestamps for auditing and historical analysis