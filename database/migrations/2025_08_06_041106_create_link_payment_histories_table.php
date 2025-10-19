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
        Schema::create('link_payment_histories', function (Blueprint $table) {
            $table->id();
             $table->integer('reference_id');
            $table->string('inv_number');
            $table->string('inv_type');
            $table->decimal('link_amount');
            $table->integer('customer_id');
            $table->integer('linked_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_payment_histories');
    }
};
