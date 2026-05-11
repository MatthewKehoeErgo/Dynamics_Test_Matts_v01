import { Avatar, Button, Divider, Field, Input } from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import StudentRelatedGrids from "./StudentRelatedGrids.jsx";
import "./StudentDetailView.css";

function splitFullName(fullName) {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function StudentDetailView({ student, onBack, courseLinks, lecturerLinks }) {
  const { firstName, lastName } = splitFullName(student.fullName);
  const createdLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(student.createdOn);

  return (
    <div className="student-detail">
      <header className="student-detail__chrome">
        <div className="student-detail__chrome-inner">
          <div className="student-detail__toolbar">
            <Button
              appearance="subtle"
              icon={<ArrowLeftRegular />}
              onClick={onBack}
              aria-label="Back to students list"
            >
              Back
            </Button>
            <nav className="student-detail__breadcrumb" aria-label="Breadcrumb">
              <span className="student-detail__breadcrumb-root">Students</span>
              <span className="student-detail__breadcrumb-sep" aria-hidden="true">
                /
              </span>
              <span className="student-detail__breadcrumb-current">{student.fullName}</span>
            </nav>
          </div>
          <h1 className="student-detail__title">{student.fullName}</h1>
          <p className="student-detail__subtitle">{student.studentId}</p>
        </div>
      </header>

      <main className="student-detail__main">
        <div className="student-detail__form-card">
          <section className="student-detail__section" aria-labelledby="sec-general">
            <h2 id="sec-general" className="student-detail__section-heading">
              General
            </h2>
            <div className="student-detail__fields">
              <Field label="Student ID">
                <Input readOnly value={student.studentId} />
              </Field>
              <Field label="Application status">
                <Input readOnly value={student.status} />
              </Field>
              <Field label="Created on">
                <Input readOnly value={createdLabel} />
              </Field>
              <Field label="Owner">
                <div className="student-detail__owner-field">
                  <Avatar name={student.ownerName} size={32} color="colorful" />
                  <Input readOnly value={student.ownerName} className="student-detail__owner-input" />
                </div>
              </Field>
            </div>
          </section>

          <Divider />

          <section className="student-detail__section" aria-labelledby="sec-personal">
            <h2 id="sec-personal" className="student-detail__section-heading">
              Personal details
            </h2>
            <div className="student-detail__fields">
              <Field label="First name">
                <Input readOnly value={firstName} />
              </Field>
              <Field label="Last name">
                <Input readOnly value={lastName} />
              </Field>
            </div>
          </section>

          <Divider />

          <section className="student-detail__section" aria-labelledby="sec-contact">
            <h2 id="sec-contact" className="student-detail__section-heading">
              Contact information
            </h2>
            <div className="student-detail__fields">
              <div className="student-detail__field-span-2">
                <Field label="Email">
                  <Input readOnly value={student.email} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <StudentRelatedGrids
          studentId={student.studentId}
          courseLinks={courseLinks}
          lecturerLinks={lecturerLinks}
        />
      </main>
    </div>
  );
}
