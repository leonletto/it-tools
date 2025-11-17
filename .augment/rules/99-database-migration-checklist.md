---
description:
  Database migration procedures and checklist - invoke with @database-migration
  when planning database changes
alwaysApply: false
---

# Database Migration Checklist

## Pre-Migration

- [ ] Review schema changes with team
- [ ] Create backup of current database
- [ ] Test migration on development environment
- [ ] Test migration on staging environment with production-like data
- [ ] Prepare rollback script
- [ ] Document all schema changes
- [ ] Update ORM models/migrations
- [ ] Check for data dependencies
- [ ] Identify affected application code
- [ ] Plan for zero-downtime deployment if needed

## Migration Execution

- [ ] Announce maintenance window (if downtime required)
- [ ] Create production database backup
- [ ] Put application in maintenance mode (if needed)
- [ ] Run migration script
- [ ] Verify migration success (check logs)
- [ ] Run smoke tests on critical paths
- [ ] Monitor application logs for errors
- [ ] Monitor database performance metrics

## Post-Migration

- [ ] Verify all tables/columns created correctly
- [ ] Check indexes are in place
- [ ] Verify data integrity
- [ ] Run full test suite
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Remove maintenance mode
- [ ] Document any issues encountered
- [ ] Update team on completion

## Rollback Plan (If Issues Occur)

- [ ] Put application in maintenance mode
- [ ] Run rollback script
- [ ] Restore from backup (if necessary)
- [ ] Verify rollback success
- [ ] Document root cause
- [ ] Plan corrective actions
