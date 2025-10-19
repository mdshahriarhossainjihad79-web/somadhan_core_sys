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
        Schema::create('party_statements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->integer('party_id')->nullable()->comment('Customer ,Supplier and Both');
            $table->date('date')->nullable()->comment('Transaction Date');
            $table->enum('reference_type', ['sale', 'purchase', 'return', 'opening_due', 'service_sale', 'receive', 'pay','service_sale_payments']);
            $table->unsignedBigInteger('reference_id')->unsigned()->nullable();
            $table->decimal('debit', 12, 2)->default(0)->comment('receive');
            $table->decimal('credit', 12, 2)->default(0)->comment('pay');
            $table->unsignedBigInteger('created_by')->unsigned()->nullable();
            $table->foreign('created_by')->references('id')->on('users');
            $table->unsignedBigInteger('updated_by')->unsigned()->nullable();
            $table->foreign('updated_by')->references('id')->on('users');
            $table->enum('status', ['used', 'unused', 'partial'])->nullable()->comment('used ,unused ,partial');
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('party_statements');
    }
};
