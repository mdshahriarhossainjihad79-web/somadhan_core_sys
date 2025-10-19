<?php


if (!function_exists('generate_unique_invoice')) {
    /**
     * Generate a unique invoice number for a given model, field, and digit length.
     *
     * @param string $model The fully qualified model class name
     * @param string $field The field name to check for uniqueness
     * @param int $digits The number of digits for the invoice number
     * @return string The unique invoice number
     */
    function generate_unique_invoice($model, $field, $digits = 6)
    {
        return App\Helpers\InvoiceHelper::generateUniqueInvoice($model, $field, $digits);
    }
}


function calculate_Balance($customer)
{
    return App\Helpers\PartyBalanceCalculation::calculateWalletBalance($customer);
}

function generate_batch_number()
{
    return App\Helpers\GenerateBatchNumber::generateUniqueBatchNumber();
}
function process_stock_operations($variants, $branchId, $allVariants, $referenceId, $referenceType = 'sale', $partyId)
{
    return App\Helpers\StockHelper::processStockOperations($variants, $branchId, $allVariants, $referenceId, $referenceType, $partyId);
}
