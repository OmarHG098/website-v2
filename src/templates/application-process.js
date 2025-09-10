import React from "react";
import { graphql } from "gatsby";
import BaseRender from "./_baseLayout";

// components
import Stepper from "../components/Stepper";
import { Div } from "../components/Sections";
import { Header } from "../components/Sections";
import { Colors } from "../components/Styling";

const ApplicationProcess = (props) => {
  const { pageContext, yml } = props;
  const { header, stepper } = yml;

  return (
    <>
      <Header
        margin="10px 0 0 0"
        margin_md="70px 0 0px 0"
        padding_tablet="60px 40px 60px 40px"
        padding_md="60px 40px 60px 40px"
        colorVariant="white"
        padding_l="60px 0 60px 0"
        background={Colors.blue2}
        fontFamily="Archivo-Black"
        seo_title={yml.seo_title}
        title={header.title}
        fontWeight_title="700"
        textWrap="balance"
        paragraphMargin="26px auto 0 auto"
        paragraph={
          <>
            {header?.paragraph && (
              <span
                style={{
                  fontFamily: "Roboto, sans-serif",
                  color: "#fff",
                  lineHeight: "1.5",
                  fontSize: "22px",
                }}
                dangerouslySetInnerHTML={{ __html: header.paragraph }}
              />
            )}
          </>
        }
      />

      {stepper && (
        <Div
          className="steps-section"
          display="flex"
          flexDirection="column"
          maxWidth="64rem"
          margin="0 auto"
        >
          <div className="steps-container">
            <Stepper lang={pageContext.lang} steps={stepper.steps} />
          </div>
        </Div>
      )}
    </>
  );
};

export const query = graphql`
  query ApplicationProcessQuery($file_name: String!, $lang: String!) {
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
            paragraph
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 1600
                  quality: 100
                  placeholder: NONE
                )
              }
            }
            alt
          }
          stepper {
            title
            sub_title
            steps {
              title
              description
              sub_items
            }
          }
        }
      }
    }
  }
`;

export default BaseRender(ApplicationProcess);
