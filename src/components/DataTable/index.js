import React, { useState } from "react";
import { Div } from "../Sections";
import { H2, Paragraph } from "../Heading";
import { Colors } from "../Styling";
import Icon from "../Icon";
import { TableHeader, TableRow } from "./table-components";

/**
 * @typedef {Object} DataAction
 * @property {string} text
 * @property {string} path
 *
 * @typedef {Object} DataCellObject
 * @property {string} content
 * @property {boolean} [html]
 * @property {string} [icon]
 * @property {'left'|'right'} [icon_position]
 * @property {string} [icon_color]
 * @property {DataAction} [primary_action]
 * @property {DataAction} [secondary_action]
 *
 * @typedef {string|DataCellObject} DataCell
 *
 * @typedef {Object} DataColumn
 * @property {string} text
 * @property {Object} [style]
 *
 * Responsive table component with optional sticky headers and HTML-capable cells.
 *
 * @param {Object} props
 * @param {string|{text?: string}} [props.title] Table title. Accepts plain string or object with Heading props.
 * @param {string} [props.sub_title]
 * @param {DataColumn[]} [props.columns=[]]
 * @param {DataCell[][]} [props.rows=[]]
 * @param {Object} [props.headerStyle={}] Custom styles for header cells.
 * @param {Object} [props.cellStyle={}] Custom styles for body cells.
 * @param {Object} [props.tableStyle={}] Custom styles for the outer table wrapper.
 * @param {boolean} [props.responsive=true] Enables horizontal scroll on small screens.
 * @param {boolean} [props.stickyHeaders=false] Keeps column headers visible while scrolling.
 * @param {boolean} [props.withBorder=false] Adds solid border and shadow styling.
 * @param {string|number} [props.borderRadius="0px"] Radius applied to the table wrapper.
 * @returns {JSX.Element}
 *
 * @example
 * <DataTable
 *   title="Comparison"
 *   columns={[{ text: 'Feature' }, { text: 'A' }, { text: 'B' }]}
 *   rows={[["Duration", "6m", "9m"]]}
 * />
 *
 * @remarks
 * Optimized for ~2–5 columns; wider tables remain horizontally scrollable on mobile.
 * Can be sourced from YAML: data_table { title, sub_title, columns, rows }.
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
  const [selected, setSelected] = useState({ index: null, manual: false });
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
        display_xxs="none"
        display_md="block"
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

      {/* MOBILE VERSION - Dropdown/Accordion */}
      <Div
        flexWrap="wrap"
        justifyContent="center"
        padding_xs="0 0 40px 0"
        margin_tablet="20px 35px"
        margin_xxs="10px 15px"
        gridGap="10px"
        display_md="none"
        border={
          withBorder
            ? `${borderWidth}px solid #000`
            : `2.5px solid ${Colors.borderGray}`
        }
        borderRadius={borderRadiusValuePx}
        boxShadow={withBorder ? "22px 26px 0px 0px rgba(0,0,0,1)" : undefined}
        background={Colors.white}
      >
        {title && (
          <H2
            fontSize="18px"
            fontWeight="900"
            lineHeight="19px"
            textAlign="center"
            color={Colors.darkGray}
            padding="30px 0 10px 0"
          >
            {title.text || title}
          </H2>
        )}

        {rows.map((row, index) => {
          const firstCell = row.cells?.[0] || row?.[0];
          const firstCellContent = typeof firstCell === "string" ? firstCell : firstCell?.content || "";
          
          return (
            <React.Fragment key={index}>
              <Div
                key={index}
                width="90%"
                height={selected.index === index ? "auto" : "50px"}
                margin_xs="0 15px"
                display_md="none"
                cursor="pointer"
                onClick={() => {
                  selected.index === index
                    ? setSelected({ index: null, manual: true })
                    : setSelected({ index: index, manual: true });
                }}
                justifyContent="between"
                flexDirection={selected.index === index && "column"}
                position="relative"
                alignItems="center"
                borderBottom="none"
                borderBottom_tablet="1px solid #a4a4a47a"
                borderBottom_xs="1px solid #a4a4a47a"
              >
                <H2
                  textAlign="left"
                  fontSize="14px"
                  fontWeight="700"
                  lineHeight="22px"
                  textTransform="uppercase"
                  color={Colors.darkGray}
                  padding={selected.index === index ? "14px 0 0 0" : "0px"}
                >
                  {firstCellContent}
                </H2>
                <Div
                  style={{ position: "absolute", right: "0px", top: "15px" }}
                  transform={
                    selected.index === index ? "rotate(90deg)" : "rotate(0deg)"
                  }
                >
                  <Icon icon="arrow-right" width="32px" height="16px" />
                </Div>
                {selected.index === index && (
                  <Div flexDirection="row" margin="10px 0" width="100%">
                    {columns.slice(1).map((column, colIndex) => {
                      const cell = row.cells?.[colIndex + 1] || row?.[colIndex + 1];
                      const cellContent = typeof cell === "string" ? cell : cell?.content || "";
                      const hasIcon = typeof cell === "object" && cell?.icon;
                      const hasActions = typeof cell === "object" && (cell?.primary_action || cell?.secondary_action);
                      
                      return (
                        <Div
                          key={colIndex}
                          flexDirection="column"
                          width={`${100 / (columns.length - 1)}%`}
                          background={colIndex % 2 === 0 ? "#e3f2ff" : Colors.white}
                          padding="8px"
                          borderRadius="6px"
                          justifyContent="center"
                          margin="0 2px"
                        >
                          <Paragraph
                            textAlign="center"
                            fontSize="14px"
                            fontWeight="700"
                            lineHeight="20px"
                            color={Colors.darkGray}
                          >
                            {column.title || column}
                          </Paragraph>
                          <Div
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap="4px"
                          >
                            {hasIcon && (
                              <Icon
                                icon={cell.icon}
                                width={cell.size || "16px"}
                                height={cell.size || "16px"}
                                color={cell.icon_color || Colors.darkGray}
                              />
                            )}
                            <Paragraph
                              textAlign="center"
                              fontSize="12px"
                              fontWeight="300"
                              lineHeight="20px"
                              color={Colors.darkGray}
                              {...(cell?.html
                                ? { dangerouslySetInnerHTML: { __html: cellContent } }
                                : { children: cellContent })}
                            />
                          </Div>
                          {hasActions && (
                            <Div margin="8px 0 0 0">
                              {cell.primary_action && (
                                <Div
                                  as="a"
                                  href={cell.primary_action.path}
                                  fontSize="10px"
                                  fontWeight="600"
                                  padding="4px 8px"
                                  borderRadius="3px"
                                  background={Colors.blue}
                                  color={Colors.white}
                                  textDecoration="none"
                                  display="inline-block"
                                  margin="2px"
                                >
                                  {cell.primary_action.text}
                                </Div>
                              )}
                              {cell.secondary_action && (
                                <Div
                                  as="a"
                                  href={cell.secondary_action.path}
                                  fontSize="10px"
                                  fontWeight="600"
                                  padding="4px 8px"
                                  borderRadius="3px"
                                  background="transparent"
                                  color={Colors.blue}
                                  border={`1px solid ${Colors.blue}`}
                                  textDecoration="none"
                                  display="inline-block"
                                  margin="2px"
                                >
                                  {cell.secondary_action.text}
                                </Div>
                              )}
                            </Div>
                          )}
                        </Div>
                      );
                    })}
                  </Div>
                )}
              </Div>
            </React.Fragment>
          );
        })}
      </Div>
    </Div>
  );
};

export default DataTable;
