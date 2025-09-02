import React, { useEffect, useMemo } from "react";
import { isCustomBarActive } from "../actions";
import { Header } from "../components/Sections";
import GeeksVsOthers from "../components/GeeksVsOthers";
import BaseRender from "./_baseLayout";
import { graphql } from "gatsby";
import { SessionContext } from "../session";
import TwoColumn from "../components/TwoColumn/index.js";
import { Div } from "../components/Sections";
import { Colors } from "../components/Styling";
import { H2, H4 } from "../components/Heading";
import { landingSections } from "../components/Landing";

const View = (props) => {
  const { data, pageContext, yml } = props;
  const { session } = React.useContext(SessionContext);
  const [components, setComponents] = React.useState({});

  useEffect(() => {
    let _components = {};
    if (yml.components)
      yml.components.forEach(({ name, ...rest }) => {
        _components[name] = rest;
      });
    setComponents({ ...yml, ..._components });
  }, [yml]);

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
            <span
              style={{
                fontFamily: "Roboto, sans-serif",
                color: "#424242",
                lineHeight: "1.5",
                fontSize: "22px",
              }}
              dangerouslySetInnerHTML={{ __html: yml.header.paragraph }}
            />
          </>
        }
      />

      {/* Section Title */}
      <Div display="block">
        <H2 type="h2" textAlign_tablet="center">
          {yml.section_heading?.text}
        </H2>
        
        <Div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto, sans-serif",
              color: "#424242",
              lineHeight: "1.5",
              fontSize: "22px",
              textAlign: "center",
            }}
            dangerouslySetInnerHTML={{ __html: yml.section_heading?.sub_heading }}
          />
        </Div>
      </Div>

      <GeeksVsOthers lang={pageContext.lang} link={false} />

      {/* Dynamic Components */}
      {Object.keys(components)
        .filter(
          (name) =>
            components[name] &&
            (landingSections[name] || landingSections[components[name].layout])
        )
        .sort((a, b) =>
          components[b].position > components[a].position ? -1 : 1
        )
        .map((name, index) => {
          const layout = components[name].layout || name;
          return landingSections[layout]({
            ...props,
            yml: components[name],
            session,
            course: yml.meta_info?.utm_course,
            location: components.meta_info?.utm_location,
            index: index,
          });
        })}
    </>
  );
};

export const query = graphql`
  query GeeksQuery($file_name: String!, $lang: String!) {
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
          section_heading {
            text
            sub_heading
          }
          components {
            name
            position
            background
            proportions
            layout
            justify
            swipable
            image {
              src
              style
              shadow
            }
            button {
              text
              color
              path
              background
            }
            section_heading {
              text
            }
            heading {
              text
              font_size
              style
            }
            sub_heading {
              text
              style
              font_size
            }
            content {
              text
              style
            }
            bullets {
              item_style
              items {
                heading
                text
                icon
                icon_color
              }
            }
            icons {
              icon
              color
              title
              content
            }
          }
        }
      }
    }
  }
`;
export default BaseRender(View);
