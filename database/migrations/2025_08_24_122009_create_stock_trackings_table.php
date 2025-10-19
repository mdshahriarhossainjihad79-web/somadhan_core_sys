<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_trackings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->unsignedBigInteger('product_id')->unsigned();
            $table->foreign('product_id')->references('id')->on('products');
            $table->unsignedBigInteger('variant_id')->unsigned();
            $table->foreign('variant_id')->references('id')->on('variations');
            $table->integer('stock_id')->nullable();
            $table->string('batch_number')->nullable();
            $table->enum('reference_type', ['sale', 'purchase', 'return', 'damage', 'stock_transfer', 'stock_adjustment', 'quick_purchase', 'opening_stock', 'bulk_update']);
            $table->integer('reference_id')->nullable();
            $table->integer("quantity");
            $table->unsignedBigInteger('warehouse_id')->unsigned()->nullable();
            $table->foreign('warehouse_id')->references('id')->on('warehouses');
            $table->unsignedBigInteger('rack_id')->unsigned()->nullable();
            $table->foreign('rack_id')->references('id')->on('warehouse_racks');
            $table->integer('party_id')->nullable();
            $table->integer('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_trackings');
    }
};