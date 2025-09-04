import React from "react";
import { isCustomBarActive } from "../actions";
import { Header } from "../components/Sections";
import BaseRender from "./_baseLayout";
import { graphql } from "gatsby";
import { SessionContext } from "../session";
import TwoColumn from "../components/TwoColumn/index.js";
import { Div } from "../components/Sections";
import { Colors } from "../components/Styling";
import { H2 } from "../components/Heading";
import DataTable from "../components/DataTable";

const View = (props) => {
  const { data, pageContext, yml } = props;
  const { session } = React.useContext(SessionContext);

  return (
    <>
      <Header
        margin="10px 0 0 0"
        margin_md={
          isCustomBarActive(session) ? "120px 0 40px 0" : "70px 0 40px 0"
        }
        fontFamily={"Archivo-Black"}
        seo_title={yml.seo_title}
        title={yml.header.title}
        paragraph={
          <>
            {yml.header?.sub_title && (
              <span
                style={{
                  display: "block",
                  fontFamily: "Lato, sans-serif",
                  fontWeight: "300",
                  color: "#606060",
                  marginBottom: "16px",
                  fontSize: "26px",
                }}
              >
                {yml.header.sub_title}
              </span>
            )}
            {yml.header?.paragraph && (
              <span
                style={{
                  fontFamily: "Roboto, sans-serif",
                  color: "#424242",
                  lineHeight: "1.5",
                  fontSize: "22px",
                }}
                dangerouslySetInnerHTML={{ __html: yml.header.paragraph }}
              />
            )}
          </>
        }
      />


      {/* Comparison Table */}
      {yml.comparison_table && (
        <DataTable
          // stickyHeaders={true}
          borderRadius="8px"
          withBorder={true}
          title={yml.comparison_table.title}
          sub_title={yml.comparison_table.sub_title}
          columns={yml.comparison_table.columns}
          rows={yml.comparison_table.rows}
        />
      )}

      {/* Call to action - Still not sure */}
      <TwoColumn
        left={{
          heading: yml.two_columns_third?.heading,
          sub_heading: yml.two_columns_third?.sub_heading,
          bullets: yml.two_columns_third?.bullets,
          content: yml.two_columns_third?.content,
          button: yml.two_columns_third?.button,
        }}
        right={{
          image: yml.two_columns_third?.image,
          video: yml.two_columns_third?.video,
        }}
        proportions={yml.two_columns_third?.proportions}
        session={session}
      />
    </>
  );
};

export const query = graphql`
  query ProgramComparisonQuery($file_name: String!, $lang: String!) {
    allPageYaml(
      filter: { fields: { file_name: { eq: $file_name }, lang: { eq: $lang } } }
    ) {
      edges {
        node {
          meta_info {
            title
            description
            image
            keywords
          }
          seo_title
          header {
            title
            sub_title
            paragraph
          }
          comparison_table {
            title {
              text
            }
            sub_title
            columns {
              title
            }
            rows {
              cells {
                content
                html
                primary_action {
                  text
                  path
                  link_state {
                    course
                  }
                }
                secondary_action {
                  text
                  path
                  link_state {
                    course
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
export default BaseRender(View);