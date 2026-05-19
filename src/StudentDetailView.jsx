import { useMemo, useState } from "react";
import {
  Avatar,
  Button as FluentButton,
  Input as FluentInput,
} from "@fluentui/react-components";
import {
  AddRegular,
  AddSquareRegular,
  ArrowClockwiseRegular,
  ArrowLeftRegular,
  ArrowSortRegular,
  BookContactsRegular,
  BuildingRegular,
  ChevronDownRegular,
  ClockRegular,
  DeleteRegular,
  DocumentBulletListRegular,
  DocumentRegular,
  FilterRegular,
  FlowRegular,
  HomeRegular,
  LineHorizontal3Regular,
  MoreHorizontalRegular,
  PenRegular,
  PeopleRegular,
  PeopleTeamRegular,
  PersonAddRegular,
  PersonRegular,
  PinRegular,
  ProhibitedRegular,
  QuestionCircleRegular,
  SaveRegular,
  SearchRegular,
  SettingsRegular,
  ShareRegular,
  ShieldCheckmarkRegular,
  TableRegular,
} from "@fluentui/react-icons";
import PowerAppsAppLauncherIcon from "./PowerAppsAppLauncherIcon.jsx";
import StudentRelatedGrids from "./StudentRelatedGrids.jsx";
import { PROGRAM_COORDINATOR_NAME } from "./programCoordinator.js";
import { getAssignedLecturer, getCoursesForStudent } from "./mockRelated.js";
import "./StudentsGrid.css";
import "./StudentDetailView.css";

const dateLong = new Intl.DateTimeFormat(undefined, {
  dateStyle: "long",
  timeStyle: "short",
});

const dateShort = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

/** Owning academic division — varies by record for a realistic college prototype */
const SCHOOL_DIVISIONS = [
  "College of Arts & Humanities",
  "School of Science & Engineering",
  "School of Business & Economics",
  "College of Social Sciences & Education",
];

function schoolDivisionForStudent(studentId) {
  const key = String(studentId).replace(/\D/g, "") || "0";
  const n = key.split("").reduce((acc, d) => acc + Number(d), 0);
  return SCHOOL_DIVISIONS[n % SCHOOL_DIVISIONS.length];
}

