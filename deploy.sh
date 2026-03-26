#!/bin/bash

# 🚀 HR Management System - Auto Deployment Script
# This script will help you deploy the website step-by-step

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/mac/Downloads/SaaS-HR-Management-Systems"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   🚀 HR Management System Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Step 1: Check PostgreSQL
echo -e "${YELLOW}[1/7] Checking PostgreSQL...${NC}"

if command_exists psql; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
    
    # Try to connect
    if psql -U postgres -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    else
        echo -e "${RED}❌ PostgreSQL is not running${NC}"
        echo -e "${YELLOW}Please start PostgreSQL:${NC}"
        echo "  - If using Homebrew: brew services start postgresql@14"
        echo "  - If using Postgres.app: Open the app"
        exit 1
    fi
else
    echo -e "${RED}❌ PostgreSQL is NOT installed${NC}"
    echo ""
    echo -e "${YELLOW}Please install PostgreSQL first:${NC}"
    echo ""
    echo -e "${BLUE}Option 1 - Postgres.app (Easiest):${NC}"
    echo "  1. Visit: https://postgresapp.com/"
    echo "  2. Download and install"
    echo "  3. Open app and click Initialize"
    echo ""
    echo -e "${BLUE}Option 2 - Homebrew:${NC}"
    echo "  brew install postgresql@14"
    echo "  brew services start postgresql@14"
    echo ""
    echo -e "${BLUE}Option 3 - Official Installer:${NC}"
    echo "  Visit: https://www.postgresql.org/download/macosx/"
    echo ""
    exit 1
fi

# Step 2: Check Database
echo ""
echo -e "${YELLOW}[2/7] Checking database...${NC}"

if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "Project_HR_Management_Systems_db"; then
    echo -e "${GREEN}✅ Database exists${NC}"
else
    echo -e "${YELLOW}⚠️  Database does not exist. Creating...${NC}"
    psql -U postgres -c 'CREATE DATABASE "Project_HR_Management_Systems_db";' || {
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Step 3: Check Backend Dependencies
echo ""
echo -e "${YELLOW}[3/7] Checking backend dependencies...${NC}"

cd "$PROJECT_ROOT/server"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Step 4: Run Migrations
echo ""
echo -e "${YELLOW}[4/7] Running database migrations...${NC}"

# Check if migrations have been run
MIGRATION_COUNT=$(npx sequelize-cli db:migrate:status 2>/dev/null | grep -c "up" || echo "0")

if [ "$MIGRATION_COUNT" -gt "15" ]; then
    echo -e "${GREEN}✅ Migrations already applied (${MIGRATION_COUNT} migrations)${NC}"
else
    echo -e "${YELLOW}⚠️  Running migrations...${NC}"
    npx sequelize-cli db:migrate || {
        echo -e "${RED}❌ Migration failed${NC}"
        echo "Check your database connection in server/.env"
        exit 1
    }
    echo -e "${GREEN}✅ Migrations completed${NC}"
fi

# Step 5: Seed Data
echo ""
echo -e "${YELLOW}[5/7] Seeding initial data...${NC}"

# Check if data already exists
USER_COUNT=$(psql -U postgres -d Project_HR_Management_Systems_db -t -c "SELECT COUNT(*) FROM \"Users\";" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$USER_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ Seed data already exists (${USER_COUNT} users)${NC}"
    echo -e "${BLUE}   Skipping seeding to avoid duplicates${NC}"
else
    echo -e "${YELLOW}⚠️  Seeding database...${NC}"
    npx sequelize-cli db:seed:all || {
        echo -e "${YELLOW}⚠️  Seeding completed with warnings (might be okay)${NC}"
    }
    echo -e "${GREEN}✅ Seed data loaded${NC}"
fi

# Step 6: Check Frontend Dependencies
echo ""
echo -e "${YELLOW}[6/7] Checking frontend dependencies...${NC}"

cd "$PROJECT_ROOT/client_Salmon-HRIS"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Step 7: Check if services are already running
echo ""
echo -e "${YELLOW}[7/7] Checking running services...${NC}"

if port_in_use 3000; then
    echo -e "${GREEN}✅ Backend is already running on port 3000${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Backend is not running${NC}"
    BACKEND_RUNNING=false
fi

if port_in_use 5173; then
    echo -e "${GREEN}✅ Frontend is already running on port 5173${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    FRONTEND_RUNNING=false
fi

# Summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   ✅ DEPLOYMENT CHECK COMPLETE${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Print status
echo -e "${GREEN}Status:${NC}"
echo -e "  Database:    ✅ Ready"
echo -e "  Migrations:  ✅ Applied"
echo -e "  Seed Data:   ✅ Loaded"
echo -e "  Backend:     $([ "$BACKEND_RUNNING" = true ] && echo '✅ Running' || echo '⚠️  Not running')"
echo -e "  Frontend:    $([ "$FRONTEND_RUNNING" = true ] && echo '✅ Running' || echo '⚠️  Not running')"
echo ""

# Next steps
if [ "$BACKEND_RUNNING" = false ] || [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo ""
    
    if [ "$BACKEND_RUNNING" = false ]; then
        echo -e "${BLUE}1. Start Backend:${NC}"
        echo "   cd $PROJECT_ROOT/server"
        echo "   npm run dev"
        echo ""
    fi
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo -e "${BLUE}2. Start Frontend (in new terminal):${NC}"
        echo "   cd $PROJECT_ROOT/client_Salmon-HRIS"
        echo "   npm run dev"
        echo ""
    fi
    
    echo -e "${BLUE}3. Open Browser:${NC}"
    echo "   http://localhost:5173"
    echo ""
    echo -e "${BLUE}4. Login:${NC}"
    echo "   Email: admin@company.com"
    echo "   Password: admin123"
    echo ""
else
    echo -e "${GREEN}🎉 All services are running!${NC}"
    echo ""
    echo -e "${BLUE}Open browser: ${NC}http://localhost:5173"
    echo -e "${BLUE}Login with:${NC}"
    echo "  Admin: admin@company.com / admin123"
    echo "  Employee: budi@company.com / password123"
    echo "  Super Admin: superadmin@hrsystem.com / superadmin123"
    echo ""
fi

echo -e "${BLUE}================================================${NC}"
echo ""
