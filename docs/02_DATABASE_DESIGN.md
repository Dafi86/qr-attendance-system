Set-Content -Path "docs\02_DATABASE_DESIGN.md" -Value @"

# 🗄 DATABASE DESIGN (FINAL)

## 📌 Digital Attendance System

MTs Sunan Drajat Sugiwaras

---

# 🎯 PRINCIPLE

Database ini dirancang dengan prinsip:

- Normalized (3NF)
- Scalable
- Audit-ready
- Clean relational structure
- Easy reporting
- Production-ready

---

# 👤 USERS

## users

- id (PK)
- name
- email (unique)
- password
- role (admin, user)
- is_active
- last_login_at
- last_login_ip
- created_at
- updated_at

---

# 👨‍🏫 TEACHERS

## teachers

- id (PK)
- user_id (FK users)
- nip (unique)
- full_name
- gender (male, female)
- phone
- address
- photo
- is_active
- deleted_at

---

# 👨‍🎓 STUDENTS

## students

- id (PK)
- user_id (FK users)
- class_id (FK classes)
- nis (unique)
- nisn (unique)
- student_number
- full_name
- gender (male, female)
- birth_place
- birth_date
- address
- parent_name
- parent_phone
- photo
- is_active
- deleted_at

---

# 🏫 CLASSES

## classes

- id (PK)
- teacher_id (FK teachers)
- level (VII, VIII, IX)
- name (A, B, C)
- academic_year
- capacity
- description
- is_active
- deleted_at

---

# 📱 QR CODES

## qr_codes

- id (PK)
- student_id (FK students)
- uuid (unique)
- qr_image
- generated_by (FK users)
- generated_at
- expired_at
- is_active

---

# 📅 ATTENDANCES

## attendances

- id (PK)
- student_id (FK)
- attendance_date
- check_in_time
- check_out_time
- status (present, late, permission, sick, absent)
- late_minutes
- notes

---

# 📜 ATTENDANCE LOGS

## attendance_logs

- id (PK)
- attendance_id (FK)
- student_id (FK)
- type (check_in, check_out)
- scanned_at
- ip_address
- device

---

# 📢 ANNOUNCEMENTS

## announcements

- id (PK)
- title
- content
- published_at
- created_by (FK users)
- is_active

---

# 🏫 SCHOOL PROFILES

## school_profiles

- id (PK)
- school_name
- npsn
- address
- phone
- email
- website
- principal
- logo

---

# ⚙ SETTINGS

## settings

- id (PK)
- morning_start (06:45)
- late_limit (07:00)
- checkout_time (15:00)
- timezone

---

# 🔐 RELATIONSHIPS

## USER RELATION

users
├── teachers (1:1)
└── students (1:1)

---

## CLASS RELATION

teachers → classes (1:N)
classes → students (1:N)

---

## ATTENDANCE RELATION

students → attendances (1:N)
attendances → attendance_logs (1:N)

---

## QR RELATION

students → qr_codes (1:1 or history)
"@
