<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\Warranty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    public function index()
    {
        try {

            $warranties = Warranty::with('sale.customer', 'sale_item', 'product', 'variant.variationSize', 'variant.colorName')->latest()->get();

            return Inertia::render('Warranty/WarrantyPage', [
                'warranties' => $warranties,
            ]);
        } catch (\Exception $e) {
            // Log the exception message for debugging purposes
            Log::error('Error in index method: ' . $e->getMessage());

            // Return a custom error view with a user-friendly message and a 500 status code
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }


    public function warrantyCard($id)
    {
        try {

            $warranty = Warranty::with('sale.customer', 'sale_item', 'product', 'variant.variationSize', 'variant.colorName')->findOrFail($id);

            return Inertia::render('Warranty/WarrantyCard', [
                'warranty' => $warranty,
            ]);
        } catch (\Exception $e) {
            // Log the exception message for debugging purposes
            Log::error('Error in index method: ' . $e->getMessage());

            // Return a custom error view with a user-friendly message and a 500 status code
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }


    public function warrantyDelete($id)
    {
        try {

            $warranty = Warranty::findOrFail($id);
            $warranty->delete();

            session()->flash('success', 'Invoice deleted successfully.');
            return redirect()->back();
        } catch (\Exception $e) {
            // Log the exception message for debugging purposes
            Log::error('Error in index method: ' . $e->getMessage());

            // Return a custom error view with a user-friendly message and a 500 status code
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }
}
