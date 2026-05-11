import { useMemo } from "react";
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  TableCellLayout,
  createTableColumn,
} from "@fluentui/react-components";
import { mockStudents } from "./mockStudents.js";
import "./StudentsGrid.css";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function statusClass(status) {
  const key = String(status).toLowerCase();
  return `dynamics-status dynamics-status--${key}`;
}

function StatusCell({ status }) {
  return <span className={statusClass(status)}>{status}</span>;
}

export default function StudentsGrid() {
  const columns = useMemo(
    () => [
      createTableColumn({
        columnId: "studentId",
        compare: (a, b) => a.studentId.localeCompare(b.studentId),
        renderHeaderCell: () => "Student ID",
        renderCell: (item) => (
          <TableCellLayout truncate title={item.studentId}>
            {item.studentId}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "fullName",
        compare: (a, b) => a.fullName.localeCompare(b.fullName),
        renderHeaderCell: () => "Name",
        renderCell: (item) => (
          <TableCellLayout truncate title={item.fullName}>
            {item.fullName}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "email",
        compare: (a, b) => a.email.localeCompare(b.email),
        renderHeaderCell: () => "Email",
        renderCell: (item) => (
          <TableCellLayout truncate title={item.email}>
            {item.email}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "status",
        compare: (a, b) => a.status.localeCompare(b.status),
        renderHeaderCell: () => "Status",
        renderCell: (item) => <StatusCell status={item.status} />,
      }),
      createTableColumn({
        columnId: "createdOn",
        compare: (a, b) => a.createdOn.getTime() - b.createdOn.getTime(),
        renderHeaderCell: () => "Created On",
        renderCell: (item) => dateFmt.format(item.createdOn),
      }),
    ],
    []
  );

  return (
    <div className="dynamics-shell">
      <div className="dynamics-shell__inner">
        <header className="dynamics-shell__title-row">
          <h1 className="dynamics-shell__title">Students</h1>
          <p className="dynamics-shell__subtitle">Active students · System view</p>
        </header>

        <section className="dynamics-grid-card" aria-label="Students list">
          <div className="dynamics-grid-card__header">
            <span className="dynamics-grid-card__header-label">All students</span>
          </div>
          <div className="dynamics-grid-scroll">
            <DataGrid
              items={mockStudents}
              columns={columns}
              sortable
              selectionMode="multiselect"
              selectionAppearance="neutral"
              subtleSelection
              size="small"
              getRowId={(item) => item.studentId}
              focusMode="composite"
              style={{ minWidth: 720 }}
            >
              <DataGridHeader>
                <DataGridRow selectionCell={{ "aria-label": "Select all rows" }}>
                  {({ renderHeaderCell }) => (
                    <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                  )}
                </DataGridRow>
              </DataGridHeader>
              <DataGridBody>
                {({ item, rowId }) => (
                  <DataGridRow key={rowId} selectionCell={{ "aria-label": "Select row" }}>
                    {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                  </DataGridRow>
                )}
              </DataGridBody>
            </DataGrid>
          </div>
        </section>
      </div>
    </div>
  );
}
