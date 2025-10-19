<?php

namespace App\Http\Controllers\Goods;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoodsController extends Controller
{
    public function index()
    {
        try {

            $categories = Category::get();

            return Inertia::render('Goods/NewGoods', [
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            // Log the exception message for debugging purposes
            Log::error('Error in index method: ' . $e->getMessage());

            // Return a custom error view with a user-friendly message and a 500 status code
            return response()->view('errors.500', ['message' => 'Something went wrong. Please try again later.'], 500);
        }
    }
}
