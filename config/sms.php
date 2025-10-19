<?php

return [
    'api_key' => env('SMS_API_KEY', 'default_api_key'),
    'sender_id' => env('SMS_SENDER_ID', 'default_sender_id'),
    'api_url' => env('SMS_API_URL', 'http://bulksmsbd.net/api/smsapi'),
];
