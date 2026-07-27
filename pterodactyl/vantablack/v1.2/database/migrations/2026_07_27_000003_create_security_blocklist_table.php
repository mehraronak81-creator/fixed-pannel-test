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
        Schema::create('security_blocklist', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address')->nullable();
            $table->string('cidr_subnet')->nullable();
            $table->string('reason')->default('Abuse / Security Restriction');
            $table->timestamp('expires_at')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_blocklist');
    }
};
