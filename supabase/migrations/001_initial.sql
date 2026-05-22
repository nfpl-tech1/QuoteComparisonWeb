-- Run this once in your Supabase project SQL editor (Database > SQL Editor).

-- Exchange rates cache: one row per calendar date.
CREATE TABLE IF NOT EXISTS exchange_rates_cache (
    rate_date   DATE         PRIMARY KEY,
    rates_json  JSONB        NOT NULL,
    fetched_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Inquiry processing log: one row each time a comparison is viewed.
CREATE TABLE IF NOT EXISTS inquiry_log (
    id              BIGSERIAL    PRIMARY KEY,
    inquiry_number  VARCHAR(20)  NOT NULL,
    mode            VARCHAR(10)  NOT NULL,        -- AIR | FCL | LCL
    logged_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    workstation_id  VARCHAR(100) NOT NULL,
    vendor_count    INTEGER      NOT NULL,   -- unique vendors compared
    quote_count     INTEGER      NOT NULL,   -- total quotes (one vendor can give multiple)
    vendor_names    TEXT[]       NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiry_log_logged_at
    ON inquiry_log (logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiry_log_inquiry
    ON inquiry_log (inquiry_number);

CREATE INDEX IF NOT EXISTS idx_inquiry_log_mode
    ON inquiry_log (mode);
