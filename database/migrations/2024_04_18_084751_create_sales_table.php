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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->unsignedBigInteger('customer_id')->unsigned();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->date('sale_date')->nullable();
            $table->string('invoice_number')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable();
            $table->integer('quantity')->default(0); // total product quantity
            $table->decimal('product_total', 12, 2)->default(0); // total product price
            $table->decimal('discount')->default(0);
            $table->decimal('actual_discount', 12, 2)->default(0); // calculated discount
            $table->decimal('tax', 12, 2)->default(0); // receivable after discount and tax
            $table->decimal('invoice_total', 12, 2)->default(0); // receivable after discount and tax
            $table->decimal('additional_charge_total')->default(0);
            $table->decimal('grand_total', 12, 2)->default(0); // after additional charge Total
            $table->decimal('paid', 12, 2)->default(0); // total paid
            $table->decimal('due', 12, 2)->default(0); // updated due
            $table->decimal('change_amount', 12, 2)->default(0); // change amount after paid extra
            $table->decimal('total_purchase_cost', 12, 2)->default(0); // updated after return
            $table->decimal('profit', 10, 2)->default(0);
            $table->enum('status', ['paid', 'unpaid', 'partial']);
            $table->enum('order_status', ['draft', 'completed', 'returned', 'updated']);
            $table->enum('courier_status', ['not_send', 'send'])->default('not_send');
            $table->enum('order_type', ['general', 'online'])->default('general');
            $table->unsignedBigInteger('created_by')->unsigned()->nullable();
            $table->foreign('created_by')->references('id')->on('users');
            $table->unsignedBigInteger('updated_by')->unsigned()->nullable();
            $table->foreign('updated_by')->references('id')->on('users');
            $table->text('note')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};