const SCREEN_LABELS = {
  students: "Students",
  staffList: "Staff",
  departments: "Departments",
  courses: "Courses",
  lecturers: "Lecturers",
  application: "University Application",
};

export function getPageIdentity(view, ctx = {}) {
  const { students = [], staff = [], departments = [], institutionCourses = [], lecturersEnriched = [] } = ctx;

  switch (view.type) {
    case "students":
      return { pageKey: "students", screenLabel: SCREEN_LABELS.students };
    case "studentDetail": {
      const student = students.find((s) => s.studentId === view.studentId);
      const name = student?.fullName ?? student?.studentId ?? view.studentId;
      return {
        pageKey: `studentDetail:${view.studentId}`,
        screenLabel: `Student — ${name}`,
      };
    }
    case "staffList":
      return { pageKey: "staffList", screenLabel: SCREEN_LABELS.staffList };
    case "staffDetail": {
      const person = staff.find((s) => s.staffId === view.staffId);
      const name = person?.fullName ?? view.staffId;
      return {
        pageKey: `staffDetail:${view.staffId}`,
        screenLabel: `Staff — ${name}`,
      };
    }
    case "departments":
      return { pageKey: "departments", screenLabel: SCREEN_LABELS.departments };
    case "departmentDetail": {
      const dept = departments.find((d) => d.departmentId === view.departmentId);
      return {
        pageKey: `departmentDetail:${view.departmentId}`,
        screenLabel: `Department — ${dept?.name ?? view.departmentId}`,
      };
    }
    case "courses":
      return { pageKey: "courses", screenLabel: SCREEN_LABELS.courses };
    case "courseDetail": {
      const course = institutionCourses.find((c) => c.courseId === view.courseId);
      return {
        pageKey: `courseDetail:${view.courseId}`,
        screenLabel: `Course — ${course?.title ?? view.courseId}`,
      };
    }
    case "lecturers":
      return { pageKey: "lecturers", screenLabel: SCREEN_LABELS.lecturers };
    case "lecturerDetail": {
      const lecturer = lecturersEnriched.find((l) => l.lecturerId === view.lecturerId);
      return {
        pageKey: `lecturerDetail:${view.lecturerId}`,
        screenLabel: `Lecturer — ${lecturer?.fullName ?? view.lecturerId}`,
      };
    }
    case "application":
      return { pageKey: "application", screenLabel: SCREEN_LABELS.application };
    default:
      return { pageKey: "students", screenLabel: SCREEN_LABELS.students };
  }
}

export function getScreenLabel(pageKey) {
  if (SCREEN_LABELS[pageKey]) return SCREEN_LABELS[pageKey];
  const [kind, id] = pageKey.split(":");
  if (!id) return pageKey;
  const base = {
    studentDetail: "Student",
    staffDetail: "Staff",
    departmentDetail: "Department",
    courseDetail: "Course",
    lecturerDetail: "Lecturer",
  }[kind];
  return base ? `${base} — ${id}` : pageKey;
}

export function parsePageKeyToView(pageKey) {
  if (!pageKey || SCREEN_LABELS[pageKey]) {
    return { type: pageKey || "students" };
  }
  const [kind, id] = pageKey.split(":");
  const map = {
    studentDetail: "studentDetail",
    staffDetail: "staffDetail",
    departmentDetail: "departmentDetail",
    courseDetail: "courseDetail",
    lecturerDetail: "lecturerDetail",
  };
  const type = map[kind];
  if (!type || !id) return { type: "students" };
  const idField = {
    studentDetail: "studentId",
    staffDetail: "staffId",
    departmentDetail: "departmentId",
    courseDetail: "courseId",
    lecturerDetail: "lecturerId",
  }[type];
  return { type, [idField]: id };
}
