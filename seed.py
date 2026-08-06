"""Seed the database with sample data so the dashboard KPI cards populate.

Idempotent: running it repeatedly will not create duplicates (it checks for an
existing seeded department first). Run with:  python seed.py
"""

from datetime import date, datetime

from app import create_app
from app.blueprints.performance import METRICS
from app.blueprints.recognition import AWARD_TYPES
from app.extensions import db
from app.models import Department, Performance, Recognition, Staff
from app.security import Roles


def seed():
    app = create_app()
    with app.app_context():
        if Department.query.first() is not None:
            print("Database already contains data — skipping seed.")
            return

        # Departments
        icu = Department(name="العناية المركزة", location="المبنى A - الطابق 3")
        er = Department(name="الطوارئ", location="المبنى B - الطابق الأرضي")
        peds = Department(name="الأطفال", location="المبنى A - الطابق 2")
        db.session.add_all([icu, er, peds])
        db.session.flush()  # assign IDs

        # Staff
        staff = [
            Staff(
                name="عقاب أحمد مبارك",
                employee_id="EMP-1001",
                role=Roles.DEPARTMENT_HEAD,
                department=icu,
            ),
            Staff(
                name="سارة علي",
                employee_id="EMP-1002",
                role=Roles.STAFF_NURSE,
                department=icu,
            ),
            Staff(
                name="محمد حسن",
                employee_id="EMP-1003",
                role=Roles.STAFF_NURSE,
                department=er,
            ),
            Staff(
                name="نورة عبدالله",
                employee_id="EMP-1004",
                role=Roles.STAFF_NURSE,
                department=peds,
            ),
        ]
        db.session.add_all(staff)
        db.session.flush()

        # Performance records
        db.session.add_all(
            [
                Performance(
                    staff=staff[0],
                    metric_name=METRICS[0],
                    value=92.5,
                    date=date.today(),
                ),
                Performance(
                    staff=staff[1],
                    metric_name=METRICS[0],
                    value=88.0,
                    date=date.today(),
                ),
                Performance(
                    staff=staff[2],
                    metric_name=METRICS[1],
                    value=95.0,
                    date=date.today(),
                ),
            ]
        )

        # Recognitions
        db.session.add_all(
            [
                Recognition(
                    staff=staff[0],
                    award_type=AWARD_TYPES[0],  # Florence Nightingale Award
                    granted_by="إدارة التمريض",
                    timestamp=datetime.utcnow(),
                ),
                Recognition(
                    staff=staff[3],
                    award_type=AWARD_TYPES[1],  # Nurse of the Month
                    granted_by="رئيس القسم",
                    timestamp=datetime.utcnow(),
                ),
            ]
        )

        db.session.commit()
        print(
            f"Seeded: {Department.query.count()} departments, "
            f"{Staff.query.count()} staff, performance & recognition rows."
        )


if __name__ == "__main__":
    seed()
