import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { H3, H4, Paragraph } from "../Heading";
import { Anchor } from "../Styling";
import { Div } from "../Sections";
import Fragment from "../Fragment";
import Icon from "../Icon";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { SessionContext } from "../../session";
import "../../assets/css/admissions-staff.css";
import Carousel from "../Carousel";

const AdmissionsStaff = (props) => {
  const data = useStaticQuery(graphql`
    query AdmissionsStaffQuery {
      allAdmissionsYaml {
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
              bio
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 800
                    placeholder: NONE
                  )
                }
              }
              phone
              email
              location
            }
          }
        }
      }
    }
  `);

  let staffList = data.allAdmissionsYaml.edges.find(
    ({ node }) => node.fields.lang === props.lang
  );
  const { session } = React.useContext(SessionContext);
  let staffFilteredByLocation;
  let sessionLocation =
    session && session.location && session.location.breathecode_location_slug;

  if (staffList) staffList = staffList.node;

  if (sessionLocation)
    staffFilteredByLocation = staffList.staff.filter(
      (n) =>
        n.location.length <= 0 ||
        n.location.includes("") ||
        n.location === "all" ||
        n.location.includes("all") ||
        n.location.includes(sessionLocation)
    );

  return (
    <Fragment github="/components/admissions-staff">
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
              heading: props.heading || staffList.heading,
              content: props.paragraph || staffList.sub_heading,
            }}
            settings={{
              dotsClass: "slick-dots-admissions",
              slidesToShow: 3,
              slidesToScroll: 1,
              className: "admissions-class",
              responsive: [
                {
                  breakpoint: 1024,
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
            {staffFilteredByLocation?.map((item, index) => {
              return (
                <Div
                  key={index}
                  height="fit-content"
                  flexDirection="column"
                  gap="8px"
                  className="admissions-card"
                >
                  <Div
                    width="100%"
                    height_tablet="300px"
                    height_sm="360px"
                    height="320px"
                    alignItems_tablet="center"
                  >
                    <GatsbyImage
                      image={getImage(
                        item.image && item.image.childImageSharp.gatsbyImageData
                      )}
                      style={{
                        height: "100%",
                        backgroundSize: `cover`,
                      }}
                      alt={item.name}
                    />
                  </Div>
                  <H3 fontSize="18px" lineHeight="22px" margin="14px 0 0 0">
                    {item.name} {item.last_name}
                  </H3>
                  <H4 fontSize="15px" lineHeight="18px" margin="8px 0">
                    {item.job_title}
                  </H4>
                  <Paragraph fontSize="14px" lineHeight="20px" margin="8px 0">
                    {item.bio}
                  </Paragraph>
                  <Div flexDirection="column" gap="8px" margin="16px 0 0 0">
                    <Anchor
                      href={`tel:${item.phone}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      textAlign="left"
                      fontSize="14px"
                    >
                      <Icon
                        icon="phone"
                        width="16px"
                        fill="#0084ff"
                        style={{ marginRight: "8px" }}
                      />
                      {item.phone}
                    </Anchor>
                    <Anchor
                      href={`mailto:${item.email}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      textAlign="left"
                      fontSize="14px"
                    >
                      <Icon
                        icon="email"
                        width="16px"
                        fill="#0084ff"
                        style={{ marginRight: "8px" }}
                      />
                      {item.email}
                    </Anchor>
                  </Div>
                </Div>
              );
            })}
          </Carousel>
        </Div>
      </Div>
    </Fragment>
  );
};

export default AdmissionsStaff;
