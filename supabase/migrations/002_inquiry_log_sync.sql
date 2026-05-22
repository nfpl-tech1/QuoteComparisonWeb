-- Align inquiry_log schema with the desktop sync payload and API route.

ALTER TABLE inquiry_log
    ADD COLUMN IF NOT EXISTS lane VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS user_name VARCHAR(100) NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS uq_inquiry_log_inquiry_mode
    ON inquiry_log (inquiry_number, mode);
