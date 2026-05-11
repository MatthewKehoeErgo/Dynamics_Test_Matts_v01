import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useCallback, useMemo, useState } from "react";
import StudentDetailView from "./StudentDetailView.jsx";
import StudentsGrid from "./StudentsGrid.jsx";
import UniversityApplicationForm from "./UniversityApplicationForm.jsx";
import { studentCourseLinks, studentLecturerLink } from "./mockRelated.js";
import { mockStudents } from "./mockStudents.js";

function studentRecordKey(studentId) {
  return String(studentId).replace(/-/g, "");
}

export default function App() {
  const [students, setStudents] = useState(() => [...mockStudents]);
  const [courseLinksByStudent, setCourseLinksByStudent] = useState(() => ({
    ...studentCourseLinks,
  }));
  const [lecturerByStudent, setLecturerByStudent] = useState(() => ({
    ...studentLecturerLink,
  }));

  /** list | detail | application */
  const [view, setView] = useState({ type: "list" });

  const detailStudent = useMemo(() => {
    if (view.type !== "detail") return null;
    return students.find((s) => s.studentId === view.studentId) ?? null;
  }, [view, students]);

  const openStudent = useCallback((studentId) => {
    setView({ type: "detail", studentId });
  }, []);

  const closeStudent = useCallback(() => {
    setView({ type: "list" });
  }, []);

  const openApplication = useCallback(() => {
    setView({ type: "application" });
  }, []);

  const cancelApplication = useCallback(() => {
    setView({ type: "list" });
  }, []);

  const handleApplicationSubmit = useCallback(
    ({ student, courseIds, lecturerId }) => {
      const key = studentRecordKey(student.studentId);
      setStudents((prev) => [...prev, student]);
      setCourseLinksByStudent((prev) => ({ ...prev, [key]: courseIds }));
      setLecturerByStudent((prev) => ({ ...prev, [key]: lecturerId }));
      setView({ type: "list" });
    },
    []
  );

  return (
    <FluentProvider theme={webLightTheme}>
      {view.type === "application" ? (
        <UniversityApplicationForm
          existingStudents={students}
          onSubmit={handleApplicationSubmit}
          onCancel={cancelApplication}
        />
      ) : detailStudent ? (
        <StudentDetailView
          student={detailStudent}
          onBack={closeStudent}
          courseLinks={courseLinksByStudent}
          lecturerLinks={lecturerByStudent}
        />
      ) : (
        <StudentsGrid
          students={students}
          onOpenStudent={openStudent}
          onOpenApplication={openApplication}
        />
      )}
    </FluentProvider>
  );
}
