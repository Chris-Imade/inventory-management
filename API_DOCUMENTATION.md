# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints (except `/auth/login`) require authentication via session cookies or JWT token.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "admin",
    "lastLogin": "2024-01-12T15:30:00.000Z"
  }
}
```

### Logout
```http
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Inventory Management

### Get All Items
```http
GET /api/inventory?category=medication&search=para&lowStock=true

Response:
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### Get Item by Barcode
```http
GET /api/inventory/barcode/MED170000001234

Response:
{
  "success": true,
  "data": {
    "itemName": "Paracetamol 500mg",
    "barcode": "MED170000001234",
    "quantity": 100,
    ...
  }
}
```

### Create Item
```http
POST /api/inventory
Content-Type: application/json

{
  "itemName": "Paracetamol 500mg Tablets",
  "sku": "MED-PARA-500",
  "category": "medication",
  "unitType": "strip",
  "quantity": 100,
  "unitPrice": 0.50,
  "sellingPrice": 1.00,
  "minimumStock": 20,
  "expirationDate": "2025-12-31",
  "manufacturer": "PharmaCorp",
  "batchNumber": "BATCH-2024-001"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Update Item
```http
PUT /api/inventory/:id
Content-Type: application/json

{
  "quantity": 150,
  "sellingPrice": 1.25
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Adjust Quantity
```http
PATCH /api/inventory/:id/adjust
Content-Type: application/json

{
  "adjustment": -10,
  "reason": "Damaged items removed"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

## Point of Sale

### Scan Barcode
```http
POST /api/pos/scan
Content-Type: application/json

{
  "barcode": "MED170000001234"
}

Response:
{
  "success": true,
  "data": {
    "itemName": "Paracetamol 500mg",
    "sellingPrice": 1.00,
    "quantity": 100,
    ...
  }
}
```

### Process Transaction
```http
POST /api/pos/checkout
Content-Type: application/json

{
  "lineItems": [
    {
      "inventoryItem": "item_id_1",
      "quantity": 2
    },
    {
      "inventoryItem": "item_id_2",
      "quantity": 1
    }
  ],
  "paymentMethod": "cash",
  "patientName": "John Doe",
  "patientId": "P12345",
  "prescriptionNumber": "RX-2024-001"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "TXN-1234567890-ABCD1234",
    "status": "COMPLETED",
    "totalAmount": 15.50,
    ...
  }
}
```

## Transactions

### Get All Transactions
```http
GET /api/transactions?status=COMPLETED&startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "success": true,
  "count": 25,
  "data": [...]
}
```

### Cancel Transaction
```http
POST /api/transactions/:id/cancel
Content-Type: application/json

{
  "cancellationReason": "Customer returned items - defective product"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "TXN-1234567890-ABCD1234",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-12T16:00:00.000Z",
    "cancellationReason": "Customer returned items - defective product",
    ...
  }
}
```

### Print Receipt
```http
GET /api/transactions/:id/print

Response:
{
  "success": true,
  "message": "Receipt printed successfully",
  "receipt": "text-based receipt content"
}
```

## Alerts

### Get All Alerts
```http
GET /api/alerts?severity=critical&unreadOnly=true

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "type": "LOW_STOCK",
      "severity": "critical",
      "message": "Paracetamol 500mg is low on stock (5 remaining)",
      "isRead": false,
      "inventoryItem": { ... }
    }
  ]
}
```

### Generate Alerts
```http
POST /api/alerts/generate

Response:
{
  "success": true,
  "count": 8,
  "data": [...]
}
```

## Reports

### Inventory Report
```http
GET /api/reports/inventory?format=pdf&category=medication

Response: PDF file download
```

### Transaction Report
```http
GET /api/reports/transactions?startDate=2024-01-01&endDate=2024-01-31&format=csv

Response: CSV file download
```

### Low Stock Report
```http
GET /api/reports/low-stock?format=json

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "count": 12,
    "generatedAt": "2024-01-12T16:00:00.000Z"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
