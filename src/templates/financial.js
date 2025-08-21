import React, { useContext, useMemo, useEffect } from "react";
import { graphql, navigate } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Button, Colors } from "../components/Styling";
import BaseRender from "./_baseLayout";
import { SessionContext } from "../session";
import { isCustomBarActive } from "../actions";
import ScholarshipSuccessCases from "../components/ScholarshipSuccessCases";
import { landingSections } from "../components/Landing";

// components
import { Div } from "../components/Sections";
import { H1, H2, Paragraph } from "../components/Heading";
import WeTrust from "../components/WeTrust";
import PricesAndPayment from "../components/PricesAndPayment";
import PaymentPlans from "../components/PaymentPlans";

const Financial = (props) => {
  const { session } = useContext(SessionContext);
  const { data, pageContext, yml } = props;
  const { seo_title, header } = yml;
  const [components, setComponents] = React.useState({});

  const allPlans = useMemo(() => {
    return data.allPlansYaml.edges
      .flatMap(({ node }) => [...node.part_time, ...node.full_time])
      .filter((plan) =>
        plan.academies.includes(session?.location?.breathecode_location_slug)
      );
  }, [session]);

  useEffect(() => {
    let _components = {};
    if (yml.components)
      yml.components.forEach(({ name, ...rest }) => {
        _components[name] = rest;
      });
    setComponents({ ...yml, ..._components });
  }, [yml]);

  const defaultCourse = "full-stack";

  return (
    <>
      <Div
        maxWidth="1280px"
        margin_tablet={
          isCustomBarActive(session) ? "140px auto 0 auto" : "60px auto"
        }
        gap="25px"
        alignItems_tablet="center"
        flexDirection="column"
        flexDirection_tablet="row"
        padding_lg="0"
        padding="40px 80px"
        padding_tablet="60px"
        padding_xxs="20px"
      >
        <Div display="block">
          <H1 type="h1" textAlign="left">
            {seo_title}
          </H1>
          <H2
            margin="20px 0"
            type="h2"
            fontFamily="Archivo-Black"
            color={Colors.black}
            textAlign="left"
            fontSize="40px"
            fontSize_tablet="50px"
            lineHeight="54px"
          >
            {header.title}
          </H2>
          <Paragraph color={Colors.black} textAlign="left" fontSize="21px">
            {header.paragraph}
          </Paragraph>
          <Button
            background={Colors.blue}
            lineHeight="26px"
            textTransform="none"
            color="white"
            margin="30px 0 0 0"
            fontSize="15px"
            padding_xxs="0 .5rem"
            padding_xs="0 .85rem"
            onClick={() => {
              navigate("#prices_and_payment");
            }}
          >
            {header.button}
          </Button>
        </Div>
        <Div>
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
        </Div>
      </Div>

      <PaymentPlans lang={pageContext.lang} />

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
            index: index,
          });
        })}

      <WeTrust
        we_trust={yml.we_trust_section}
        background="none"
        titleProps={{ textAlign: "center" }}
        paragraphProps={{ textAlign: "center" }}
      />

      <PricesAndPayment
        type={pageContext.slug}
        lang={pageContext.lang}
        locations={data.allLocationYaml.edges}
        programs={data.allCourseYaml.edges}
        defaultCourse={defaultCourse}
        title={yml.prices.heading}
        paragraph={yml.prices.sub_heading}
        chooseProgram
        financial
      />

      <ScholarshipSuccessCases content={data.allScholarshipSuccessCasesYaml.edges[0].node} />
    </>
  );
};

export const query = graphql`
  query FinancialQuery($file_name: String!, $lang: String!) {
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
            tagline
            button
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
            sub_heading
          }
          components {
            name
            position
            layout
            background
            proportions
            image {
              style
              src
              shadow
            }
            heading {
              text
              style
              font_size
            }
            sub_heading {
              text
              style
              font_size
            }
            content {
              text
              font_size
            }
            bullets {
              item_style
              items {
                heading
                text
                icon
              }
            }
            button {
              text
              color
              background
              hover_color
              path
            }
          }
          prices {
            heading
            sub_heading
          }
          we_trust_section {
            title
            text
            boxes {
              icon
              title
              text
            }
          }
        }
      }
    }
    allLocationYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          id
          city
          country
          name
          active_campaign_location_slug
          breathecode_location_slug
          fields {
            lang
            file_name
          }
          meta_info {
            slug
            title
            description
            image
            keywords
            position
            redirects
            visibility
          }
        }
      }
    }
    allPlansYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          full_time {
            slug
            academies
            scholarship
            payment_time
            price
          }
          part_time {
            slug
            academies
            scholarship
            payment_time
            price
            original_price
          }
        }
      }
    }
    allCourseYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          meta_info {
            slug
            title
            bc_slug
            visibility
            show_in_apply
          }
          apply_form {
            label
          }
        }
      }
    }
    allScholarshipSuccessCasesYaml(
      filter: { fields: { lang: { eq: $lang } } }
    ) {
      edges {
        node {
          title
          subtitle
          contributor
          cases {
            name
            img {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 700
                  quality: 100
                  placeholder: NONE
                  breakpoints: [200, 340, 520, 890]
                )
              }
            }
            status
            country {
              iso
              name
            }
            contributor
            description
            achievement
          }
        }
      }
    }
  }
`;

export default BaseRender(Financial);