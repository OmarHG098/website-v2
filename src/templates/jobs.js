import React from "react";
import { graphql } from "gatsby";
import { GridContainer, Header, Div } from "../components/Sections";
import BaseRender from "./_baseLayout";
import JobInfo from "../components/JobInfo";
import WorkTogether from "../components/WorkTogether";
import { isCustomBarActive } from "../actions";
import { SessionContext } from "../session";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

const Jobs = ({ data, pageContext, yml }) => {
  const { session } = React.useContext(SessionContext);
  const { lang } = pageContext;

  return (
    <>
      <GridContainer
        margin="20px auto 0 auto"
        margin_tablet="auto"
        padding_tablet="0"
        padding_md="10rem 0 4rem"
        containerColumns_tablet="1fr repeat(12,1fr) 1fr"
        columns_tablet="2"
        maxWidth="1280px"
        gridColumn_tablet="1 / span 14"
      >
        <Header
          hideArrowKey
          textAlign_tablet="left"
          seo_title={yml.seo_title}
          title={yml.header.title}
          paragraph={yml.header.paragraph}
          fontSize_paragraph="21px"
          padding_tablet="20px"
          padding="0 10px"
          margin="30px 0 0 0"
          paddingTitle="0"
          paddingParagraph="0"
          position="relative"
        />

        <Div width="100%" height="100%">
          <GatsbyImage
            style={{
              height: "390px",
              minWidth: "150px",
              width: "auto",
              margin: "0 20px",
            }}
            imgStyle={{
              objectFit: "contain",
              WebkitUserDrag: "none",
            }}
            alt={yml.header.image_alt}
            image={getImage(yml.header.image.childImageSharp.gatsbyImageData)}
          />
        </Div>
      </GridContainer>
      {yml.work_together && (
        <WorkTogether
          title={yml.work_together.title}
          features={yml.work_together.features}
          showImages={false}
          showDescription={false}
        />
      )}
      <JobInfo lang={lang} />
    </>
  );
};
export const query = graphql`
  query JobsQuery($file_name: String!, $lang: String!) {
    allPageYaml(
      filter: { fields: { file_name: { eq: $file_name }, lang: { eq: $lang } } }
    ) {
      edges {
        node {
          meta_info {
            slug
            title
            description
            image
            keywords
          }
          seo_title
          header {
            title
            paragraph
            image_alt
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED # --> CONSTRAINED || FIXED || FULL_WIDTH
                  width: 1200
                  quality: 100
                  placeholder: NONE # --> NONE || DOMINANT_COLOR || BLURRED | TRACED_SVG
                  breakpoints: [200, 340, 520, 890]
                )
              }
            }
          }
          work_together {
            title
            features {
              title
              icon
              description
            }
          }
        }
      }
    }
  }
`;
export default BaseRender(Jobs);
