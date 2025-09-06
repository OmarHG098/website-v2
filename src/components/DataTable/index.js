import React from "react";
import { Div } from "../Sections";
import { H2, Paragraph } from "../Heading";
import { Colors } from "../Styling";
import { TableHeader, TableRow } from "./table-components";

/**
 * DataTable - Reusable component for displaying data tables
 *
 * Features:
 * - Fully reusable with any data structure
 * - Advanced responsive design with horizontal scroll on mobile
 * - Prevents text compression on small screens
 * - HTML content support in cells
 * - Sticky headers with mobile-optimized spacing
 * - Customizable styles for table, headers and cells
 * - Flexible CSS grid system (2-5 columns recommended)
 * - Touch-friendly scrolling with custom scrollbar styling
 *
 * Responsive Behavior:
 * - Mobile: Horizontal scroll with minimum cell width (120px)
 * - Tablet+: Natural grid layout with text wrapping
 * - Prevents content compression following shadcn/ui best practices
 *
 * @param {Object|string} title - Table title (object with properties or simple string)
 * @param {string} sub_title - Optional subtitle text displayed below the main title
 * @param {Array} columns - Array of objects with structure: [{text: string, style: object}]
 * @param {Array} rows - Array of arrays, each row contains cells: [[cell1, cell2, ...], ...]
 * @param {Object} headerStyle - Custom styles for headers
 * @param {Object} cellStyle - Custom styles for cells
 * @param {Object} tableStyle - Custom styles for table
 * @param {boolean} responsive - Enable responsive behavior (default: true)
 * @param {boolean} stickyHeaders - Enable sticky positioning for the column headers on scroll with optimized mobile spacing (default: false)
 * @param {boolean} withBorder - Whether to apply border and shadow styling (default: false)
 * @param {string|number} borderRadius - Border radius for all table corners. Can be a string (e.g., "8px") or number (e.g., 8) (default: "0px")
 *
 * Usage example:
 * <DataTable
 *   title="Program Comparison"
 *   borderRadius="8px"
 *   columns={[
 *     {text: "Category", style: {fontWeight: "bold"}},
 *     {text: "Program A"},
 *     {text: "Program B"}
 *   ]}
 *   rows={[
 *     ["Duration", "6 months", "9 months"],
 *     ["Price", "$5000", "$7000"]
 *   ]}
 * />
 *
 * YAML Integration:
 * - Structure: data_table.title, data_table.sub_title, data_table.columns, data_table.rows
 * - GraphQL query: data_table { title { text } sub_title columns { text } rows }
 * - Row structure with buttons:
 *   rows:
 *     - cells:
 *         - content: "Cell content here"
 *           html: false  # Set to true if content contains HTML
 *           icon: "check"  # Optional icon name
 *           icon_position: "left"  # 'left' or 'right' (default: 'left')
 *           icon_color: "#000000"  # Optional icon color
 *         - content: "Another cell"
 *           html: true
 *         - content: "Ready to start?"
 *           primary_action:
 *             text: "Learn More"
 *             path: "/us/course/full-stack"
 *           secondary_action:
 *             text: "Apply Now"
 *             path: "/us/apply"
 */
const DataTable = ({
  title,
  sub_title,
  columns = [],
  rows = [],
  headerStyle = {},
  cellStyle = {},
  tableStyle = {},
  responsive = true,
  stickyHeaders = false,
  withBorder = false,
  borderRadius = "0px",
  ...props
}) => {
  const columnCount = columns.length;
  const gridColumns = `1fr repeat(${columnCount - 1}, 1fr)`;
  const gridColumns_tablet = responsive
    ? `repeat(${columnCount}, 1fr)`
    : gridColumns;

  const borderWidth = 3;
  const borderRadiusValue =
    typeof borderRadius === "number" ? borderRadius : parseFloat(borderRadius);
  const borderRadiusValuePx = `${borderRadiusValue}px`;
  const calculatedRadius = Math.max(0, borderRadiusValue - borderWidth);
  const childBorderRadiusValue = `${calculatedRadius}px`;
  const childBorderRadius = `${childBorderRadiusValue} ${childBorderRadiusValue} ${childBorderRadiusValue} ${childBorderRadiusValue}`;

  return (
    <Div
      display="block"
      padding="40px 17px"
      padding_tablet="60px 40px"
      padding_md={withBorder ? "60px 80px 90px 80px" : "60px 80px"}
      padding_lg="60px 0"
      maxWidth="1280px"
      margin="0 auto"
      {...props}
    >
      {title && (
        <H2
          type="h2"
          maxWidth="800px"
          textAlign="center"
          margin="0 auto 20px auto"
          textWrap="balance"
          fontSize="28px"
          fontSize_tablet="35px"
          fontWeight="700"
          {...title}
        >
          {title.text || title}
        </H2>
      )}

      {sub_title && (
        <Paragraph
          textAlign="center"
          margin="0 auto 40px auto"
          fontSize="16px"
          fontSize_tablet="18px"
          color={Colors.darkGray}
          textWrap="balance"
          margin_tablet="0 auto 40px auto"
        >
          {sub_title}
        </Paragraph>
      )}

      {/* Responsive table wrapper with horizontal scroll */}
      <Div
        as="div"
        display="block"
        overflowX="auto"
        overflowY={stickyHeaders ? "auto" : "visible"}
        maxHeight={stickyHeaders ? "620px" : "none"}
        borderRadius={borderRadiusValuePx}
        border={
          withBorder
            ? `${borderWidth}px solid #000`
            : `2.5px solid ${Colors.borderGray}`
        }
        boxShadow={withBorder ? "22px 26px 0px 0px rgba(0,0,0,1)" : undefined}
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: `${Colors.darkGray} ${Colors.lightGray}`,
        }}
      >
        {/* Semantic HTML Table */}
        <Div
          as="table"
          display="block"
          borderRadius={borderRadiusValuePx}
          minWidth="600px"
          minWidth_tablet="auto"
          {...tableStyle}
        >
          <TableHeader
            columns={columns}
            headerStyle={headerStyle}
            stickyHeaders={stickyHeaders}
            gridColumns={gridColumns}
            gridColumns_tablet={gridColumns_tablet}
            childBorderRadius={childBorderRadius}
            borderRadiusValue={borderRadiusValue}
          />

          {/* Table Body */}
          <Div
            as="tbody"
            display="grid"
            gridTemplateColumns={gridColumns}
            gridTemplateColumns_tablet={gridColumns_tablet}
            gridGap="1px"
          >
            {rows.map((row, rowIndex) => (
              <TableRow
                key={`row-${rowIndex}`}
                row={row}
                rowIndex={rowIndex}
                totalRows={rows.length}
                totalColumns={columns.length}
                cellStyle={cellStyle}
                childBorderRadius={childBorderRadius}
              />
            ))}
          </Div>
        </Div>
      </Div>
    </Div>
  );
};

export default DataTable;
