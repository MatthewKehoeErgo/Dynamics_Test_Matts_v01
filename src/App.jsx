import { useCallback, useMemo, useState } from "react";
import ReviewModePageBridge from "./review-mode/ReviewModePageBridge.jsx";
import CourseDetailView from "./CourseDetailView.jsx";
import CoursesGrid from "./CoursesGrid.jsx";
import DepartmentDetailView from "./DepartmentDetailView.jsx";
import DepartmentsGrid from "./DepartmentsGrid.jsx";
import LecturerDetailView from "./LecturerDetailView.jsx";
import LecturersGrid from "./LecturersGrid.jsx";
import StaffDetailView from "./StaffDetailView.jsx";
import StaffGrid from "./StaffGrid.jsx";
import StudentDetailView from "./StudentDetailView.jsx";
import StudentsGrid from "./StudentsGrid.jsx";
import UniversityApplicationForm from "./UniversityApplicationForm.jsx";
import { mockDepartments } from "./mockDepartments.js";
import { mockInstitutionCourses } from "./mockInstitutionCourses.js";
import { mockInstitutionLecturers } from "./mockInstitutionLecturers.js";
import { studentCourseLinks, studentLecturerLink } from "./mockRelated.js";
import { mockStaff } from "./mockStaff.js";
import { mockStudents } from "./mockStudents.js";

function studentRecordKey(studentId) {
  return String(studentId).replace(/-/g, "");
}

