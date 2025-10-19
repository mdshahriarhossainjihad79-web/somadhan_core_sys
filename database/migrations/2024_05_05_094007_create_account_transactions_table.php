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
        Schema::create('account_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->foreign('account_id')->references('id')->on('banks')->onDelete('cascade');
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->bigInteger('reference_id')->nullable();
            $table->enum('purpose', ['sale', 'purchase', 'sale_edit', 'purchase_edit', 'return', 'service_sale', 'service_sale_payments', 'transaction', 'bank', 'expanse', 'expanse_edit', 'salary', 'party_pay', 'party_receive', 'investor_pay', 'investor_receive', 'from_bank_transfer', 'to_bank_transfer', 'to_bank_transfer_update', 'from_bank_transfer_update', 'bank_adjustments_decrease', 'bank_adjustments_increase', 'quick_purchase', 'affliate_payment', 'bank_opening_balance','loan','loan_repayments'])->nullable();
            $table->decimal('debit', 12, 2)->default(0);
            $table->decimal('credit', 12, 2)->default(0);
            $table->text('note')->nullable();
            $table->string('transaction_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->foreign('updated_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_transactions');
    }
};
