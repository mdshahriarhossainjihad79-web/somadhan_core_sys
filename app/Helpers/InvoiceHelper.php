<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class InvoiceHelper
{
    /**
     * Generate a unique invoice number for a given model, field, and digit length.
     *
     * @param string $model The fully qualified model class name (e.g., App\Models\BankToBankTransfer::class)
     * @param string $field The field name to check for uniqueness (e.g., 'invoice')
     * @param int $digits The number of digits for the invoice number (e.g., 6 for 000001)
     * @return string The unique invoice number
     * @throws \InvalidArgumentException If digits are invalid
     */
    public static function generateUniqueInvoice($model, $field, $digits = 6)
    {
        // Validate inputs
        if (!class_exists($model)) {
            throw new \InvalidArgumentException("Model class {$model} does not exist.");
        }
        if (!is_string($field) || empty($field)) {
            throw new \InvalidArgumentException("Field name must be a non-empty string.");
        }
        if (!is_int($digits) || $digits < 1 || $digits > 18) {
            throw new \InvalidArgumentException("Digits must be an integer between 1 and 18.");
        }

        // Calculate min and max based on digits
        $min = pow(10, $digits - 1); // e.g., 100000 for 6 digits
        $max = pow(10, $digits) - 1; // e.g., 999999 for 6 digits

        do {
            $invoice = str_pad(random_int($min, $max), $digits, '0', STR_PAD_LEFT);
        } while ($model::where($field, $invoice)->exists());

        return $invoice;
    }
}