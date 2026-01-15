# OPTIK Integration Testing Guide

**Quick Start Guide for Testing OPTIK → Factory Integration**

---

## Prerequisites

```bash
# Ensure dev server is running
cd /home/kali/dapp-website
npm run dev  # Should be on http://localhost:3003
```

---

## Test 1: Order Submission

### Request
```bash
curl -X POST http://localhost:3003/api/optik/submit-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "email": "test@optik.com",
      "deliveryWallet": "CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB",
      "company": "Test Company"
    },
    "productType": "dapp-only",
    "dappInfo": {
      "projectName": "Test OPTIK Integration",
      "description": "Testing the OPTIK to Factory integration layer",
      "features": ["wallet", "nft-minting", "staking"]
    },
    "dappTier": "tier-1",
    "meta": {
      "totalPrice": 4999,
      "currency": "USD",
      "referralCode": "TEST123",
      "campaign": "LAUNCH2026"
    }
  }'
```

### Expected Response
```json
{
  "success": true,
  "jobId": "SOME_GENERATION_ID",
  "optikJobId": "optik_1736600000_abc123",
  "treasuryWallet": "CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB",
  "paymentAmount": 1.1,
  "paymentCurrency": "SOL",
  "tier": "starter",
  "status": "pending_payment",
  "estimatedCompletionMinutes": 30,
  "message": "Order created successfully. Please complete payment to begin generation."
}
```

### Save the jobId
```bash
export JOB_ID="PASTE_JOB_ID_HERE"
```

---

## Test 2: Status Check (Before Payment)

### Request
```bash
curl http://localhost:3003/api/optik/status/$JOB_ID | jq
```

### Expected Response
```json
{
  "success": true,
  "jobId": "GENERATION_ID",
  "status": "pending",
  "rawStatus": "pending_payment",
  "progress": 0,
  "phase": "Awaiting Payment",
  "message": "Please complete payment to begin generation.",
  "createdAt": "2026-01-11T...",
  "estimatedRemainingMinutes": 30,
  "projectName": "Test OPTIK Integration",
  "projectType": "dapp",
  "tier": "starter",
  "payment": {
    "amount": 1.1,
    "currency": "SOL",
    "status": "pending",
    "confirmations": 0
  },
  "downloadAvailable": false
}
```

---

## Test 3: Payment Verification

### Step 1: Make Payment (Use Your Phantom Wallet)

Send 1.1 SOL to the treasury wallet:
- **To:** `CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB`
- **Amount:** 1.1 SOL
- **Network:** Devnet

### Step 2: Get Transaction Signature

Copy the transaction signature from Phantom or Solana Explorer.

### Step 3: Verify Payment
```bash
export TX_SIGNATURE="PASTE_YOUR_TX_SIGNATURE_HERE"

curl -X POST http://localhost:3003/api/optik/verify-payment \
  -H "Content-Type: application/json" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"transactionSignature\": \"$TX_SIGNATURE\",
    \"customerEmail\": \"test@optik.com\"
  }" | jq
```

### Expected Response
```json
{
  "success": true,
  "verified": true,
  "status": "payment_confirmed",
  "confirmations": 15,
  "message": "Payment verified. Generation starting...",
  "estimatedCompletionMinutes": 30,
  "processingTime": 1234
}
```

---

## Test 4: Poll Status During Generation

```bash
# Poll every 3 seconds
watch -n 3 "curl -s http://localhost:3003/api/optik/status/$JOB_ID | jq '.status, .progress, .phase'"
```

### Status Progression
```
"pending" → 0% → "Awaiting Payment"
"processing" → 20% → "Payment Confirmed - Initializing"
"processing" → 50% → "Smart Contract Development"
"processing" → 85% → "Final Quality Check"
"completed" → 100% → "Ready for Download"
```

### Wait for Completion
Generation typically takes 30-60 seconds. Status will show `"completed"` when ready.

---

## Test 5: Check Download Availability

### Request
```bash
curl -I http://localhost:3003/api/optik/download/$JOB_ID
```

### Expected Response
```
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Length: 4567
X-Download-Available: true
X-Download-Count: 0
X-Downloads-Remaining: 10
```

---

## Test 6: Download File

### Request
```bash
curl -o optik-test-dapp.zip http://localhost:3003/api/optik/download/$JOB_ID
```

### Verify Download
```bash
# Check file size
ls -lh optik-test-dapp.zip

# Extract and inspect
unzip -l optik-test-dapp.zip

# Should contain:
# - package.json
# - README.md
# - .gitignore
# - .env.example
# - tsconfig.json
# - .eslintrc.json
# - src/ directory with generated files
```

---

## Test 7: Multiple Downloads

### Download Again
```bash
curl -o optik-test-dapp-2.zip http://localhost:3003/api/optik/download/$JOB_ID
```

### Check Download Count
```bash
curl http://localhost:3003/api/optik/status/$JOB_ID | jq '.downloadCount, .downloadLimit'

# Should show:
# 2
# 10
```

---

## Test 8: Error Handling - Invalid Job ID

### Request
```bash
curl http://localhost:3003/api/optik/status/INVALID_ID_12345 | jq
```

### Expected Response
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## Test 9: Error Handling - Invalid Order Data

### Request
```bash
curl -X POST http://localhost:3003/api/optik/submit-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "email": "not-an-email",
      "deliveryWallet": "TOO_SHORT"
    },
    "productType": "invalid-type"
  }' | jq
```

