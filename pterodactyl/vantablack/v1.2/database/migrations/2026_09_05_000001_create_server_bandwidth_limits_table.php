<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Stores a per-server network bandwidth cap (expressed in megabits per
     * second). When a row is absent the panel falls back to the global default
     * defined in settings (settings::vantahost:bandwidth_default_mbps).
     */
    public function up(): void
    {
        Schema::create('server_bandwidth_limits', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('server_id')->unique();
            // NULL rate = explicitly unlimited (limiter removed for this server).
            $table->unsignedInteger('rate_mbps')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_bandwidth_limits');
    }
};
