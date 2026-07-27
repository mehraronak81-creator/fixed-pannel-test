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
        Schema::create('ddos_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('provider_name')->default('Generic Webhook / Edge Scrubbing');
            $table->string('api_endpoint')->nullable();
            $table->text('api_key')->nullable();
            $table->text('api_secret')->nullable();
            $table->string('webhook_secret')->nullable();
            $table->string('mitigation_mode')->default('auto');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ddos_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('node_id')->nullable();
            $table->unsignedInteger('server_id')->nullable();
            $table->string('attack_type')->default('UDP/TCP Flood');
            $table->float('peak_gbps')->default(0.0);
            $table->unsignedBigInteger('peak_pps')->default(0);
            $table->string('status')->default('mitigating');
            $table->json('details')->nullable();
            $table->timestamp('detected_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ddos_events');
        Schema::dropIfExists('ddos_integrations');
    }
};
