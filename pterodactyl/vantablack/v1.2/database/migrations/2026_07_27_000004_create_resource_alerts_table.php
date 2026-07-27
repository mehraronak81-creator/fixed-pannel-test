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
        Schema::create('resource_alert_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('server_id');
            $table->unsignedInteger('user_id');
            $table->string('metric'); // cpu, memory, disk
            $table->integer('threshold_percent')->default(90);
            $table->integer('cooldown_minutes')->default(30);
            $table->boolean('notify_email')->default(true);
            $table->boolean('notify_panel')->default(true);
            $table->timestamps();
        });

        Schema::create('resource_alert_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('rule_id');
            $table->unsignedInteger('server_id');
            $table->float('value_recorded');
            $table->timestamp('triggered_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_alert_events');
        Schema::dropIfExists('resource_alert_rules');
    }
};
