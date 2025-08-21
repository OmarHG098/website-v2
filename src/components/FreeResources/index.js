import React, { useContext } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { H3, H4, Paragraph } from "../Heading";
import { Div } from "../Sections";
import { Button, Colors, CarouselContainer } from "../Styling";
import { SessionContext } from "../../session";
import Carousel from "../Carousel";

const FreeResources = (props) => {
  const data = useStaticQuery(graphql`
    query FreeResourcesQuery {
      allFreeResourcesYaml {
        edges {
          node {
            fields {
              lang
            }
            heading
            sub_heading
            resources {
              title
              description
              button_text
              url
            }
          }
        }
      }
    }
  `);

  const { session } = useContext(SessionContext);
  const lang = props.lang || session?.language;
  if (lang !== "us" && lang !== "en") return null;

  let freeResources = data.allFreeResourcesYaml.edges.find(
    ({ node }) => node.fields.lang === lang
  );
  if (freeResources) freeResources = freeResources.node;
  else return null;

  return (
    <>
      <Div
        columns_tablet="12"
        flexDirection="column"
        padding="40px 20px"
        padding_md="60px 80px"
        padding_lg="60px 0px"
        padding_tablet="60px 40px 10px 40px"
        margin_tablet="0 auto 30px auto"
        margin="0 0 36px 0"
        maxWidth="1280px"
        containerColumns_tablet="repeat(12,1fr)"
        gridColumn_tablet="1 / span 12"
        gap="36px 0px"
      >
        <CarouselContainer
          slideDirection="column"
          slideAlignment="center"
          buttonMarginTop="24px"
          buttonJustify="center"
          buttonWidth="100%"
          dotsMarginTop="20px"
        >
          <Div
            alignItems="center"
            justifyContent="between"
            position="relative"
            display="block"
          >
            <Carousel
              previousArrow
              nextArrow
              content={{
                heading: freeResources.heading,
                content: freeResources.sub_heading,
              }}
              settings={{
                dotsClass: "slick-dots-staff",
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: false,
                dots: true,
                className: "free-resources-class",
                responsive: [
                  {
                    breakpoint: 1200,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                      infinite: false,
                      dots: true,
                    },
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      infinite: false,
                      dots: true,
                    },
                  },
                ],
              }}
            >
              {freeResources.resources.map((item, index) => (
                <Div
                  key={index}
                  flexDirection="column"
                  alignItems="center"
                  width="100%"
                  maxWidth="360px"
                >
                  <Div
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    border={`1px solid ${Colors.lightGray2}`}
                    borderRadius="12px"
                    padding="24px 20px"
                    background={Colors.white}
                    height="200px"
                    width="100%"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                    transition="all 0.3s ease"
                    hover={{
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-2px)",
                    }}
                  >
                    <H4
                      textAlign="left"
                      margin="0 0 12px 0"
                      fontWeight="700"
                      fontSize="18px"
                      lineHeight="24px"
                    >
                      {item.title}
                    </H4>
                    <Paragraph
                      textAlign="left"
                      margin="0 0 0 0"
                      fontSize="md"
                      lineHeight="22px"
                      color={Colors.darkGray2}
                    >
                      {item.description}
                    </Paragraph>
                  </Div>
                  {item.url && (
                    <Div className="button-container">
                      <Button
                        as="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="full"
                        color={Colors.blue}
                        textColor={Colors.white}
                        fontSize="16px"
                        marginTop="24px"
                        borderRadius="6px"
                        padding="12px 24px"
                        fontWeight="600"
                        style={{
                          minWidth: 160,
                          width: "auto",
                          transition:
                            "transform 250ms ease-in-out, background-color 250ms ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#ffb718";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = Colors.blue;
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        {item.button_text}
                      </Button>
                    </Div>
                  )}
                </Div>
              ))}
            </Carousel>
          </Div>
        </CarouselContainer>
      </Div>
    </>
  );
};

export default FreeResources;
