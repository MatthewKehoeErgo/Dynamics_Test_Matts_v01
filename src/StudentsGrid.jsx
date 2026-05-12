import { useCallback, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Input,
  TableCellLayout,
  createTableColumn,
} from "@fluentui/react-components";
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowExportRegular,
  ArrowImportRegular,
  BookContactsRegular,
  ChevronDownRegular,
  ColumnTripleEditRegular,
  DataBarVerticalRegular,
  DataPieRegular,
  DeleteRegular,
  DocumentBulletListRegular,
  DocumentRegular,
  FilterRegular,
  FlowRegular,
  GridRegular,
  LinkRegular,
  PeopleRegular,
  SearchRegular,
  SettingsRegular,
  ShareRegular,
  TableRegular,
} from "@fluentui/react-icons";
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

function OwnerCell({ name }) {
  return (
    <span className="dynamics-owner-cell">
      <Avatar name={name} size={24} color="colorful" />
      <span className="dynamics-owner-cell__name">{name}</span>
    </span>
  );
}

export default function StudentsGrid({ students, onOpenStudent, onOpenApplication }) {
  const [filter, setFilter] = useState("");

  /** Mock command bar — delete / refresh stay inert for the prototype */
  const onMockCommand = useCallback(() => {
    /* No-op until wired to create/delete/refresh APIs */
  }, []);

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return students;
    return students.filter((row) =>
      [row.studentId, row.fullName, row.email, row.status, row.ownerName].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [filter, students]);

  const columns = useMemo(
    () => [
      createTableColumn({
        columnId: "studentId",
        compare: (a, b) => a.studentId.localeCompare(b.studentId),
        renderHeaderCell: () => "Student ID",
        renderCell: (item) => (
          <button
            type="button"
            className="dynamics-grid-link"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStudent?.(item.studentId);
            }}
            aria-label={`Open student ${item.studentId}`}
          >
            {item.studentId}
          </button>
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
        columnId: "ownerName",
        compare: (a, b) => a.ownerName.localeCompare(b.ownerName),
        renderHeaderCell: () => "Owner",
        renderCell: (item) => <OwnerCell name={item.ownerName} />,
      }),
      createTableColumn({
        columnId: "createdOn",
        compare: (a, b) => a.createdOn.getTime() - b.createdOn.getTime(),
        renderHeaderCell: () => "Created On",
        renderCell: (item) => dateFmt.format(item.createdOn),
      }),
    ],
    [onOpenStudent]
  );

  /** Default widths + mins — Fluent applies drag resize via `TableResizeHandle` in header cells */
  const columnSizingOptions = useMemo(
    () => ({
      studentId: { defaultWidth: 112, minWidth: 72 },
      fullName: { defaultWidth: 156, minWidth: 96 },
      email: { defaultWidth: 228, minWidth: 140 },
      status: { defaultWidth: 104, minWidth: 80 },
      ownerName: { defaultWidth: 176, minWidth: 120 },
      createdOn: { defaultWidth: 168, minWidth: 128 },
    }),
    []
  );

  return (
    <div className="dynamics-app">
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
        <nav className="dynamics-sitemap" aria-label="Site map">
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
        </nav>

        <main className="dynamics-main">
          <div className="dynamics-main-surface">
            <div className="dynamics-surface-card dynamics-surface-card--command">
              <div className="dynamics-commandbar" role="toolbar" aria-label="Commands">
                <div className="dynamics-commandbar__scroll">
              <Button
                appearance="subtle"
                type="button"
                onClick={onMockCommand}
                title="Preview only — chart view"
              >
                <span className="dynamics-cmd-btn__inner">
                  <DataBarVerticalRegular className="dynamics-cmd-btn__icon" />
                  <span>Show Chart</span>
                </span>
              </Button>
              <Button
                appearance="subtle"
                type="button"
                onClick={() => onOpenApplication?.()}
                title="Create a new student via university application"
              >
                <span className="dynamics-cmd-btn__inner">
                  <AddRegular className="dynamics-cmd-btn__icon" />
                  <span>New</span>
                </span>
              </Button>
              <Button
                appearance="subtle"
                type="button"
                onClick={onMockCommand}
                title="Preview only — delete options"
              >
                <span className="dynamics-cmd-btn__inner">
                  <DeleteRegular className="dynamics-cmd-btn__icon" />
                  <span>Delete</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — refresh list">
                <span className="dynamics-cmd-btn__inner">
                  <ArrowClockwiseRegular className="dynamics-cmd-btn__icon" />
                  <span>Refresh</span>
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — Power BI visualize">
                <span className="dynamics-cmd-btn__inner">
                  <DataPieRegular className="dynamics-cmd-btn__icon" />
                  <span>Visualize this view</span>
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — email link">
                <span className="dynamics-cmd-btn__inner">
                  <LinkRegular className="dynamics-cmd-btn__icon" />
                  <span>Email a Link</span>
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — Power Automate">
                <span className="dynamics-cmd-btn__inner">
                  <FlowRegular className="dynamics-cmd-btn__icon" />
                  <span>Flow</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — reporting">
                <span className="dynamics-cmd-btn__inner">
                  <DocumentBulletListRegular className="dynamics-cmd-btn__icon" />
                  <span>Run Report</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — Excel templates">
                <span className="dynamics-cmd-btn__inner">
                  <TableRegular className="dynamics-cmd-btn__icon" />
                  <span>Excel Templates</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — export">
                <span className="dynamics-cmd-btn__inner">
                  <ArrowExportRegular className="dynamics-cmd-btn__icon" />
                  <span>Export to Excel</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
              <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — import">
                <span className="dynamics-cmd-btn__inner">
                  <ArrowImportRegular className="dynamics-cmd-btn__icon" />
                  <span>Import from Excel</span>
                  <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                </span>
              </Button>
                </div>
                <div className="dynamics-commandbar__right">
                  <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — sharing">
                    <span className="dynamics-cmd-btn__inner">
                      <ShareRegular className="dynamics-cmd-btn__icon" />
                      <span>Share</span>
                      <ChevronDownRegular className="dynamics-cmd-btn__chevron" aria-hidden="true" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="dynamics-surface-card dynamics-surface-card--view">
              <section className="dynamics-view" aria-label="Students view">
                <div className="dynamics-view-toolbar">
                  <div className="dynamics-view-toolbar__title-wrap">
                    <h1 className="dynamics-view-title">Active Students</h1>
                  </div>
                  <div className="dynamics-view-toolbar__controls">
                    <button type="button" className="dynamics-view-toolbar__link dynamics-view-toolbar__link--icon">
                      <ColumnTripleEditRegular className="dynamics-view-toolbar__link-icon" aria-hidden="true" />
                      Edit columns
                    </button>
                    <button type="button" className="dynamics-view-toolbar__link dynamics-view-toolbar__link--icon">
                      <FilterRegular className="dynamics-view-toolbar__link-icon" aria-hidden="true" />
                      Edit filters
                    </button>
                    <Input
                      className="dynamics-keyword-search"
                      placeholder="Filter by keyword"
                      value={filter}
                      onChange={(_, d) => setFilter(d.value)}
                      contentBefore={<SearchRegular className="dynamics-keyword-search__icon" />}
                      aria-label="Filter by keyword"
                    />
                  </div>
                </div>

                <div className="dynamics-grid-card">
                  <div className="dynamics-grid-scroll dynamics-grid-scroll--list">
                    <div className="dynamics-grid-scroll__inner">
                      <DataGrid
                        items={filteredItems}
                        columns={columns}
                        sortable
                        defaultSortState={{ sortColumn: "createdOn", sortDirection: "descending" }}
                        resizableColumns
                        columnSizingOptions={columnSizingOptions}
                        resizableColumnsOptions={{ autoFitColumns: false }}
                        selectionMode="multiselect"
                        selectionAppearance="neutral"
                        subtleSelection
                        size="small"
                        getRowId={(item) => item.studentId}
                        focusMode="composite"
                        aria-label="Students — sortable, resizable columns"
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
                            <DataGridRow
                              key={rowId}
                              selectionCell={{ "aria-label": "Select row" }}
                              onDoubleClick={(e) => {
                                e.preventDefault();
                                onOpenStudent?.(item.studentId);
                              }}
                            >
                              {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                            </DataGridRow>
                          )}
                        </DataGridBody>
                      </DataGrid>
                      <footer className="dynamics-grid-footer">
                        Rows: {filteredItems.length}
                      </footer>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
