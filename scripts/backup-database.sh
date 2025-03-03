#!/bin/bash

# Database Backup Script for MGM Platform
# This script creates backups of the PostgreSQL database and manages retention

# Configuration
BACKUP_DIR="/var/backups/mgm-database"
DB_NAME="mgm"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="db"
DB_PORT="5432"

# Retention settings
DAILY_RETENTION=7     # Keep daily backups for 7 days
WEEKLY_RETENTION=4    # Keep weekly backups for 4 weeks
MONTHLY_RETENTION=3   # Keep monthly backups for 3 months

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/daily"
mkdir -p "$BACKUP_DIR/weekly"
mkdir -p "$BACKUP_DIR/monthly"

# Get current date information
DATE=$(date +"%Y-%m-%d")
DAY_OF_WEEK=$(date +"%u")
DAY_OF_MONTH=$(date +"%d")

# Backup filename
BACKUP_FILENAME="mgm_backup_${DATE}.sql.gz"

# Create backup
echo "Creating database backup: $BACKUP_FILENAME"
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_DIR/daily/$BACKUP_FILENAME"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed successfully"
    
    # Create weekly backup (on Sunday, day 7)
    if [ "$DAY_OF_WEEK" = "7" ]; then
        echo "Creating weekly backup"
        cp "$BACKUP_DIR/daily/$BACKUP_FILENAME" "$BACKUP_DIR/weekly/$BACKUP_FILENAME"
    fi
    
    # Create monthly backup (on 1st day of month)
    if [ "$DAY_OF_MONTH" = "01" ]; then
        echo "Creating monthly backup"
        cp "$BACKUP_DIR/daily/$BACKUP_FILENAME" "$BACKUP_DIR/monthly/$BACKUP_FILENAME"
    fi
    
    # Cleanup old backups
    echo "Cleaning up old backups"
    
    # Remove daily backups older than DAILY_RETENTION days
    find "$BACKUP_DIR/daily" -name "*.sql.gz" -type f -mtime +$DAILY_RETENTION -delete
    
    # Remove weekly backups older than WEEKLY_RETENTION weeks
    find "$BACKUP_DIR/weekly" -name "*.sql.gz" -type f -mtime +$((WEEKLY_RETENTION * 7)) -delete
    
    # Remove monthly backups older than MONTHLY_RETENTION months
    find "$BACKUP_DIR/monthly" -name "*.sql.gz" -type f -mtime +$((MONTHLY_RETENTION * 30)) -delete
    
    echo "Backup process completed"
else
    echo "Error: Database backup failed"
    exit 1
fi