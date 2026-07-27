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
        Schema::create('backup_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cron_expression')->default('0 3 * * *'); // Daily at 3am
            $table->integer('max_backups')->default(7);
            $table->boolean('locked')->default(false);
            $table->json('node_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();
        });

        Schema::create('backup_policy_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('policy_id');
            $table->string('status')->default('completed'); // running, completed, failed
            $table->integer('servers_processed')->default(0);
            $table->integer('servers_failed')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_policy_runs');
        Schema::dropIfExists('backup_policies');
    }
};
