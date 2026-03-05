-- Create test database for integration tests (idempotent)
-- Docker init scripts run via psql, so \gexec is available
SELECT 'CREATE DATABASE finance_tracker_test OWNER finance'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'finance_tracker_test')\gexec