export default function App() {
  const [students, setStudents] = useState(() => [...mockStudents]);
  const [staff] = useState(() => [...mockStaff]);
  const [departments] = useState(() => [...mockDepartments]);
  const [institutionCourses] = useState(() => [...mockInstitutionCourses]);
  const [institutionLecturers] = useState(() => [...mockInstitutionLecturers]);
  const [courseLinksByStudent, setCourseLinksByStudent] = useState(() => ({
    ...studentCourseLinks,
  }));
  const [lecturerByStudent, setLecturerByStudent] = useState(() => ({
    ...studentLecturerLink,
  }));

  /** students | studentDetail | staffList | staffDetail | lecturers | lecturerDetail | courses | courseDetail | departments | departmentDetail | application */
  const [view, setView] = useState({ type: "students" });

  const [sitemapCollapsed, setSitemapCollapsed] = useState(false);
  const toggleSitemap = useCallback(() => {
    setSitemapCollapsed((prev) => !prev);
  }, []);

  const detailStudent = useMemo(() => {
    if (view.type !== "studentDetail") return null;
    return students.find((s) => s.studentId === view.studentId) ?? null;
  }, [view, students]);

  const detailStaff = useMemo(() => {
    if (view.type !== "staffDetail") return null;
    return staff.find((s) => s.staffId === view.staffId) ?? null;
  }, [view, staff]);

  const detailDepartment = useMemo(() => {
    if (view.type !== "departmentDetail") return null;
    return departments.find((d) => d.departmentId === view.departmentId) ?? null;
  }, [view, departments]);

  const detailCourse = useMemo(() => {
    if (view.type !== "courseDetail") return null;
    return institutionCourses.find((c) => c.courseId === view.courseId) ?? null;
  }, [view, institutionCourses]);

  const lecturersEnriched = useMemo(
    () =>
      institutionLecturers.map((l) => {
        const taughtCourses = l.taughtCourseIds
          .map((id) => institutionCourses.find((c) => c.courseId === id))
          .filter(Boolean);
        return {
          ...l,
          taughtCourses,
          coursesLabel: taughtCourses.map((c) => c.courseId).join(", "),
        };
      }),
    [institutionLecturers, institutionCourses]
  );

  const detailLecturer = useMemo(() => {
    if (view.type !== "lecturerDetail") return null;
    return lecturersEnriched.find((x) => x.lecturerId === view.lecturerId) ?? null;
  }, [view, lecturersEnriched]);

  const openStudent = useCallback((studentId) => {
    setView({ type: "studentDetail", studentId });
  }, []);

  const closeStudent = useCallback(() => {
    setView({ type: "students" });
  }, []);

  const openStaff = useCallback((staffId) => {
    setView({ type: "staffDetail", staffId });
  }, []);

  const closeStaff = useCallback(() => {
    setView({ type: "staffList" });
  }, []);

  const goStudentsList = useCallback(() => {
    setView({ type: "students" });
  }, []);

  const goStaffList = useCallback(() => {
    setView({ type: "staffList" });
  }, []);

  const goDepartmentsList = useCallback(() => {
    setView({ type: "departments" });
  }, []);

  const openDepartment = useCallback((departmentId) => {
    setView({ type: "departmentDetail", departmentId });
  }, []);

  const closeDepartment = useCallback(() => {
    setView({ type: "departments" });
  }, []);

  const goCoursesList = useCallback(() => {
    setView({ type: "courses" });
  }, []);

  const openCourse = useCallback((courseId) => {
    setView({ type: "courseDetail", courseId });
  }, []);

  const closeCourse = useCallback(() => {
    setView({ type: "courses" });
  }, []);

  const goLecturersList = useCallback(() => {
    setView({ type: "lecturers" });
  }, []);

  const openLecturer = useCallback((lecturerId) => {
    setView({ type: "lecturerDetail", lecturerId });
  }, []);

  const closeLecturer = useCallback(() => {
    setView({ type: "lecturers" });
  }, []);

  const openApplication = useCallback(() => {
    setView({ type: "application" });
  }, []);

  const cancelApplication = useCallback(() => {
    setView({ type: "students" });
  }, []);

  const handleApplicationSubmit = useCallback(
    ({ student, courseIds, lecturerId }) => {
      const key = studentRecordKey(student.studentId);
      setStudents((prev) => [...prev, student]);
      setCourseLinksByStudent((prev) => ({ ...prev, [key]: courseIds }));
      setLecturerByStudent((prev) => ({ ...prev, [key]: lecturerId }));
      setView({ type: "students" });
    },
    []
  );

  const pageCtx = useMemo(
    () => ({
      students,
      staff,
      departments,
      institutionCourses,
      lecturersEnriched,
    }),
    [students, staff, departments, institutionCourses, lecturersEnriched]
  );

  return (
    <>
      <ReviewModePageBridge view={view} setView={setView} ctx={pageCtx} />
      {view.type === "application" ? (
        <UniversityApplicationForm
          existingStudents={students}
          onSubmit={handleApplicationSubmit}
          onCancel={cancelApplication}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : detailStudent ? (
        <StudentDetailView
          student={detailStudent}
          onBack={closeStudent}
          courseLinks={courseLinksByStudent}
          lecturerLinks={lecturerByStudent}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : detailStaff ? (
        <StaffDetailView
          staff={detailStaff}
          onBack={closeStaff}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : detailDepartment ? (
        <DepartmentDetailView
          department={detailDepartment}
          onBack={closeDepartment}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : detailCourse ? (
        <CourseDetailView
          course={detailCourse}
          onBack={closeCourse}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : detailLecturer ? (
        <LecturerDetailView
          lecturer={detailLecturer}
          onBack={closeLecturer}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "lecturerDetail" ? (
        <LecturersGrid
          lecturers={lecturersEnriched}
          onOpenLecturer={openLecturer}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "courseDetail" ? (
        <CoursesGrid
          courses={institutionCourses}
          onOpenCourse={openCourse}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "departmentDetail" ? (
        <DepartmentsGrid
          departments={departments}
          onOpenDepartment={openDepartment}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "staffList" ? (
        <StaffGrid
          staff={staff}
          onOpenStaff={openStaff}
          onNavigateStudents={goStudentsList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "departments" ? (
        <DepartmentsGrid
          departments={departments}
          onOpenDepartment={openDepartment}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "courses" ? (
        <CoursesGrid
          courses={institutionCourses}
          onOpenCourse={openCourse}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : view.type === "lecturers" ? (
        <LecturersGrid
          lecturers={lecturersEnriched}
          onOpenLecturer={openLecturer}
          onNavigateStudents={goStudentsList}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      ) : (
        <StudentsGrid
          students={students}
          courseLinks={courseLinksByStudent}
          lecturerLinks={lecturerByStudent}
          onOpenStudent={openStudent}
          onOpenApplication={openApplication}
          onNavigateStaff={goStaffList}
          onNavigateApplications={openApplication}
          onNavigateDepartments={goDepartmentsList}
          onNavigateCourses={goCoursesList}
          onNavigateLecturers={goLecturersList}
          sitemapCollapsed={sitemapCollapsed}
          onToggleSitemap={toggleSitemap}
        />
      )}
    </>
  );
}
