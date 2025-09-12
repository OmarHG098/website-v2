import React from "react";
import { graphql, Link } from "gatsby";
import BaseRender from "./_baseLayout";

// components
import Stepper from "../components/Stepper";
import { Div } from "../components/Sections";
import { Header } from "../components/Sections";
import { Button, Colors } from "../components/Styling";
import Iconogram from "../components/Iconogram";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

const ApplicationProcess = (props) => {
  const { pageContext, yml } = props;
  const { header, stepper, apply_button } = yml;

  return (
    <>
      <Header
        margin="3rem 0 0 0"
        padding_tablet="2rem 40px 60px 40px"
        padding_md="2rem 40px 60px 40px"
        padding_l="60px 0 60px 0"
        fontFamily="Archivo-Black"
        seo_title={yml.seo_title}
        title={header.title}
        fontWeight_title="700"
        textAlign_tablet="left"
        paragraphMargin="26px auto 0 auto"
        containerStyle={{ alignItems: "center" }}
        paragraph={
          <>
            {header?.paragraph && (
              <span
                style={{
                  fontFamily: "Roboto, sans-serif",
                  color: "#000",
                  lineHeight: "1.5",
                  fontSize: "22px",
                }}
                dangerouslySetInnerHTML={{ __html: header.paragraph }}
              />
            )}
          </>
        }
        svg_image={
          <GatsbyImage
            image={getImage(
              header.image && header.image.childImageSharp.gatsbyImageData
            )}
            style={{
              height: "100%",
              backgroundSize: `cover`,
            }}
            alt={header.alt}
          />
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

      <Div
        width="100%"
        maxWidth="64rem"
        margin="0 auto 4rem auto"
        justifyContent="center"
      >
        <Link to={apply_button.path}>
          <Button
            display="block"
            color="#000"
            background={Colors.white}
            border="3px solid #000"
            borderRadius="8px"
            height="auto"
            padding="18px 2.46rem"
            letterSpacing="0.07em"
            padding_tablet="18px 2.46rem"
            fontSize="22px"
            textTransform="uppercase"
            boxShadow="10px 10px 0px 0px rgba(0,0,0,1)"
          >
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
                  width: 900
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
