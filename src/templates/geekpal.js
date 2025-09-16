import React, { useEffect } from "react";
import { graphql } from "gatsby";
import BaseRender from "./_baseLayout";
import { SessionContext } from "../session";
import { landingSections } from "../components/Landing";
import { VerticalVideoHolder } from "../components/Styling";
import ReactPlayer from "../components/ReactPlayer";
import { Div, Grid } from "../components/Sections";
import { Paragraph } from "../components/Heading";
import { Img } from "../components/Styling";
import { StyledBackgroundSection } from "../components/Styling";

// Componente para elementos decorativos reutilizables
const DecorativeElements = ({ variant = "header", position = "right" }) => {
  const decorativeConfigs = {
    header: {
      ellipse: {
        src: "/images/Ellipse-7.png",
        width: "450px",
        height: "300px",
        style: {
          position: "absolute",
          right: "-150px",
          top: "-100px",
        },
        display_xs: "none",
      },
      vectorStroke: {
        src: "/images/vector-stroke-light.png",
        width: "120px",
        height: "165px",
        style: {
          position: "absolute",
          left: "48%",
          top: "20%",
        },
        display_xs: "none",
      },
    },
    section: {
      vectorBottom: {
        src: "/images/vector-stroke-left.png",
        width: "89px",
        height: "119px",
        style: {
          position: "absolute",
          left: "-62px",
          bottom: "21px",
          zIndex: "-1",
        },
      },
    },
  };

  const config = decorativeConfigs[variant];
  if (!config) return null;

  return (
    <>
      {Object.entries(config).map(([key, props]) => (
        <Img key={key} backgroundSize="contain" {...props} />
      ))}
    </>
  );
};

// Componente del header principal con elementos gráficos
const GeekPalHeader = ({ yml, session }) => {
  return (
    <Grid
      padding="24px 20px"
      padding_tablet="100px 40px 40px 40px"
      padding_md="100px 80px 40px 80px"
      padding_lg="100px 0px 40px 0px"
      columns_tablet="18"
      margin="70px auto 24px auto"
      maxWidth="1280px"
      position="relative"
      gridTemplateColumns_tablet="repeat(21, 1fr)"
      gridGap="0px"
    >
      {/* Elementos decorativos del header */}
      <DecorativeElements variant="header" />

      {/* Contenido del header */}
      <Div
        flexDirection="column"
        justifyContent_tablet="start"
        gridColumn_tablet="1 / 11"
        position="relative"
      >
        <Paragraph
          fontSize="50px"
          lineHeight="54px"
          padding_xs="10px 0"
          padding_md="0px"
          margin="0"
          textAlign_xs="center"
          textAlign_tablet="left"
          color="black"
          fontSize_xs="40px"
          lineHeight_xs="38px"
          fontSize_tablet="50px"
          lineHeight_tablet="54px"
          dangerouslySetInnerHTML={{ __html: yml.header.title }}
        />
        <Paragraph
          fontSize="24px"
          lineHeight="29px"
          fontFamily="Lato"
          padding_xs="10px 0px"
          textAlign_xs="center"
          textAlign_tablet="left"
          padding_md="30px 0px 10px 0"
          color="black"
          fontSize_xs="18px"
          lineHeight_xs="24px"
          fontSize_tablet="24px"
          lineHeight_tablet="29px"
          dangerouslySetInnerHTML={{ __html: yml.header.paragraph }}
        />

        {/* Decoración vectorial para la sección */}
        <DecorativeElements variant="section" />
      </Div>

      {/* Contenedor de video/imagen con decoraciones */}
      <VideoImageContainer yml={yml} />
    </Grid>
  );
};

// Componente separado para el contenedor de video/imagen
const VideoImageContainer = ({ yml }) => {
  return (
    <Div
      height="auto"
      width="80%"
      width_tablet="80%"
      width_md="75%"
      width_xs="100%"
      padding_xs="40px 0 0 0"
      padding_tablet="15% 0 0 0"
      padding_md="0% 16px 0 5%"
      padding_lg="0 15px 0 5%"
      gridColumn_tablet="11 / 22"
      position="relative"
      margin="0 auto"
    >
      {/* Decoración inferior */}
      <Img
        src="/images/Group-6400.png"
        width="193px"
        height="10px"
        style={{ position: "absolute" }}
        left_xs="0"
        bottom_tablet="10%"
        left_md="10%"
        bottom_md="10%"
        bottom_lg="0%"
        display_xs="none"
      />

      <VerticalVideoHolder>
        {yml.geekPal.map((item, i) => (
          <React.Fragment key={i}>
            {item.videoId === "" ? (
              <StyledBackgroundSection
                height="500px"
                image={item.image.childImageSharp.gatsbyImageData}
                bgSize="contain"
                alt="geekforce image"
              />
            ) : (
              <Div width="100%" height="500px" margin="0" overflow="hidden">
                <ReactPlayer
                  id={item.videoId}
                  thumb={item.image}
                  margin_tablet="0px"
                  videoHeight="500px"
                  videoHeight_tablet="450px"
                  videoHeight_md="450px"
                  bgSize="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  margin="0"
                />
              </Div>
            )}
          </React.Fragment>
        ))}
      </VerticalVideoHolder>
    </Div>
  );
};

