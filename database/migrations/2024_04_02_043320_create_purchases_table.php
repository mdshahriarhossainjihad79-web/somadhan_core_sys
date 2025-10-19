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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->unsignedBigInteger('party_id')->unsigned();
            $table->foreign('party_id')->references('id')->on('customers')->onDelete('cascade');
            $table->date('purchase_date');
            $table->decimal('total_quantity', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->string('invoice')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable();
            $table->decimal('discount_amount', 12, 2)->nullable();
            $table->decimal('sub_total', 12, 2);
            $table->integer('tax')->nullable();
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('paid', 12, 2)->default(0);
            $table->decimal('due', 12, 2)->default(0);
            $table->decimal('total_purchase_cost', 10, 2)->default(0);
            $table->enum('payment_status', ['paid', 'unpaid', 'partial']);
            $table->enum('order_status', ['draft', 'completed', 'returned', 'updated', 'pre_order']);
            $table->enum('purchase_type', ['quick', 'normal'])->default('normal');
            $table->string('document')->nullable();
            $table->string('batch_no')->nullable()->unique();
            $table->unsignedBigInteger('created_by')->unsigned()->nullable();
            $table->foreign('created_by')->references('id')->on('users');
            $table->unsignedBigInteger('update_by')->unsigned()->nullable();
            $table->foreign('update_by')->references('id')->on('users');
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
