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
              locations
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

  const filterByLocation = (staffMember) => {
    const locations = Array.isArray(staffMember.locations)
      ? staffMember.locations
          .filter((s) => typeof s === "string" && s.trim() !== "")
          .map((s) => s.trim())
      : [];

    const candidates = [
      session?.location?.breathecode_location_slug,
      session?.location?.meta_info?.slug,
      session?.location?.active_campaign_location_slug,
    ].filter((s) => typeof s === "string" && s.length > 0);

    // If the location is not resolved yet, render only if staff targets at least one location
    if (candidates.length === 0) return locations.length > 0;

    // Match any candidate or "all"
    for (const id of candidates) {
      if (locations.includes(id) || locations.includes("all")) return true;
    }
    return false;
  };

  // Prefer explicit prop.lang, then path-derived lang, then session.language; fallback to us
  let pathLang = null;
  if (typeof window !== "undefined") {
    const segment = window.location.pathname.split("/").filter(Boolean)[0];
    if (segment === "es" || segment === "us") pathLang = segment;
  }
  const dataLang = (
    props.lang ||
    pathLang ||
    session?.language ||
    "us"
  ).replace("en", "us");
  let admissionsStaff = data.allAdmissionsStaffYaml.edges.find(
    ({ node }) => node.fields.lang === dataLang
  );
  if (admissionsStaff) admissionsStaff = admissionsStaff.node;
  else return null;

  // Filter staff members based on current location
  const filteredStaff = (
    Array.isArray(admissionsStaff.staff) ? admissionsStaff.staff : []
  ).filter(filterByLocation);
  // Avoid flicker: if session exists but no candidates yet, do not render until location resolves
  const candidates = [
    session?.location?.breathecode_location_slug,
    session?.location?.meta_info?.slug,
    session?.location?.active_campaign_location_slug,
  ].filter((s) => typeof s === "string" && s.length > 0);
  if (session && candidates.length === 0) return null;
  if (filteredStaff.length === 0) return null;

  // Update the admissionsStaff object with filtered staff
  admissionsStaff = { ...admissionsStaff, staff: filteredStaff };

  return (
    <Div
      columns_tablet="12"
      flexDirection="column"
      padding="20px 20px"
      padding_md="30px 60px"
      padding_lg="30px 0px"
      padding_tablet="30px 40px 10px 40px"
      margin_tablet="0 auto 20px auto"
      margin="0 0 24px 0"
      maxWidth="1280px"
      containerColumns_tablet="repeat(12,1fr)"
      gridColumn_tablet="1 / span 12"
      gap="24px 0px"
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
      <Div display="flex" flexDirection="column" alignItems="center">
        {admissionsStaff.staff.map((item, index) => (
          <Div
            key={index}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="12px"
            margin="0 0 24px 0"
            padding="16px"
            border={`2px solid ${Colors.lightGray}`}
            borderRadius="4px"
            width="100%"
            maxWidth="500px"
          >
            <Div
              width="160px"
              width_tablet="200px"
              width_sm="120px"
              width_xs="80px"
            >
              <Div
                width="100%"
                height_tablet="240px"
                height_sm="120px"
                height="160px"
                height_xs="90px"
                alignItems="center"
                justifyContent="center"
              >
                {item.image && item.image.childImageSharp && (
                  <GatsbyImage
                    image={getImage(item.image.childImageSharp.gatsbyImageData)}
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: "4px",
                    }}
                    imgStyle={{ objectFit: "cover", objectPosition: "center" }}
                    alt={`${item.name} ${item.last_name}`}
                  />
                )}
              </Div>
            </Div>
            <Div flex="1" flexDirection="column">
              <H3
                fontSize="16px"
                fontSize_tablet="20px"
                lineHeight="20px"
                lineHeight_tablet="26px"
                margin="0 0 6px 0"
                margin_tablet="0 0 8px 0"
                textAlign="left"
              >
                {item.name} {item.last_name}
              </H3>
              <H4
                fontSize="14px"
                fontSize_tablet="16px"
                lineHeight="18px"
                lineHeight_tablet="20px"
                margin="0 0 8px 0"
                margin_tablet="0 0 8px 0"
                textAlign="left"
              >
                {item.job_title}
              </H4>
              <Paragraph
                fontSize="13px"
                fontSize_tablet="15px"
                margin="0 0 4px 0"
                margin_tablet="0 0 6px 0"
                color="#444"
                textAlign="left"
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
                margin_tablet="0 0 12px 0"
                color="#444"
                textAlign="left"
              >
                <strong>Email:</strong>{" "}
                <Anchor to={`mailto:${item.email}`}>{item.email}</Anchor>
              </Paragraph>
              <Div display="flex" justifyContent="flex-start" marginTop="auto">
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
