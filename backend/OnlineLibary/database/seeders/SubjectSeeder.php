<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            [
                'name'        => 'Fundamentals of Programming',
                'code'        => 'CS-2210',
                'description' => 'Algorithm design, pseudocode, logic gates, database concepts, and programming basics.',
            ],
            [
                'name'        => 'Full-Stack Web Development',
                'code'        => 'DEV-101',
                'description' => 'Modern web application development using HTML, Tailwind CSS, JavaScript, React, and Laravel.',
            ],
            [
                'name'        => 'Database Management & SQL',
                'code'        => 'DBMS-201',
                'description' => 'Relational database architecture, relational schema design, SQL queries, and MySQL Workbench.',
            ],
            [
                'name'        => 'Office Automation & Advanced Excel',
                'code'        => 'OAF-100',
                'description' => 'Microsoft Access forms, queries, data tables, Advanced Excel formulas, DSUM, and What-If Analysis.',
            ],
        ];

        foreach ($subjects as $subject) {
            // Checks by 'code' to prevent duplicate key 1062 errors
            Subject::updateOrCreate(
                ['code' => $subject['code']], 
                $subject
            );
        }
    }
}