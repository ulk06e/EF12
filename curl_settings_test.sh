#!/bin/bash

# Edit these URLs as needed
BACKEND_URL="https://ulk06e-ef12-0b57.twc1.net"
FRONTEND_URL="http://localhost:3000"  # Change to your deployed frontend if needed
USER_ID="default"  # User id to test (change if needed)

# Test backend endpoint
echo "Testing backend: $BACKEND_URL/settings/$USER_ID"
BACKEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/settings/$USER_ID")
BACKEND_BODY=$(echo "$BACKEND_RESPONSE" | head -n -1)
BACKEND_STATUS=$(echo "$BACKEND_RESPONSE" | tail -n1)
echo "Backend status: $BACKEND_STATUS"
echo "Backend response: $BACKEND_BODY"
echo

# Test frontend endpoint
echo "Testing frontend: $FRONTEND_URL/settings/$USER_ID"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/settings/$USER_ID")
FRONTEND_BODY=$(echo "$FRONTEND_RESPONSE" | head -n -1)
FRONTEND_STATUS=$(echo "$FRONTEND_RESPONSE" | tail -n1)
echo "Frontend status: $FRONTEND_STATUS"
echo "Frontend response: $FRONTEND_BODY"
echo

# Compare results
if [ "$BACKEND_STATUS" = "$FRONTEND_STATUS" ] && [ "$BACKEND_BODY" = "$FRONTEND_BODY" ]; then
  echo "✅ Backend and frontend responses MATCH."
else
  echo "❌ Backend and frontend responses DIFFER."
fi 