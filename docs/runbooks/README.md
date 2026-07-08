# YourRank Runbooks

Symptom → Check → Fix for each golden path.

## Health Check Failure
**Symptom:** GET /health returns non-200 or db: false
**Check:** CF Workers dashboard → Logs; Supabase dashboard → DB Health; Hyperdrive status
**Fix:** Supabase auto-recovers; check Hyperdrive in CF dashboard; rollback Worker if crashing

## Redirect Not Working
**Symptom:** GET /r/:slug returns 404 or 500
**Check:** SELECT * FROM short_links WHERE slug = '...'; check bot Worker logs
**Fix:** Create new tracked link; activate offer in dashboard; rollback if Worker error

## Bot Not Responding
**Symptom:** Telegram bot doesn't reply
**Check:** Bot Worker logs; getWebhookInfo API; bots table status
**Fix:** Re-run bot onboarding; check admin panel; rollback if Worker crashing

## Payment Not Processing
**Symptom:** User paid but plan not upgraded
**Check:** payments table; NOWPayments dashboard; IPN handler logs
**Fix:** Check webhook URL; verify HMAC; manual activation via admin API

## Rate Limiting Issues
**Symptom:** Users getting 429 errors
**Check:** KV keys with rl: prefix; RL_BACKEND setting
**Fix:** Switch to DO (RL_BACKEND=do); increase limits; enable CF DDoS protection
