import { useCallback, useMemo, useState } from "react";
import {
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
  BuildingRegular,
  ChevronDownRegular,
  ClockRegular,
  ColumnTripleEditRegular,
  DataBarVerticalRegular,
  DataPieRegular,
  DeleteRegular,
  DocumentBulletListRegular,
  DocumentRegular,
  FilterRegular,
  FlowRegular,
  HomeRegular,
  LineHorizontal3Regular,
  LinkRegular,
  PeopleRegular,
  PeopleTeamRegular,
  PersonRegular,
  PinRegular,
  SearchRegular,
  SettingsRegular,
  ShareRegular,
  TableRegular,
} from "@fluentui/react-icons";
import { DynamicsViewTitlePicker, HeaderMenu, dynamicsListDateFmt as dateFmt } from "./dynamicsListViewHelpers.jsx";
import PowerAppsAppLauncherIcon from "./PowerAppsAppLauncherIcon.jsx";
import "./StudentsGrid.css";

const LECTURER_VIEWS = [
  { id: "all", label: "All Lecturers", isDefault: true },
  { id: "fulltime", label: "Full-time faculty", isDefault: false },
  { id: "stem", label: "STEM departments", isDefault: false },
  { id: "arts", label: "Arts & Humanities", isDefault: false },
  { id: "business", label: "Business & Economics", isDefault: false },
  { id: "active", label: "Active lecturers", isDefault: false },
];

function CoursesCell({ courses }) {
  if (!courses || courses.length === 0) {
    return <span className="dynamics-grid-empty">No courses</span>;
  }
  const label = courses.map((c) => c.courseId).join(", ");
  const tooltip = courses.map((c) => `${c.courseId} — ${c.courseName}`).join("\n");
  return (
    <span className="dynamics-courses-cell" title={tooltip}>
      <span className="dynamics-courses-cell__count">{courses.length}</span>
      <span className="dynamics-courses-cell__list">{label}</span>
    </span>
  );
}

