
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='process-fanout-queue-job') THEN
    PERFORM cron.unschedule('process-fanout-queue-job');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='process-rank-queue-job') THEN
    PERFORM cron.unschedule('process-rank-queue-job');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='refresh-leaderboard-job') THEN
    PERFORM cron.unschedule('refresh-leaderboard-job');
  END IF;
END $$;

SELECT cron.schedule(
  'process-fanout-queue-job',
  '* * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://ztmmwxfnkydhjdxmdueg.supabase.co/functions/v1/process-fanout-queue',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bW13eGZua3lkaGpkeG1kdWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTk5MzYsImV4cCI6MjA4NDgzNTkzNn0.6pmXZvEARs-CxnsPqtW7X_4H-V2hx1Q_m4eoM0JogzQ"}'::jsonb,
    body := '{}'::jsonb
  );
  $job$
);

SELECT cron.schedule(
  'process-rank-queue-job',
  '*/2 * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://ztmmwxfnkydhjdxmdueg.supabase.co/functions/v1/process-rank-queue',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bW13eGZua3lkaGpkeG1kdWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTk5MzYsImV4cCI6MjA4NDgzNTkzNn0.6pmXZvEARs-CxnsPqtW7X_4H-V2hx1Q_m4eoM0JogzQ"}'::jsonb,
    body := '{}'::jsonb
  );
  $job$
);

SELECT cron.schedule(
  'refresh-leaderboard-job',
  '*/5 * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://ztmmwxfnkydhjdxmdueg.supabase.co/functions/v1/refresh-leaderboard',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bW13eGZua3lkaGpkeG1kdWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNTk5MzYsImV4cCI6MjA4NDgzNTkzNn0.6pmXZvEARs-CxnsPqtW7X_4H-V2hx1Q_m4eoM0JogzQ"}'::jsonb,
    body := '{}'::jsonb
  );
  $job$
);
