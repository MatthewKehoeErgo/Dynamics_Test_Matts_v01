import { useMemo, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import {
  getAssignedLecturer,
  getCoursesForStudent,
  studentCourseLinks,
  studentLecturerLink,
} from "./mockRelated.js";

function SubGridChrome({ title, count, children }) {
  return (
    <div className="student-detail__subgrid">
      <div className="student-detail__subgrid__chrome">
        <div className="student-detail__subgrid__title-row">
          <h3 className="student-detail__subgrid__title">{title}</h3>
          <span className="student-detail__subgrid__count">{count} items</span>
        </div>
        <div className="student-detail__subgrid__toolbar" role="toolbar" aria-label={`${title} commands`}>
          <Button appearance="subtle" size="small" disabled title="Preview only">
            Add
          </Button>
          <Button appearance="subtle" size="small" disabled title="Preview only">
            Remove
          </Button>
        </div>
      </div>
      <div className="student-detail__subgrid__body">{children}</div>
    </div>
  );
}

export default function StudentRelatedGrids({
  studentId,
  courseLinks = studentCourseLinks,
  lecturerLinks = studentLecturerLink,
}) {
  const courses = useMemo(
    () => getCoursesForStudent(studentId, courseLinks),
    [studentId, courseLinks]
  );
  const lecturer = useMemo(
    () => getAssignedLecturer(studentId, lecturerLinks),
    [studentId, lecturerLinks]
  );

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lecturerRowSelected, setLecturerRowSelected] = useState(false);
  const [hint, setHint] = useState("");

  const showHint = (msg) => setHint(msg);

  return (
    <div className="student-detail__related-wrap">
      <SubGridChrome title="Courses" count={courses.length}>
        {courses.length === 0 ? (
          <p className="student-detail__subgrid__empty">No courses linked to this student.</p>
        ) : (
          <Table size="small" className="student-detail__related-table" aria-label="Related courses">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Course ID</TableHeaderCell>
                <TableHeaderCell>Course name</TableHeaderCell>
                <TableHeaderCell>Faculty / department</TableHeaderCell>
                <TableHeaderCell>Duration</TableHeaderCell>
                <TableHeaderCell>Credits</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow
                  key={c.courseId}
                  className={
                    selectedCourseId === c.courseId ? "student-detail__subgrid-row--selected" : undefined
                  }
                  onClick={() => setSelectedCourseId(c.courseId)}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="student-detail__subgrid-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        showHint(`Preview: open course ${c.courseId}`);
                      }}
                    >
                      {c.courseId}
                    </button>
                  </TableCell>
                  <TableCell>{c.courseName}</TableCell>
                  <TableCell>{c.facultyDepartment}</TableCell>
                  <TableCell>{c.duration}</TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell>
                    <span className="student-detail__subgrid__actions">
                      <Button
                        appearance="transparent"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          showHint(`Preview: view course ${c.courseId}`);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        appearance="transparent"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          showHint(`Preview: remove course ${c.courseId} from student`);
                        }}
                      >
                        Remove
                      </Button>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SubGridChrome>

      <SubGridChrome title="Lecturer" count={lecturer ? 1 : 0}>
        {!lecturer ? (
          <p className="student-detail__subgrid__empty">No lecturer assigned.</p>
        ) : (
          <Table size="small" className="student-detail__related-table" aria-label="Assigned lecturer">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Lecturer ID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                className={lecturerRowSelected ? "student-detail__subgrid-row--selected" : undefined}
                onClick={() => setLecturerRowSelected((s) => !s)}
              >
                <TableCell>
                  <button
                    type="button"
                    className="student-detail__subgrid-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      showHint(`Preview: open lecturer ${lecturer.lecturerId}`);
                    }}
                  >
                    {lecturer.lecturerId}
                  </button>
                </TableCell>
                <TableCell>{lecturer.name}</TableCell>
                <TableCell>{lecturer.email}</TableCell>
                <TableCell>{lecturer.department}</TableCell>
                <TableCell>
                  <span className="student-detail__subgrid__actions">
                    <Button
                      appearance="transparent"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        showHint(`Preview: view lecturer ${lecturer.lecturerId}`);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      appearance="transparent"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        showHint(`Preview: change lecturer assignment`);
                      }}
                    >
                      Change
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </SubGridChrome>

      {hint ? (
        <p className="student-detail__subgrid-hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
