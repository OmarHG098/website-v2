import React from "react";
import { Link } from "gatsby";
import { Div, Grid } from "../Sections";
import { H2, H3, H4, Paragraph } from "../Heading";
import { Colors } from "../Styling";
import Icon from "../Icon";

// Internal component to render cell content with optional icons
const CellContent = ({ cell, cellStyle, isHeaderCell = false }) => {
  const TextComponent = isHeaderCell ? H4 : Paragraph;
  const textProps = isHeaderCell 
    ? {
        type: "h4",
        fontWeight: "700",
        fontSize: "15px",
        fontSize_tablet: "16px",
        color: Colors.darkGray,
        textAlign: "left",
        letterSpacing: "0.3px"
      }
    : {
        fontWeight: "400",
        color: Colors.black,
        textAlign: cell?.text_align || "left",
        lineHeight: "1.4"
      };

  // Determinar si hay contenido para mostrar
  const cellContent = typeof cell === "string" ? cell : cell.content || "";
  const hasContent = cellContent && cellContent.trim() !== "";
  const hasIcon = cell.icon;

  // Si no hay contenido ni icono, no renderizar nada
  if (!hasContent && !hasIcon) {
    return null;
  }

  if (!hasIcon) {
    // Render without icon
    return (
      <TextComponent
        fontSize={cellStyle?.fontSize || "13px"}
        fontSize_tablet={cellStyle?.fontSize_tablet || "14px"}
        margin="0"
        {...textProps}
        {...(cell.html
          ? {
              dangerouslySetInnerHTML: {
                __html: cellContent,
              },
            }
          : {
              children: cellContent,
            })}
      />
    );
  }

  // Render with icon
  return (
    <Div
      display="flex"
      alignItems="center"
      justifyContent={(isHeaderCell || cell?.text_align !== "center") ? "flex-start" : "center"}
      gap={cell.gap || "8px"}
      flexDirection={cell.icon_position === "right" ? "row" : "row"}
    >
      {(!cell.icon_position || cell.icon_position === "left") && (
        <Icon
          style={{ flexShrink: 0, ...cell.icon_style }}
          icon={cell.icon}
          width={cell.size || "16px"}
          height={cell.size || "16px"}
          color={cell.icon_color || (isHeaderCell ? Colors.darkGray : Colors.black)}
        />
      )}
      {hasContent && (
        <TextComponent
          fontSize={cellStyle?.fontSize || "13px"}
          fontSize_tablet={cellStyle?.fontSize_tablet || "14px"}
          margin="0"
          {...textProps}
          {...(cell.html
            ? {
                dangerouslySetInnerHTML: {
                  __html: cellContent,
                },
              }
            : {
                children: cellContent,
              })}
        />
      )}
      {cell.icon_position === "right" && (
        <Icon
          icon={cell.icon}
          style={{ flexShrink: 0, ...cell.icon_style }}
          width={cell.size || "16px"}
          height={cell.size || "16px"}
          color={cell.icon_color || (isHeaderCell ? Colors.darkGray : Colors.black)}
        />
      )}
    </Div>
  );
};

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

  // Sticky header styles
  const stickyHeaderStyles = stickyHeaders
    ? {
        position: "sticky",
        top: "0",
        zIndex: "10",
        backgroundColor: Colors.white,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }
    : {};

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
        // Webkit scrollbar styling for better UX
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
          // background={Colors.lightGray}
          minWidth="600px" // Minimum width to prevent compression
          minWidth_tablet="auto" // Allow natural width on tablets and up
          {...tableStyle}
        >
          {/* Table Header */}
          <Div
            as="thead"
            display="grid"
            borderRadius={borderRadiusValuePx}
            gridTemplateColumns={gridColumns}
            gridTemplateColumns_tablet={gridColumns_tablet}
            gridGap="1px"
            {...(stickyHeaders ? stickyHeaderStyles : {})}
          >
            <Div as="tr" display="contents">
              {columns.map((column, index) => {
                // Determine border-radius for header corners
                const isFirstColumn = index === 0;
                const isLastColumn = index === columns.length - 1;
                let headerBorderRadius = "0px";

                if (isFirstColumn) {
                  // Top left corner
                  const [topLeft] = childBorderRadius.split(" ");
                  headerBorderRadius = `${topLeft} 0px 0px 0px`;
                } else if (isLastColumn) {
                  // Top right corner
                  const borderValues = childBorderRadius.split(" ");
                  const topRight = borderValues[1] || borderValues[0];
                  headerBorderRadius = `0px ${topRight} 0px 0px`;
                }

                return (
                  <Div
                    as="th"
                    key={`header-${index}`}
                    background={index === 0 ? Colors.black : Colors.white}
                    padding={stickyHeaders ? "8px 16px" : "15px"}
                    padding_tablet="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent={index === 0 ? "flex-start" : "center"}
                    borderBottom={`2px solid ${Colors.lightGray}`}
                    borderRight={
                      index < columns.length - 1
                        ? `1px solid ${Colors.borderGray}`
                        : "none"
                    }
                    borderRadius={headerBorderRadius}
                    minWidth="120px" // Prevent cell compression
                    minWidth_tablet="auto" // Allow natural width on larger screens
                    whiteSpace="nowrap" // Prevent text wrapping on mobile
                    whiteSpace_tablet="normal" // Allow wrapping on tablets and up
                    scope={index === 0 ? "row" : "col"}
                    {...headerStyle}
                  >
                    <H3
                      type="h3"
                      fontSize={stickyHeaders ? "14px" : "16px"}
                      fontSize_tablet="18px"
                      fontWeight="600"
                      color={index === 0 ? Colors.white : Colors.darkGray}
                      margin="0"
                      textAlign={index === 0 ? "left" : "center"}
                    >
                      {column.title || column}
                    </H3>
                  </Div>
                );
              })}
            </Div>
          </Div>

          {/* Table Body */}
          <Div
            as="tbody"
            display="grid"
            gridTemplateColumns={gridColumns}
            gridTemplateColumns_tablet={gridColumns_tablet}
            gridGap="1px"
          >
            {rows.map((row, rowIndex) => (
              <Div as="tr" key={`row-${rowIndex}`} display="contents">
                {row.cells?.map((cell, cellIndex) => {
                  const isLastRow = rowIndex === rows.length - 1;
                  const isFirstColumn = cellIndex === 0;
                  const isLastColumn = cellIndex === row.cells.length - 1;
                  let cellBorderRadius = "0px";

                  if (isLastRow) {
                    if (isFirstColumn) {
                      // Esquina inferior izquierda
                      const borderValues = childBorderRadius.split(" ");
                      const bottomLeft =
                        borderValues[3] || borderValues[2] || borderValues[0];
                      cellBorderRadius = `0px 0px 0px ${bottomLeft}`;
                    } else if (isLastColumn) {
                      // Esquina inferior derecha
                      const borderValues = childBorderRadius.split(" ");
                      const bottomRight = borderValues[2] || borderValues[0];
                      cellBorderRadius = `0px 0px ${bottomRight} 0px`;
                    }
                  }

                  return (
                    <Div
                      as={cellIndex === 0 ? "th" : "td"}
                      key={`cell-${rowIndex}-${cellIndex}`}
                      background={Colors.white}
                      padding="15px"
                      padding_tablet="20px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      // alignItems={cellIndex === 0 ? "center" : "flex-start"}
                      justifyContent="center"
                      // justifyContent={cellIndex === 0 ? "flex-start" : "center"}
                      borderBottom={
                        rowIndex < rows.length - 1
                          ? `1px solid ${Colors.borderGray}`
                          : "none"
                      }
                      borderRight={
                        cellIndex < row.cells.length - 1
                          ? `1px solid ${Colors.borderGray}`
                          : "none"
                      }
                      borderRadius={cellBorderRadius}
                      minHeight="80px"
                      minWidth="120px" // Prevent cell compression
                      minWidth_tablet="auto" // Allow natural width on larger screens
                      whiteSpace="nowrap" // Prevent text wrapping on mobile
                      whiteSpace_tablet="normal" // Allow wrapping on tablets and up
                      scope={cellIndex === 0 ? "row" : undefined}
                      // {...cellStyle}
                    >
                      {cellIndex === 0 ? (
                        <CellContent 
                          cell={cell} 
                          cellStyle={cellStyle} 
                          isHeaderCell={true} 
                        />
                      ) : (
                        <>
                          <CellContent 
                            cell={cell} 
                            cellStyle={cellStyle} 
                            isHeaderCell={false} 
                          />
                          {(cell.primary_action || cell.secondary_action) && (
                            <Div
                              as="div"
                              width="100%"
                              display="flex"
                              flexDirection="column"
                              gap="10px"
                              alignItems="center"
                              margin="10px 0"
                            >
                              {cell.primary_action &&
                                cell.primary_action?.text && (
                                  <Link
                                    to={cell.primary_action.path}
                                    state={cell.primary_action.link_state}
                                    className="primary-button-hover"
                                    style={{
                                      background: Colors.blue,
                                      color: Colors.white,
                                      padding: "14px",
                                      fontFamily: "Lato",
                                      fontWeight: "700",
                                      borderRadius: "4px",
                                      fontSize: "14px",
                                      textAlign: "center",
                                      width: "100%",
                                      marginRight: "8px",
                                      textDecoration: "none",
                                      display: "inline-block",
                                      transition: "background-color 0.3s ease",
                                    }}
                                  >
                                    {cell.primary_action.text}
                                  </Link>
                                )}
                              {cell.secondary_action &&
                                cell.secondary_action?.text && (
                                  <Link
                                    to={cell.secondary_action.path}
                                    state={cell.secondary_action.link_state}
                                    className="secondary-button-hover"
                                    style={{
                                      background: Colors.white,
                                      color: Colors.blue,
                                      border: `1px solid ${Colors.blue}`,
                                      padding: "14px",
                                      fontFamily: "Lato",
                                      fontWeight: "700",
                                      borderRadius: "4px",
                                      fontSize: "14px",
                                      textAlign: "center",
                                      width: "100%",
                                      textDecoration: "none",
                                      display: "inline-block",
                                    }}
                                  >
                                    {cell.secondary_action.text}
                                  </Link>
                                )}
                            </Div>
                          )}
                        </>
                      )}
                    </Div>
                  );
                })}
              </Div>
            ))}
          </Div>
        </Div>
      </Div>
    </Div>
  );
};

export default DataTable;