function splitFullName(fullName) {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Horizontal label-left field row used inside the Dynamics detail form */
function DetailRow({ label, required, alignTop, children }) {
  return (
    <div className={`mda-detail-row ${alignTop ? "mda-detail-row--top" : ""}`}>
      <label className="mda-detail-row__label">
        {label}
        {required ? (
          <span className="mda-detail-row__req" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div className="mda-detail-row__control">{children}</div>
    </div>
  );
}

/** Power Apps record header — value/link on top, caption (Base, Manager, …) below */
function HeaderSummaryField({ primary, secondary, variant = "default", showAvatar, avatarName }) {
  const text = primary ?? "—";
  const primaryEl =
    variant === "link" ? (
      <button type="button" className="mda-record-header__summary-link">
        {text}
      </button>
    ) : (
      <span className="mda-record-header__summary-strong">{text}</span>
    );

  return (
    <div className="mda-record-header__summary-field">
      <div className="mda-record-header__summary-top">
        {showAvatar && avatarName ? (
          <Avatar name={avatarName} size={24} color="colorful" />
        ) : null}
        {primaryEl}
      </div>
      <span className="mda-record-header__summary-caption">{secondary}</span>
    </div>
  );
}

export default function StudentDetailView({
  student,
  onBack,
  courseLinks,
  lecturerLinks,
  onNavigateStudents,
  onNavigateStaff,
  onNavigateApplications,
  onNavigateDepartments,
  onNavigateCourses,
  onNavigateLecturers,
  sitemapCollapsed = false,
  onToggleSitemap,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const { firstName, lastName } = splitFullName(student.fullName);
  const createdLabel = useMemo(() => dateLong.format(student.createdOn), [student.createdOn]);
  const createdShort = useMemo(() => dateShort.format(student.createdOn), [student.createdOn]);

  const lecturer = useMemo(
    () => getAssignedLecturer(student.studentId, lecturerLinks),
    [student.studentId, lecturerLinks]
  );
  const courses = useMemo(
    () => getCoursesForStudent(student.studentId, courseLinks),
    [student.studentId, courseLinks]
  );

  const coursesLabel = courses.length === 0
    ? "—"
    : courses.map((c) => `${c.courseId} — ${c.courseName}`).join("; ");

  const schoolDivision = useMemo(() => schoolDivisionForStudent(student.studentId), [student.studentId]);

  return (
    <div className={`dynamics-app mda-new-record mda-detail-record ${sitemapCollapsed ? "dynamics-app--sitemap-collapsed" : ""}`}>
      <header className="dynamics-app-header" role="banner">
        <div className="dynamics-app-header__brand">
          <button type="button" className="dynamics-app-header__logo" aria-label="App launcher">
            <PowerAppsAppLauncherIcon />
          </button>
          <span className="dynamics-app-header__product">Power Apps</span>
          <span className="dynamics-app-header__pipe" aria-hidden="true">
            |
          </span>
          <span className="dynamics-app-header__app">College Portal</span>
          <span className="dynamics-app-header__divider" aria-hidden="true" />
          <span className="dynamics-app-header__env">SANDBOX</span>
        </div>
        <div className="dynamics-app-header__actions">
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Search">
            <SearchRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Quick create">
            <AddSquareRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Filter">
            <FilterRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Settings">
            <SettingsRegular />
          </button>
          <button type="button" className="dynamics-app-header__icon-btn" aria-label="Help">
            <QuestionCircleRegular />
          </button>
          <button type="button" className="dynamics-app-header__user" aria-label="Account">
            AD
          </button>
        </div>
      </header>

      <div className="dynamics-app-body">
        <nav
          className={`dynamics-sitemap mda-sitemap ${sitemapCollapsed ? "dynamics-sitemap--collapsed" : ""}`}
          aria-label="Site map"
        >
          <button
            type="button"
            className="dynamics-sitemap__toggle"
            onClick={onToggleSitemap}
            aria-label={sitemapCollapsed ? "Expand site map" : "Collapse site map"}
            aria-expanded={!sitemapCollapsed}
          >
            <LineHorizontal3Regular className="dynamics-sitemap__toggle-icon" />
          </button>
          <ul className="dynamics-sitemap__list dynamics-sitemap__list--pinned">
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <HomeRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Home</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <ClockRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Recent</span>
                <ChevronDownRegular className="dynamics-sitemap__chevron" />
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <PinRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Pinned</span>
                <ChevronDownRegular className="dynamics-sitemap__chevron" />
              </button>
            </li>
          </ul>
          <p className="mda-sitemap__group-label">Dashboards</p>
          <ul className="dynamics-sitemap__list dynamics-sitemap__list--section">
            <li>
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateApplications?.()}>
                <DocumentRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Applications</span>
              </button>
            </li>
          </ul>
          <p className="mda-sitemap__group-label">Administration</p>
          <ul className="dynamics-sitemap__list dynamics-sitemap__list--section">
            <li>
              <button type="button" className="dynamics-sitemap__item dynamics-sitemap__item--active" onClick={() => onNavigateStudents?.()}>
                <PeopleRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Students</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateStaff?.()}>
                <PeopleTeamRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Staff</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateLecturers?.()}>
                <PersonRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Lecturers</span>
              </button>
            </li>
          </ul>
          <p className="mda-sitemap__group-label">Configuration</p>
          <ul className="dynamics-sitemap__list dynamics-sitemap__list--section">
            <li>
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateCourses?.()}>
                <BookContactsRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Courses</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateDepartments?.()}>
                <BuildingRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Departments</span>
              </button>
            </li>
            <li>
              <button type="button" className="dynamics-sitemap__item">
                <SettingsRegular className="dynamics-sitemap__icon" />
                <span className="dynamics-sitemap__label">Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <main className="dynamics-main mda-record-main">
          <div className="mda-record-commandbar" role="toolbar" aria-label="Record commands">
            <FluentButton
              appearance="subtle"
              icon={<ArrowLeftRegular fontSize={16} />}
              onClick={onBack}
              type="button"
              aria-label="Back"
            />
            <FluentButton appearance="subtle" icon={<SaveRegular fontSize={16} />} type="button" disabled title="Preview only">
              Save
            </FluentButton>
            <FluentButton appearance="subtle" icon={<SaveRegular fontSize={16} />} type="button" disabled title="Preview only">
              Save &amp; Close
            </FluentButton>
            <FluentButton appearance="subtle" icon={<AddRegular fontSize={16} />} type="button" disabled title="Preview only">
              New
            </FluentButton>
            <FluentButton appearance="subtle" icon={<ProhibitedRegular fontSize={16} />} type="button" disabled title="Preview only">
              Deactivate
            </FluentButton>
            <FluentButton appearance="subtle" icon={<DeleteRegular fontSize={16} />} type="button" disabled title="Preview only">
              Delete
            </FluentButton>
            <FluentButton appearance="subtle" icon={<ArrowClockwiseRegular fontSize={16} />} type="button" disabled title="Preview only">
              Refresh
            </FluentButton>
            <FluentButton appearance="subtle" icon={<ShieldCheckmarkRegular fontSize={16} />} type="button" disabled title="Preview only">
              Check Access
            </FluentButton>
            <FluentButton appearance="subtle" icon={<PersonAddRegular fontSize={16} />} type="button" disabled title="Preview only">
              Assign
            </FluentButton>
            <FluentButton
              appearance="subtle"
              icon={<FlowRegular fontSize={16} />}
              iconPosition="before"
              type="button"
              disabled
              title="Preview only"
            >
              <span className="mda-commandbar__flow-label">
                Flow <ChevronDownRegular fontSize={12} />
              </span>
            </FluentButton>
            <FluentButton
              appearance="subtle"
              icon={<TableRegular fontSize={16} />}
              iconPosition="before"
              type="button"
              disabled
              title="Preview only"
            >
              <span className="mda-commandbar__flow-label">
                Word Templates <ChevronDownRegular fontSize={12} />
              </span>
            </FluentButton>
            <FluentButton
              appearance="subtle"
              icon={<DocumentBulletListRegular fontSize={16} />}
              iconPosition="before"
              type="button"
              disabled
              title="Preview only"
            >
              <span className="mda-commandbar__flow-label">
                Run Report <ChevronDownRegular fontSize={12} />
              </span>
            </FluentButton>
            <span className="mda-record-commandbar__spacer" aria-hidden="true" />
            <FluentButton appearance="subtle" icon={<ShareRegular fontSize={16} />} iconPosition="before" type="button" disabled title="Preview only">
              <span className="mda-commandbar__flow-label">
                Share <ChevronDownRegular fontSize={12} />
              </span>
            </FluentButton>
          </div>

          <div className="mda-record-workspace" data-review-mode-scroll-root>
            <div className="mda-record-form mda-detail-page-layout">
              <section className="mda-record-card mda-record-card--summary-band" aria-labelledby="mda-detail-card-title">
                <header className="mda-record-header mda-record-header--detail">
                  <div className="mda-record-header__main">
                    <h2 id="mda-detail-card-title" className="mda-record-header__title mda-record-header__title--primary">
                      <span className="mda-record-header__title-id">{student.studentId}</span>
                      <span className="mda-record-header__title-sep"> - </span>
                      <span className="mda-record-header__title-saved">Saved</span>
                    </h2>
                    <p className="mda-record-header__subtitle">Student</p>
                  </div>
                  <div className="mda-record-header__summary">
                    <div className="mda-record-header__context">
                      <HeaderSummaryField primary={schoolDivision} secondary="Base" />
                      <HeaderSummaryField
                        primary={PROGRAM_COORDINATOR_NAME}
                        secondary="Program coordinator"
                        variant="link"
                        showAvatar
                        avatarName={PROGRAM_COORDINATOR_NAME}
                      />
                      <HeaderSummaryField
                        primary={lecturer?.name ?? "—"}
                        secondary="Faculty advisor"
                        variant={lecturer?.name ? "link" : "default"}
                        showAvatar={Boolean(lecturer?.name)}
                        avatarName={lecturer?.name}
                      />
                    </div>
                    <button
                      type="button"
                      className="mda-record-header__summary-expand"
                      aria-label="Show more header fields"
                      title="Preview only"
                    >
                      <ChevronDownRegular className="mda-record-header__summary-expand-icon" aria-hidden />
                    </button>
                  </div>
                </header>

                <div className="mda-tabs mda-tabs--in-summary" role="tablist">
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
                    <span className="mda-tab__inner">
                      Related <ChevronDownRegular fontSize={12} />
                    </span>
                  </button>
                  <span className="mda-tabs__spacer" aria-hidden="true" />
                  <button type="button" className="mda-tabs__assist" disabled title="Preview only">
                    Form assist
                  </button>
                </div>
              </section>

              <div className="mda-detail-record-grid">
                <section className="mda-record-card mda-record-card--form" aria-label="Student details">
                  {activeTab === "general" ? (
                    <div className="mda-detail-columns">
                      <DetailRow label="First name" required>
                        <FluentInput readOnly value={firstName} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Last name" required>
                        <FluentInput readOnly value={lastName} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Campus email" required>
                        <FluentInput readOnly value={student.email} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Student ID">
                        <FluentInput readOnly value={student.studentId} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Enrollment status">
                        <FluentInput readOnly value={student.status} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Record created">
                        <FluentInput readOnly value={createdLabel} className="mda-input" />
                      </DetailRow>
                      <DetailRow label="Faculty advisor">
                        {lecturer ? (
                          <div className="mda-detail-row__owner">
                            <Avatar name={lecturer.name} size={20} color="colorful" />
                            <FluentInput readOnly value={lecturer.name} className="mda-input mda-detail-row__owner-input" />
                          </div>
                        ) : (
                          <FluentInput readOnly value="Not assigned" className="mda-input" />
                        )}
                      </DetailRow>
                      <DetailRow label="Records owner">
                        <div className="mda-detail-row__owner">
                          <Avatar name={student.ownerName} size={20} color="colorful" />
                          <FluentInput readOnly value={student.ownerName} className="mda-input mda-detail-row__owner-input" />
                        </div>
                      </DetailRow>
                      <DetailRow label="Enrolled courses" alignTop>
                        <FluentInput
                          readOnly
                          value={coursesLabel}
                          className="mda-input"
                          title={coursesLabel}
                        />
                      </DetailRow>
                      <DetailRow label="Course load (count)">
                        <FluentInput readOnly value={String(courses.length)} className="mda-input" />
                      </DetailRow>
                    </div>
                  ) : (
                    <div className="mda-detail-related">
                      <StudentRelatedGrids
                        studentId={student.studentId}
                        courseLinks={courseLinks}
                        lecturerLinks={lecturerLinks}
                      />
                    </div>
                  )}
                </section>

                <aside className="mda-record-card mda-record-card--timeline" aria-label="Timeline">
                <div className="mda-timeline-aside__bar">
                  <span className="mda-timeline-aside__title">Timeline</span>
                  <div className="mda-timeline-aside__actions">
                    <button type="button" className="mda-timeline-aside__icon-btn" aria-label="Add to timeline">
                      <AddRegular />
                    </button>
                    <button type="button" className="mda-timeline-aside__icon-btn" aria-label="Filter timeline">
                      <FilterRegular />
                    </button>
                    <button type="button" className="mda-timeline-aside__icon-btn" aria-label="Sort">
                      <ArrowSortRegular />
                    </button>
                    <button type="button" className="mda-timeline-aside__icon-btn" aria-label="More">
                      <MoreHorizontalRegular />
                    </button>
                  </div>
                </div>
                <div className="mda-timeline-aside__body">
                  <FluentInput
                    placeholder="Search timeline"
                    contentBefore={<SearchRegular className="mda-timeline-aside__field-icon" aria-hidden />}
                    className="mda-timeline-aside__search"
                    disabled
                    appearance="outline"
                    aria-label="Search timeline"
                  />
                  <FluentInput
                    placeholder="Enter a note…"
                    contentAfter={<PenRegular className="mda-timeline-aside__field-icon" aria-hidden />}
                    className="mda-timeline-aside__note"
                    disabled
                    appearance="outline"
                    aria-label="Note"
                  />
                  <div className="mda-timeline-aside__empty">
                    <span className="mda-timeline-aside__empty-icon" aria-hidden="true">
                      <DocumentRegular fontSize={32} />
                    </span>
                    <h3 className="mda-timeline-aside__empty-title">Get started</h3>
                    <p className="mda-timeline-aside__empty-text">
                      Add notes, portal messages, and activities to build this student&apos;s timeline.
                    </p>
                    <p className="mda-timeline-aside__empty-meta">
                      Record created on {createdShort}
                    </p>
                  </div>
                </div>
              </aside>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
