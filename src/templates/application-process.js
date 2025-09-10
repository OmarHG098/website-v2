import React from "react";
import { graphql, Link } from "gatsby";
import BaseRender from "./_baseLayout";

// components
import Stepper from "../components/Stepper";
import { Div } from "../components/Sections";
import { Header } from "../components/Sections";
import { Button, Colors } from "../components/Styling";
import Iconogram from "../components/Iconogram";

const ApplicationProcess = (props) => {
  const { pageContext, yml } = props;
  const { header, stepper, apply_button } = yml;

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
          <Stepper lang={pageContext.lang} steps={stepper.steps} />
        </Div>
      )}

      <Div width="100%" maxWidth="64rem" margin="0 auto 4rem auto" justifyContent="center">
        <Link to={apply_button.path}>
          <Button display="block" color="#000" background={Colors.white} border="3px solid #000" borderRadius="8px" height="auto" padding="18px 2.46rem" letterSpacing="0.07em" padding_tablet="18px 2.46rem" fontSize="22px" textTransform="uppercase" boxShadow="10px 10px 0px 0px rgba(0,0,0,1)">
            {apply_button.text}
          </Button>
        </Link>
      </Div>


      <Iconogram yml={yml.iconogram} background={Colors.veryLightBlue3} />
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
          apply_button {
            text
            path
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
          iconogram {
            heading {
              text
              style
            }
            sub_heading {
              text
            }
            swipable
            background
            icons {
              icon
              title
              content
              color
              content_style
            }
          }
        }
      }
    }
  }
`;

export default BaseRender(ApplicationProcess);
