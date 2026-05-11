import { useCallback, useMemo, useState } from "react";
import { Button, Checkbox, Divider, Field, Input } from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { mockCourses, mockLecturers } from "./mockRelated.js";
import "./UniversityApplicationForm.css";

function allocateStudentId(existingStudents) {
  let max = 10000;
  for (const s of existingStudents) {
    const m = /^STU-(\d+)$/.exec(s.studentId);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `STU-${String(max + 1).padStart(5, "0")}`;
}

export default function UniversityApplicationForm({ existingStudents, onSubmit, onCancel }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourses, setSelectedCourses] = useState(() => new Set());
  const [lecturerId, setLecturerId] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const toggleCourse = useCallback((courseId, checked) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (checked) next.add(courseId);
      else next.delete(courseId);
      return next;
    });
  }, []);

  const validationMessage = useMemo(() => {
    if (!attemptedSubmit) return {};
    const msg = {};
    if (!firstName.trim()) msg.firstName = "Enter a first name.";
    if (!lastName.trim()) msg.lastName = "Enter a last name.";
    if (!email.trim()) msg.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) msg.email = "Enter a valid email.";
    if (selectedCourses.size === 0) msg.courses = "Select at least one course.";
    if (!lecturerId) msg.lecturer = "Select an assigned lecturer.";
    return msg;
  }, [attemptedSubmit, firstName, lastName, email, selectedCourses.size, lecturerId]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAttemptedSubmit(true);
      const errs = [];
      if (!firstName.trim()) errs.push("firstName");
      if (!lastName.trim()) errs.push("lastName");
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push("email");
      if (selectedCourses.size === 0) errs.push("courses");
      if (!lecturerId) errs.push("lecturer");
      if (errs.length > 0) return;

      const lecturer = mockLecturers.find((l) => l.lecturerId === lecturerId);
      const studentId = allocateStudentId(existingStudents);
      const student = {
        studentId,
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        status: "Submitted",
        ownerName: lecturer?.name ?? "Admissions Office",
        createdOn: new Date(),
      };

      onSubmit({
        student,
        courseIds: [...selectedCourses],
        lecturerId,
      });
    },
    [
      existingStudents,
      firstName,
      lastName,
      email,
      selectedCourses,
      lecturerId,
      onSubmit,
    ]
  );

  return (
    <div className="uni-app">
      <header className="uni-app__chrome">
        <div className="uni-app__chrome-inner">
          <div className="uni-app__toolbar">
            <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={onCancel} type="button">
              Back
            </Button>
            <span className="uni-app__badge">University application</span>
          </div>
          <h1 className="uni-app__title">New application</h1>
          <p className="uni-app__lede">
            Complete all required sections. Submitting creates a student record and returns you to the list.
          </p>
        </div>
      </header>

      <main className="uni-app__main">
        <form className="uni-app__form" onSubmit={handleSubmit} noValidate>
          <div className="uni-app__card">
            <section className="uni-app__section" aria-labelledby="uni-sec-personal">
              <h2 id="uni-sec-personal" className="uni-app__section-heading">
                Personal details
              </h2>
              <div className="uni-app__fields">
                <Field label="First name" required validationMessage={validationMessage.firstName}>
                  <Input
                    value={firstName}
                    onChange={(_, d) => setFirstName(d.value)}
                    placeholder="Given name"
                  />
                </Field>
                <Field label="Last name" required validationMessage={validationMessage.lastName}>
                  <Input
                    value={lastName}
                    onChange={(_, d) => setLastName(d.value)}
                    placeholder="Family name"
                  />
                </Field>
              </div>
            </section>

            <Divider />

            <section className="uni-app__section" aria-labelledby="uni-sec-contact">
              <h2 id="uni-sec-contact" className="uni-app__section-heading">
                Contact information
              </h2>
              <div className="uni-app__fields uni-app__fields--single">
                <Field label="Email" required validationMessage={validationMessage.email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(_, d) => setEmail(d.value)}
                    placeholder="name@example.edu"
                    autoComplete="email"
                  />
                </Field>
              </div>
            </section>

            <Divider />

            <section className="uni-app__section" aria-labelledby="uni-sec-courses">
              <h2 id="uni-sec-courses" className="uni-app__section-heading">
                Course selection
              </h2>
              <Field label="Courses" required validationMessage={validationMessage.courses}>
                <div className="uni-app__checkbox-list" role="group" aria-label="Course selection">
                  {mockCourses.map((c) => (
                    <Checkbox
                      key={c.courseId}
                      checked={selectedCourses.has(c.courseId)}
                      onChange={(_, data) => toggleCourse(c.courseId, Boolean(data.checked))}
                      label={`${c.courseId} — ${c.courseName} (${c.credits} credits)`}
                    />
                  ))}
                </div>
              </Field>
            </section>

            <Divider />

            <section className="uni-app__section" aria-labelledby="uni-sec-lecturer">
              <h2 id="uni-sec-lecturer" className="uni-app__section-heading">
                Assigned lecturer
              </h2>
              <Field label="Lecturer" required validationMessage={validationMessage.lecturer}>
                <select
                  className="uni-app__select"
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  aria-required="true"
                >
                  <option value="">Select a lecturer…</option>
                  {mockLecturers.map((l) => (
                    <option key={l.lecturerId} value={l.lecturerId}>
                      {l.name} — {l.department}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <div className="uni-app__actions">
              <Button appearance="secondary" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button appearance="primary" type="submit">
                Submit application
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
