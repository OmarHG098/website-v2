import React, { useContext } from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { H3, H4, Paragraph } from "../Heading";
import { Div } from "../Sections";
import { Anchor, Button, Colors } from "../Styling";
import { SessionContext } from "../../session";
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
  if (lang !== "us" && lang !== "en" && lang !== "es") return null;

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
      <Div flexDirection="column">
        <H3 fontSize="28px" lineHeight="34px" margin="0 0 8px 0">
          {props.heading || admissionsStaff.heading}
        </H3>
        {admissionsStaff.sub_heading && (
          <Paragraph fontSize="16px" lineHeight="24px" margin="0 0 24px 0">
            {props.paragraph || admissionsStaff.sub_heading}
          </Paragraph>
        )}
      </Div>
      <Div>
        {admissionsStaff.staff.map((item, index) => (
          <Div
            key={index}
            display="grid"
            gridTemplateColumns="repeat(12,1fr)"
            gridTemplateColumns_tablet="repeat(12,1fr)"
            gap="20px"
            margin="0 0 32px 0"
            alignItems="center"
          >
            <Div gridColumn="1 / span 5" gridColumn_tablet="1 / span 5">
              <Div
                width="100%"
                height_tablet="300px"
                height_sm="280px"
                height="180px"
                alignItems="center"
                alignItems_tablet="center"
                justifyContent="center"
              >
                {item.image && item.image.childImageSharp && (
                  <GatsbyImage
                    image={getImage(item.image.childImageSharp.gatsbyImageData)}
                    style={{ height: "100%", width: "100%" }}
                    imgStyle={{
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                    alt={`${item.name} ${item.last_name}`}
                  />
                )}
              </Div>
            </Div>
            <Div gridColumn="6 / span 7" gridColumn_tablet="6 / span 7" flexDirection="column">
              <H3 
                fontSize="18px" 
                fontSize_tablet="22px" 
                lineHeight="22px"
                lineHeight_tablet="26px"
                margin="0 0 6px 0"
                margin_tablet="0 0 8px 0"
              >
                {item.name} {item.last_name}
              </H3>
              <H4 
                fontSize="14px"
                fontSize_tablet="16px"
                lineHeight="18px"
                lineHeight_tablet="20px"
                margin="0 0 8px 0"
                margin_tablet="0 0 12px 0"
              >
                {item.job_title}
              </H4>
              <Paragraph 
                fontSize="13px"
                fontSize_tablet="15px"
                margin="0 0 4px 0"
                margin_tablet="0 0 6px 0"
                color="#444"
              >
                <strong>Phone:</strong>{" "}
                <Anchor to={`tel:${item.phone.replace(/[^ -9]/g, "")}`}>
                  {item.phone}
                </Anchor>
              </Paragraph>
              <Paragraph 
                fontSize="13px"
                fontSize_tablet="15px"
                margin="0 0 12px 0"
                margin_tablet="0 0 16px 0"
                color="#444"
              >
                <strong>Email:</strong>{" "}
                <Anchor to={`mailto:${item.email}`}>{item.email}</Anchor>
              </Paragraph>
              <Div display="flex" justifyContent="center" marginTop="auto">
                <Link to={item.calendly_link}>
                  <Button
                    aria-label={`Book a call with ${item.name} ${item.last_name}`}
                    variant="full"
                    background={Colors.blue}
                    textColor={Colors.white}
                    fontSize="13px"
                    fontSize_tablet="14px"
                    padding="10px 20px"
                    padding_tablet="12px 24px"
                    borderRadius="6px"
                    fontWeight="600"
                    style={{
                      transition:
                        "transform 250ms ease-in-out, background-color 250ms ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#ffb718";
                      e.target.style.transform = "scale(1.05)";
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
          </Div>
        ))}
      </Div>
    </Div>
  );
};

export default AdmissionsStaff;
