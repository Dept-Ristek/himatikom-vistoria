#!/bin/bash

# Get token for user ID 1
TOKEN=$(mysql -u daeng -ppass -h 127.0.0.1 db_himatikom -se "SELECT tokens FROM sanctum_personal_access_tokens WHERE tokenable_id = 1 LIMIT 1" | head -1)

if [ -z "$TOKEN" ]; then
  echo "Token tidak ditemukan, buat token baru..."
  php artisan tinker << 'PHP'
$user = \App\Models\User::find(1);
$token = $user->createToken('test-token')->plainTextToken;
echo "Token: " . $token;
PHP
fi

echo "===================="
echo "Testing API Registration"
echo "===================="

# Test 1: Register ke 2 divisi (ID: 5 dan 6)
echo -e "\n[TEST 1] Register ke 2 divisi"
curl -X POST http://localhost:8000/api/committee-forms/register \
  -H "Authorization: Bearer test-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 2,
    "division_ids": [5, 6],
    "answers": [
      {"question_id": 1, "answer": "Jawaban Test 1"},
      {"question_id": 2, "answer": "Option1"},
      {"question_id": 3, "answer": "Radio 1"}
    ]
  }' 2>/dev/null | python3 -m json.tool

# Test 2: Lihat registrasi dari admin
echo -e "\n\n[TEST 2] Admin lihat registrasi"
curl -X GET http://localhost:8000/api/committee-forms/2/registrations \
  -H "Authorization: Bearer test-token-here" 2>/dev/null | python3 -m json.tool

