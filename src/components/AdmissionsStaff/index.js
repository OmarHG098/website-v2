import React, { useContext } from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { H3, H4, Paragraph } from "../Heading";
import { Div } from "../Sections";
import { Anchor, Button, Colors } from "../Styling";
import { SessionContext } from "../../session";
import Carousel from "../Carousel";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

const AdmissionsStaff = (props) => {
  const data = useStaticQuery(graphql`
    query AdmissionsStaffQuery {
      allAdmissionsStaffYaml {
        edges {
          node {
            fields {
              lang
            }
            heading
            sub_heading
            staff {
              name
              last_name
              job_title
              phone
              email
              calendly_link
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED # --> CONSTRAINED || FIXED || FULL_WIDTH
                    width: 800
                    placeholder: NONE # --> NONE || DOMINANT_COLOR || BLURRED | TRACED_SVG
                  )
                }
              }
            }
          }
        }
      }
    }
  `);

  const { session } = useContext(SessionContext);
  const lang = props.lang || session?.language;
  if (lang !== "us" && lang !== "en") return null;

  let admissionsStaff = data.allAdmissionsStaffYaml.edges.find(
    ({ node }) => node.fields.lang === lang
  );
  if (admissionsStaff) admissionsStaff = admissionsStaff.node;
  else return null;

  return (
    <Div
      columns_tablet="12"
      flexDirection="column"
      padding="20px 20px"
      padding_md="40px 80px"
      padding_lg="40px 0px"
      padding_tablet="40px 40px 10px 40px"
      margin_tablet="0 auto 30px auto"
      margin="0 0 36px 0"
      maxWidth="1280px"
      containerColumns_tablet="repeat(12,1fr)"
      gridColumn_tablet="1 / span 12"
      gap="36px 0px"
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
            heading: props.heading || admissionsStaff.heading,
            content: props.paragraph || admissionsStaff.sub_heading,
          }}
          settings={{
            dotsClass: "slick-dots-staff",
            slidesToShow: 3,
            slidesToScroll: 3,
            className: "staff-class ",
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2,
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
          {admissionsStaff.staff.map((item, index) => (
            <Div
              key={index}
              height="fit-content"
              flexDirection="column"
              gap="8px"
              alignItems="center"
            >
              <Div
                width="100%"
                height_tablet="300px"
                height_sm="360px"
                height="320px"
                alignItems_tablet="center"
              >
                {item.image && item.image.childImageSharp && (
                  <GatsbyImage
                    image={getImage(item.image.childImageSharp.gatsbyImageData)}
                    style={{ height: "100%", backgroundSize: `cover` }}
                    alt={item.name}
                  />
                )}
              </Div>
              <H3 fontSize="18px" lineHeight="22px" margin="14px 0 0 0">
                {item.name} {item.last_name}
              </H3>
              <H4 fontSize="15px" lineHeight="18px" margin="8px 0">
                {item.job_title}
              </H4>
              <Paragraph fontSize="15px" margin="0 0 4px 0" color="#444">
                <strong>Phone:</strong>{" "}
                <Anchor to={`tel:${item.phone.replace(/[^ -9]/g, "")}`}>
                  {item.phone}
                </Anchor>
              </Paragraph>
              <Paragraph fontSize="15px" margin="0 0 16px 0" color="#444">
                <strong>Email:</strong>{" "}
                <Anchor to={`mailto:${item.email}`}>{item.email}</Anchor>
              </Paragraph>
              <Div display="flex" justifyContent="center" marginTop="auto">
                <Link to={item.calendly_link}>
                  <Button
                    variant="full"
                    background={Colors.blue}
                    textColor={Colors.white}
                    fontSize="14px"
                    padding="12px 24px"
                    borderRadius="6px"
                    fontWeight="600"
                    style={{
                      transition: "transform 250ms ease-in-out, background-color 250ms ease-in-out",
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
                    {"Book a call →"}
                  </Button>
                </Link>
              </Div>
            </Div>
          ))}
        </Carousel>
      </Div>
    </Div>
  );
};

export default AdmissionsStaff;
