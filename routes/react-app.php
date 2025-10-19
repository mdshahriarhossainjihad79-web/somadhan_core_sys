<?php

use App\Http\Controllers\AdditionalCharge\AdditionalChargeController;
use App\Http\Controllers\Goods\GoodsController;
use App\Http\Controllers\Pos\PosPageController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Sale\SaleManageController;
use App\Http\Controllers\Sale\SalePageController;
use App\Http\Controllers\Stock\StockTrackingController;
use App\Http\Controllers\Warranty\WarrantyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(SalePageController::class)->group(function () {
        Route::get('/sale-page', 'index')->name('sale.page');
        Route::match(['get', 'post'], '/generate-sale-invoice', 'generatedInvoiceNumber');
        Route::post('/update-pos-setting', 'updatePosSetting');
        Route::post('/customer/add', 'addCustomer');
        Route::get('/stock-data', 'getStockData');
        Route::post('/sale-store', "store");
        Route::post('/sale-store/multiple-payment', "multiplePaySale");
        Route::post('/draft/sale-store', "draftSale");
        Route::get('/sale-invoice/print/{id}', "printInvoice");
        Route::get('/sale-invoice/pos-print/{id}', "posPrintInvoice");
        Route::get('/sale-table/manage', "saleTable");
        Route::post('/supplier/add', 'addSupplier');
        Route::post('/quick-purchase', 'quickPurchase');
        Route::get('/sale/duplicate/invoice/{id}', "duplicateInvoice");
    });

    Route::controller(PosPageController::class)->group(function () {
        Route::get('/pos-page', 'index')->name('pos.page');
    });

    // sale manage related Route
    Route::controller(SaleManageController::class)->group(function () {
        Route::get('/sale-table/manage', "saleTable")->name('sale.table.manage');
        Route::delete('/sale/delete/{id}', 'destroy');
        Route::post('/sale/payment/{id}', 'salePayment');
        Route::get('/sales/search', "searchSales");
    });


    // sale manage related Route
    Route::controller(ProductController::class)->group(function () {
        Route::post('/via-product/store', 'store');
    });

    // goods related route
    Route::controller(GoodsController::class)->group(function () {
        Route::get('/goods-new', 'index')->name('goods.new');
    });

    // additional charge related route
    Route::controller(AdditionalChargeController::class)->group(function () {
        Route::post('/additional-charge-name/store', 'store');
    });

    // Warranty related route
    Route::controller(WarrantyController::class)->group(function () {
        Route::get('/warranty/manage', 'index')->name('warranty.manage');
        Route::get('/warranty/card/{id}', 'warrantyCard');
        Route::delete('/warranty/delete/{id}', 'warrantyDelete');
    });

    // Stock tracking related route
    Route::controller(StockTrackingController::class)->group(function () {
        Route::get('/stock/tracking', 'index')->name('stock.tracking.manage');
    });
});
