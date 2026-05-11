import { useCallback, useMemo, useState } from "react";
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowLeftRegular,
  BookContactsRegular,
  DeleteRegular,
  DocumentRegular,
  GridRegular,
  HomeRegular,
  PeopleRegular,
  PinRegular,
  SaveRegular,
  SearchRegular,
  SettingsRegular,
  ShareRegular,
} from "@fluentui/react-icons";
import { Button as FluentButton, Checkbox as FluentCheckbox, Input as FluentInput } from "@fluentui/react-components";
import { mockCourses, mockLecturers } from "./mockRelated.js";
import "./StudentsGrid.css";
import "./UniversityApplicationForm.css";

function allocateStudentId(existingStudents) {
  let max = 10000;
  for (const s of existingStudents) {
    const m = /^STU-(\d+)$/.exec(s.studentId);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `STU-${String(max + 1).padStart(5, "0")}`;
}

function FormRow({ label, required, error, children, alignTop }) {
  return (
    <div className={`mda-field-row ${alignTop ? "mda-field-row--top" : ""} ${error ? "mda-field-row--error" : ""}`}>
      <label className="mda-field-label">
        {label}
        {required ? (
          <span className="mda-field-req" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div className="mda-field-control">
        {children}
        {error ? (
          <span className="mda-field-error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function UniversityApplicationForm({ existingStudents, onSubmit, onCancel }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourses, setSelectedCourses] = useState(() => new Set());
  const [lecturerId, setLecturerId] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const previewId = useMemo(() => allocateStudentId(existingStudents), [existingStudents]);

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

  const runSubmit = useCallback(() => {
    setAttemptedSubmit(true);
    if (!firstName.trim()) return;
    if (!lastName.trim()) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    if (selectedCourses.size === 0) return;
    if (!lecturerId) return;

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
  }, [
    existingStudents,
    firstName,
    lastName,
    email,
    selectedCourses,
    lecturerId,
    onSubmit,
  ]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      runSubmit();
    },
    [runSubmit]
  );

  return (
    <div className="dynamics-app mda-new-record">
      <header className="dynamics-app-header" role="banner">
        <div className="dynamics-app-header__brand">
          <span className="dynamics-app-header__logo" aria-hidden="true">
            <GridRegular />
          </span>
          <span className="dynamics-app-header__product">Power Apps</span>
          <span className="dynamics-app-header__divider" aria-hidden="true" />
          <span className="dynamics-app-header__env">SANDBOX</span>
        </div>
        <div className="dynamics-app-header__actions">
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Search">
            <SearchRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Refresh">
            <ArrowClockwiseRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Settings">
            <SettingsRegular />
          </button>
          <button type="button" className="dynamics-app-header__user" aria-label="Account">
            AD
          </button>
        </div>
      </header>

      <div className="dynamics-app-body">
        <nav className="dynamics-sitemap mda-sitemap" aria-label="Site map">
          <ul className="dynamics-sitemap__list">
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <HomeRegular className="dynamics-sitemap__icon" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <ArrowClockwiseRegular className="dynamics-sitemap__icon" />
                <span>Recent</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <PinRegular className="dynamics-sitemap__icon" />
                <span>Pinned</span>
              </button>
            </li>
          </ul>
          <p className="mda-sitemap__group-label">Apps</p>
          <ul className="dynamics-sitemap__list">
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <DocumentRegular className="dynamics-sitemap__icon" />
                <span>Applications</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item dynamics-sitemap__item--active">
                <PeopleRegular className="dynamics-sitemap__icon" />
                <span>Students</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <BookContactsRegular className="dynamics-sitemap__icon" />
                <span>Courses</span>
              </button>
            </li>
          </ul>
          <p className="mda-sitemap__group-label">Administration</p>
          <ul className="dynamics-sitemap__list">
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <SettingsRegular className="dynamics-sitemap__icon" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <main className="dynamics-main mda-record-main">
          <div className="mda-record-commandbar" role="toolbar" aria-label="Form commands">
            <FluentButton
              appearance="subtle"
              icon={<ArrowLeftRegular fontSize={16} />}
              onClick={onCancel}
              type="button"
            >
              Back
            </FluentButton>
            <FluentButton appearance="subtle" icon={<SaveRegular fontSize={16} />} type="submit" form="uni-app-record-form">
              Save
            </FluentButton>
            <FluentButton appearance="subtle" icon={<SaveRegular fontSize={16} />} type="button" onClick={runSubmit}>
              Save &amp; Close
            </FluentButton>
            <FluentButton appearance="subtle" icon={<AddRegular fontSize={16} />} type="button" disabled title="Preview only">
              New
            </FluentButton>
            <FluentButton appearance="subtle" icon={<DeleteRegular fontSize={16} />} type="button" disabled title="Preview only">
              Delete
            </FluentButton>
            <FluentButton appearance="subtle" icon={<ArrowClockwiseRegular fontSize={16} />} type="button" disabled title="Preview only">
              Refresh
            </FluentButton>
            <span className="mda-record-commandbar__spacer" aria-hidden="true" />
            <FluentButton appearance="subtle" icon={<ShareRegular fontSize={16} />} type="button" disabled title="Preview only">
              Share
            </FluentButton>
          </div>

          <div className="mda-record-workspace">
            <form id="uni-app-record-form" className="mda-record-form" onSubmit={handleSubmit} noValidate>
              <div className="mda-record-card">
                <header className="mda-record-header">
                  <div className="mda-record-header__row">
                    <span className="mda-record-header__id">{previewId}</span>
                    <span className="mda-record-header__divider-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="mda-record-header__status">Not saved</span>
                    <span className="mda-record-header__divider-dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="mda-record-header__entity">Student</span>
                  </div>
                </header>

                <div className="mda-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "general"}
                    className={`mda-tab ${activeTab === "general" ? "mda-tab--active" : ""}`}
                    onClick={() => setActiveTab("general")}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "related"}
                    className={`mda-tab ${activeTab === "related" ? "mda-tab--active" : ""}`}
                    onClick={() => setActiveTab("related")}
                  >
                    Related
                  </button>
                </div>

                {activeTab === "general" ? (
                  <div className="mda-form-layout">
                    <div className="mda-form-columns">
                      <div className="mda-form-col">
                        <FormRow label="First name" required error={validationMessage.firstName}>
                          <FluentInput
                            value={firstName}
                            onChange={(_, d) => setFirstName(d.value)}
                            placeholder="Required"
                            className="mda-input"
                          />
                        </FormRow>
                        <FormRow label="Last name" required error={validationMessage.lastName}>
                          <FluentInput
                            value={lastName}
                            onChange={(_, d) => setLastName(d.value)}
                            placeholder="Required"
                            className="mda-input"
                          />
                        </FormRow>
                        <FormRow label="Courses" required error={validationMessage.courses} alignTop>
                          <div className="mda-checkbox-stack" role="group" aria-label="Courses">
                            {mockCourses.map((c) => (
                              <FluentCheckbox
                                key={c.courseId}
                                checked={selectedCourses.has(c.courseId)}
                                onChange={(_, data) => toggleCourse(c.courseId, Boolean(data.checked))}
                                label={`${c.courseId} — ${c.courseName}`}
                              />
                            ))}
                          </div>
                        </FormRow>
                      </div>
                      <div className="mda-form-col">
                        <FormRow label="Email" required error={validationMessage.email}>
                          <FluentInput
                            type="email"
                            value={email}
                            onChange={(_, d) => setEmail(d.value)}
                            placeholder="name@example.edu"
                            autoComplete="email"
                            className="mda-input"
                          />
                        </FormRow>
                        <FormRow label="Assigned lecturer" required error={validationMessage.lecturer}>
                          <select
                            className="mda-select"
                            value={lecturerId}
                            onChange={(e) => setLecturerId(e.target.value)}
                            aria-required="true"
                          >
                            <option value="">Select…</option>
                            {mockLecturers.map((l) => (
                              <option key={l.lecturerId} value={l.lecturerId}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </FormRow>
                      </div>
                    </div>

                    <aside className="mda-timeline" aria-label="Timeline">
                      <div className="mda-timeline__header">
                        <span className="mda-timeline__title">Timeline</span>
                        <div className="mda-timeline__actions">
                          <FluentButton appearance="subtle" size="small" disabled title="Preview only">
                            +
                          </FluentButton>
                          <FluentButton appearance="subtle" size="small" disabled title="Preview only">
                            ⋯
                          </FluentButton>
                        </div>
                      </div>
                      <FluentInput
                        placeholder="Search timeline"
                        className="mda-timeline__search"
                        disabled
                        appearance="outline"
                        size="small"
                      />
                      <textarea
                        className="mda-timeline__note"
                        placeholder="Enter a note…"
                        rows={3}
                        readOnly
                        aria-readonly="true"
                      />
                      <p className="mda-timeline__empty">
                        Get started. Capture and manage all records in your timeline.
                      </p>
                    </aside>
                  </div>
                ) : (
                  <div className="mda-related-placeholder">
                    <p className="mda-related-placeholder__text">
                      Related records (courses, lecturer, etc.) appear here in a full model-driven app. This prototype uses
                      the General tab for entry.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
