<?php

namespace App\Helpers;

use App\Models\Purchase;

class GenerateBatchNumber
{
    public static function generateUniqueBatchNumber()
    {
        do {
            $randomNumber = mt_rand(10000000, 99999999); // Generate 8-digit random number
            $batchNumber = 'BT' . $randomNumber; // Prefix with "BT"
        } while (Purchase::where('batch_no', $batchNumber)->exists()); // Check for uniqueness

        return $batchNumber;
    }
}