export default function LecturersGrid({
  lecturers,
  onOpenLecturer,
  onNavigateStudents,
  onNavigateStaff,
  onNavigateLecturers,
  onNavigateApplications,
  onNavigateCourses,
  onNavigateDepartments,
  sitemapCollapsed = false,
  onToggleSitemap,
}) {
  const [filter, setFilter] = useState("");
  const [sortState, setSortState] = useState({
    sortColumn: "createdOn",
    sortDirection: "descending",
  });
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [selectedViewId, setSelectedViewId] = useState(LECTURER_VIEWS[0].id);

  const onMockCommand = useCallback(() => {
    /* No-op until wired to create/delete/refresh APIs */
  }, []);

  const handleColumnSort = useCallback((columnId, direction) => {
    setSortState({ sortColumn: columnId, sortDirection: direction });
  }, []);

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter((row) => {
      const courseTokens = (row.taughtCourses ?? []).flatMap((c) => [c.courseId, c.courseName]);
      return [row.lecturerId, row.name, row.email, row.department, row.coursesLabel, ...courseTokens].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [filter, lecturers]);

  const columns = useMemo(() => {
    const headerOf = (columnId, label) => (
      <HeaderMenu
        columnId={columnId}
        label={label}
        sortState={sortState}
        onSort={handleColumnSort}
        onMockCommand={onMockCommand}
      />
    );
    return [
      createTableColumn({
        columnId: "lecturerId",
        compare: (a, b) => a.lecturerId.localeCompare(b.lecturerId),
        renderHeaderCell: () => headerOf("lecturerId", "Lecturer ID"),
        renderCell: (item) => (
          <button
            type="button"
            className="dynamics-grid-link"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLecturer?.(item.lecturerId);
            }}
            aria-label={`Open lecturer ${item.lecturerId}`}
          >
            {item.lecturerId}
          </button>
        ),
      }),
      createTableColumn({
        columnId: "name",
        compare: (a, b) => a.name.localeCompare(b.name),
        renderHeaderCell: () => headerOf("name", "Name"),
        renderCell: (item) => (
          <TableCellLayout truncate title={item.name}>
            {item.name}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "email",
        compare: (a, b) => a.email.localeCompare(b.email),
        renderHeaderCell: () => headerOf("email", "Email"),
        renderCell: (item) => (
          <TableCellLayout truncate title={item.email}>
            {item.email}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "department",
        compare: (a, b) => a.department.localeCompare(b.department),
        renderHeaderCell: () => headerOf("department", "Department"),
        renderCell: (item) => (
          <TableCellLayout truncate title={item.department}>
            {item.department}
          </TableCellLayout>
        ),
      }),
      createTableColumn({
        columnId: "courses",
        compare: (a, b) => a.coursesLabel.localeCompare(b.coursesLabel),
        renderHeaderCell: () => headerOf("courses", "Courses"),
        renderCell: (item) => <CoursesCell courses={item.taughtCourses} />,
      }),
      createTableColumn({
        columnId: "createdOn",
        compare: (a, b) => a.createdOn.getTime() - b.createdOn.getTime(),
        renderHeaderCell: () => headerOf("createdOn", "Created On"),
        renderCell: (item) => dateFmt.format(item.createdOn),
      }),
    ];
  }, [sortState, handleColumnSort, onMockCommand, onOpenLecturer]);

  const columnSizingOptions = useMemo(
    () => ({
      lecturerId: { defaultWidth: 140, minWidth: 80 },
      name: { defaultWidth: 160, minWidth: 80 },
      email: { defaultWidth: 180, minWidth: 80 },
      department: { defaultWidth: 160, minWidth: 80 },
      courses: { defaultWidth: 200, minWidth: 80 },
      createdOn: { defaultWidth: 160, minWidth: 80 },
    }),
    []
  );

  return (
    <div className={`dynamics-app ${sitemapCollapsed ? "dynamics-app--sitemap-collapsed" : ""}`}>
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
              <button type="button" className="dynamics-sitemap__item" onClick={() => onNavigateStudents?.()}>
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
              <button type="button" className="dynamics-sitemap__item dynamics-sitemap__item--active" onClick={() => onNavigateLecturers?.()}>
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

        <main className="dynamics-main">
          <div className="dynamics-main-surface" data-review-mode-scroll-root>
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
                  <Button appearance="subtle" type="button" onClick={onMockCommand} title="Preview only — new lecturer">
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
              <section className="dynamics-view" aria-label="Lecturers view">
                <div className="dynamics-view-toolbar">
                  <div className="dynamics-view-toolbar__title-wrap">
                    <DynamicsViewTitlePicker
                      views={LECTURER_VIEWS}
                      selectedViewId={selectedViewId}
                      onSelectViewId={setSelectedViewId}
                      onManageViews={onMockCommand}
                    />
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
                      contentBefore={<SearchRegular className="dynamics-keyword-search__icon" aria-hidden />}
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
                        sortState={sortState}
                        onSortChange={(_, next) => setSortState(next)}
                        resizableColumns
                        columnSizingOptions={columnSizingOptions}
                        resizableColumnsOptions={{ autoFitColumns: true }}
                        selectionMode="multiselect"
                        selectionAppearance="neutral"
                        subtleSelection
                        selectedItems={selectedRows}
                        onSelectionChange={(_, data) => setSelectedRows(data.selectedItems)}
                        size="small"
                        getRowId={(item) => item.lecturerId}
                        focusMode="composite"
                        aria-label="Lecturers — sortable, resizable columns"
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
                                onOpenLecturer?.(item.lecturerId);
                              }}
                            >
                              {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                            </DataGridRow>
                          )}
                        </DataGridBody>
                      </DataGrid>
                      <footer className="dynamics-grid-footer">
                        <span className="dynamics-grid-footer__count">Rows: {filteredItems.length}</span>
                        {selectedRows.size > 0 ? (
                          <>
                            <span className="dynamics-grid-footer__divider" aria-hidden="true">
                              |
                            </span>
                            <span className="dynamics-grid-footer__count">{selectedRows.size} selected</span>
                          </>
                        ) : null}
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