// Wrapper para componentes dinámicos con mejores props
const DynamicComponentWrapper = ({
  name,
  componentData,
  landingSections,
  props,
  session,
  index,
  yml,
}) => {
  const layout = componentData.layout || name;
  const ComponentToRender = landingSections[layout];

  if (!ComponentToRender) {
    console.warn(`Component layout "${layout}" not found in landingSections`);
    return null;
  }

  return ComponentToRender({
    ...props,
    yml: componentData,
    session,
    course: yml.meta_info?.utm_course,
    location: componentData.meta_info?.utm_location,
    index: index,
  });
};

// Componente principal
const GeekPal = (props) => {
  const { data, pageContext, yml } = props;
  const { session } = React.useContext(SessionContext);
  const [components, setComponents] = React.useState({});

  // Configuración de componentes dinámicos
  useEffect(() => {
    let _components = {};
    if (yml.components) {
      yml.components.forEach(({ name, ...rest }) => {
        _components[name] = rest;
      });
    }
    setComponents({ ...yml, ..._components });
  }, [yml]);

  // Componentes ordenados y filtrados
  const orderedComponents = Object.keys(components)
    .filter(
      (name) =>
        components[name] &&
        (landingSections[name] || landingSections[components[name].layout])
    )
    .sort((a, b) => (components[b].position > components[a].position ? -1 : 1));

  return (
    <>
      {/* Header Section con elementos gráficos distintivos */}
      <GeekPalHeader yml={yml} session={session} />

      {/* Dynamic Components con mejor estructura */}
      <section aria-label="Dynamic Content Sections">
        {orderedComponents.map((name, index) => (
          <DynamicComponentWrapper
            key={`${name}-${index}`}
            name={name}
            componentData={components[name]}
            landingSections={landingSections}
            props={props}
            session={session}
            index={index}
            yml={yml}
          />
        ))}
      </section>
    </>
  );
};

export const query = graphql`
  query GeekPalQuery($file_name: String!, $lang: String!) {
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
            slug
          }
          seo_title
          header {
            title
            paragraph
            bullets
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 800
                  placeholder: NONE
                  quality: 100
                )
              }
            }
            image_alt
            image_logo
          }
          geekPal {
            videoId
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: FULL_WIDTH
                  width: 1000
                  placeholder: NONE
                  quality: 100
                )
              }
            }
          }
          components {
            name
            position
            layout
            background
            proportions
            video
            icons {
              icon
              title
              color
              content
            }
            image {
              style
              src
              shadow
            }
            heading {
              text
              font_size
              style
            }
            sub_heading {
              text
              font_size
              style
            }
            content {
              text
              font_size
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
            button {
              text
              color
              path
              background
            }
          }
        }
      }
    }
    allTestimonialsYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          testimonials {
            student_name
            testimonial_date
            hidden
            linkedin_url
            linkedin_text
            student_thumb {
              childImageSharp {
                gatsbyImageData(
                  layout: FIXED # --> CONSTRAINED || FIXED || FULL_WIDTH
                  width: 200
                  height: 200
                  placeholder: NONE # --> NONE || DOMINANT_COLOR || BLURRED | TRACED_SVG
                )
              }
            }
            content
            source_url
            source_url_text
          }
        }
      }
    }
    allPartnerYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          partners {
            images {
              name
              link
              follow
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED # --> CONSTRAINED || FIXED || FULL_WIDTH
                    width: 150
                    placeholder: NONE # --> NONE || DOMINANT_COLOR || BLURRED | TRACED_SVG
                  )
                }
              }
              featured
            }
            tagline
            sub_heading
            footer_button
            footer_link
          }
        }
      }
    }
  }
`;
export default BaseRender(GeekPal);
