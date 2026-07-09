<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();

            $table->string('photo')->nullable();

            $table->string('nis')->unique();
            $table->string('name');
            $table->enum('gender', ['L', 'P']);

            $table->string('birth_place');
            $table->date('birth_date');

            $table->text('address');
            $table->string('phone')->nullable();
            $table->string('email')->unique();

            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
