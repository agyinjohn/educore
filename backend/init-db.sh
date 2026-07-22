#!/bin/bash

# EduCore Database Initialization Script
# Creates collections and indexes for Phase 1

set -e

MONGO_URI="${1:-mongodb+srv://username:password@cluster.mongodb.net/educore}"
DB_NAME="educore"

echo "═══════════════════════════════════════════════════════════"
echo "EduCore Database Initialization"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Connecting to: $MONGO_URI"
echo ""

# MongoDB operations
mongosh "$MONGO_URI" << EOF

// Use the database
use $DB_NAME

// Student Collection
console.log("Creating students collection...")
db.createCollection("students")
db.students.createIndex({ school_id: 1, status: 1 })
db.students.createIndex({ school_id: 1, class_id: 1 })
db.students.createIndex({ email: 1 }, { unique: true })

// Academic Collections
console.log("Creating academic collections...")

db.createCollection("classes")
db.classes.createIndex({ school_id: 1, academicYear: 1 })

db.createCollection("timetableslots")
db.timetableslots.createIndex({ teacher_id: 1, dayOfWeek: 1, period: 1, term: 1, academicYear: 1 })
db.timetableslots.createIndex({ school_id: 1, class_id: 1 })

db.createCollection("attendances")
db.attendances.createIndex({ school_id: 1, student_id: 1, class_id: 1, date: 1, period: 1 }, { unique: true })
db.attendances.createIndex({ school_id: 1, class_id: 1, date: 1 })

db.createCollection("grades")
db.grades.createIndex({ school_id: 1, student_id: 1, term: 1 })
db.grades.createIndex({ school_id: 1, class_id: 1, status: 1 })

db.createCollection("assessments")
db.assessments.createIndex({ school_id: 1, class_id: 1, term: 1 })

db.createCollection("exams")
db.exams.createIndex({ school_id: 1, class_id: 1, term: 1 })

// Show collections
console.log("\nCollections created:")
db.getCollectionNames().forEach(name => console.log("  ✓ " + name))

// Show indexes
console.log("\nIndexes created:")
db.getCollectionInfos().forEach(col => {
  console.log("\n" + col.name + ":")
  db[col.name].getIndexes().forEach(idx => {
    console.log("  - " + JSON.stringify(idx.key))
  })
})

console.log("\n✓ Database initialization complete!")

EOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✓ Database Initialization Complete"
echo "═══════════════════════════════════════════════════════════"
