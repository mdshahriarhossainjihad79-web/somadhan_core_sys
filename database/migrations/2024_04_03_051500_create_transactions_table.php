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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->unsigned();
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->date('date')->nullable();
            $table->integer('processed_by')->nullable();
            $table->enum('payment_type', ['receive', 'pay'])->comment('Receive or Pay');
            $table->integer('investor_id')->nullable();
            $table->decimal('debit', 12, 2)->nullable();
            $table->decimal('credit', 12, 2)->nullable();
            // $table->decimal('balance', 14, 2);
            // $table->integer('payment_method')->nullable();
            $table->string('note')->nullable();
            $table->enum('status', ['used', 'unused'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
