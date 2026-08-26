-- Migration for IT Incidents Table Schema (With alphanumeric ID support)

CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY, -- Supports alphanumeric formats like INC2526457
  application TEXT,
  business_service TEXT,
  short_description TEXT,
  description TEXT,
  impact TEXT,
  urgency TEXT,
  assigned_group TEXT,
  category TEXT,
  subcategory TEXT,
  environment TEXT,
  channel TEXT,
  root_cause TEXT,
  resolution_code TEXT,
  resolution_notes TEXT,
  sla_breached TEXT, -- 'Yes' or 'No'
  reassignment_count INTEGER DEFAULT 0,
  age_days INTEGER,
  mttr_hours NUMERIC,
  incident_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_incidents_application ON public.incidents(application);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON public.incidents(incident_date DESC);
