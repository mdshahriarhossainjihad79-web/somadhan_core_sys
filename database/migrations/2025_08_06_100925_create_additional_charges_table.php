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
        Schema::create('additional_charges', function (Blueprint $table) {
            $table->id();
            $table->integer('reference_id');
            $table->enum('reference_type', ['sale', 'purchase']);
            $table->unsignedBigInteger('additional_charge_name_id')->nullable();
            $table->decimal('amount', 17, 2)->default(0);
            $table->foreign('additional_charge_name_id')->references('id')->on('additional_charge_names')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_charges');
    }
};