### Expected Response
```json
{
  "success": false,
  "error": "Invalid order data",
  "details": [
    {
      "field": "customerInfo.email",
      "message": "Invalid email"
    },
    {
      "field": "customerInfo.deliveryWallet",
      "message": "String must contain at least 32 character(s)"
    },
    {
      "field": "productType",
      "message": "Invalid enum value..."
    }
  ]
}
```

---

## Test 10: Complete Flow (Script)

Create a test script:

```bash
#!/bin/bash
# File: test-optik-integration.sh

set -e

echo "🚀 Testing OPTIK Integration..."
echo ""

# 1. Submit Order
echo "📝 Step 1: Submitting order..."
RESPONSE=$(curl -s -X POST http://localhost:3003/api/optik/submit-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "email": "test@optik.com",
      "deliveryWallet": "CS4y3Ee2ZaXuwHheWgZ9Mosd2EGx1RfKqVGiAnnJ58XB"
    },
    "productType": "dapp-only",
    "dappInfo": {
      "projectName": "Automated Test",
      "description": "Automated integration test",
      "features": ["wallet"]
    },
    "dappTier": "tier-1",
    "meta": {
      "totalPrice": 4999,
      "currency": "USD"
    }
  }')

JOB_ID=$(echo $RESPONSE | jq -r '.jobId')
TREASURY=$(echo $RESPONSE | jq -r '.treasuryWallet')
AMOUNT=$(echo $RESPONSE | jq -r '.paymentAmount')

echo "✅ Order created!"
echo "   Job ID: $JOB_ID"
echo "   Treasury: $TREASURY"
echo "   Amount: $AMOUNT SOL"
echo ""

# 2. Check Status
echo "📊 Step 2: Checking status..."
STATUS=$(curl -s http://localhost:3003/api/optik/status/$JOB_ID | jq -r '.status')
echo "✅ Status: $STATUS"
echo ""

# 3. Payment Instructions
echo "💰 Step 3: Payment Required"
echo "   Please send $AMOUNT SOL to $TREASURY"
echo "   Then run: export TX_SIG='your_transaction_signature'"
echo "   Then run: curl -X POST http://localhost:3003/api/optik/verify-payment \\"
echo "             -H 'Content-Type: application/json' \\"
echo "             -d '{\"jobId\":\"$JOB_ID\",\"transactionSignature\":\"'\$TX_SIG'\"}'"
echo ""

# Save job ID for later steps
echo $JOB_ID > /tmp/last-optik-job-id.txt
echo "📝 Job ID saved to /tmp/last-optik-job-id.txt"
```

Make it executable:
```bash
chmod +x test-optik-integration.sh
./test-optik-integration.sh
```

---

## Monitoring Logs

### Watch Factory Logs
```bash
# In the terminal where npm run dev is running, you'll see:
[OPTIK Integration] New OPTIK order received [REQUEST_ID]
[OPTIK Integration] Order validated [REQUEST_ID] {productType: "dapp-only", ...}
[OPTIK Integration] Generation created [REQUEST_ID] {generationId: "...", tier: "starter"}
[OPTIK Integration] Order processed successfully [REQUEST_ID] in 234ms

[OPTIK Payment] Payment verification request [REQUEST_ID]
[OPTIK Payment] Verifying payment [REQUEST_ID] {jobId: "...", signature: "..."}
[OPTIK Payment] Payment confirmed [REQUEST_ID] {confirmations: 15}

[OPTIK Download] Download request {jobId: "..."}
[OPTIK Download] Download successful {downloadNumber: 1, fileSize: 4567}
```

---

## Troubleshooting

### Issue: "Generation not found"
**Cause:** Invalid job ID or generation not created
**Solution:** Check job ID from submit-order response

### Issue: "Payment verification failed"
**Cause:** Transaction not confirmed, wrong amount, or wrong wallet
**Solution:**
- Wait 30 seconds for confirmation
- Check transaction on Solana Explorer
- Verify you sent to correct treasury wallet

### Issue: "Download not available"
**Cause:** Generation not completed or expired
**Solution:** Check status endpoint, wait for "completed" status

### Issue: "Download limit reached"
**Cause:** Downloaded 10 times already
**Solution:** Contact support or generate new order

### Issue: "Order already confirmed"
**Cause:** Payment already verified
**Solution:** This is OK, proceed to check status

---

## Success Criteria

✅ Order submission creates generation and returns job ID
✅ Status endpoint returns correct status before payment
✅ Payment verification accepts valid transaction
✅ Status updates to "processing" after payment
✅ Generation completes and status shows "completed"
✅ Download endpoint serves valid ZIP file
✅ Downloaded file contains all expected files
✅ Multiple downloads work up to limit
✅ Error responses are clear and helpful
✅ Logs show all operations with request IDs

---

## Next Steps

After successful testing:

1. **Document Results**
   ```bash
   # Create test report
   echo "OPTIK Integration Test Results" > test-results.txt
   echo "Date: $(date)" >> test-results.txt
   echo "Job ID: $JOB_ID" >> test-results.txt
   echo "Status: ✅ All tests passed" >> test-results.txt
   ```

2. **Share with Team**
   - Document any issues found
   - Share successful flow screenshots
   - Update integration documentation

3. **Production Readiness**
   - Add API key authentication
   - Implement rate limiting
   - Set up monitoring alerts
   - Test with OPTIK frontend

---

## Quick Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Create Order | `/api/optik/submit-order` | POST |
| Verify Payment | `/api/optik/verify-payment` | POST |
| Check Status | `/api/optik/status/[jobId]` | GET |
| Download File | `/api/optik/download/[jobId]` | GET |
| Check Download | `/api/optik/download/[jobId]` | HEAD |

---

**Last Updated:** January 11, 2026
**Status:** Ready for Testing
