import React, { useState, useContext } from "react";
import { graphql } from "gatsby";
import BaseRender from "./_baseLayout";
import { Div, GridContainer, HR } from "../components/Sections";
import { H1, H2, H3, Paragraph } from "../components/Heading";
import { Colors, Anchor } from "../components/Styling";
import Icon from "../components/Icon";
import { SessionContext } from "../session.js";
import { isCustomBarActive } from "../actions";
import AdmissionsStaff from "../components/AdmissionsStaff";
import FreeResources from "../components/FreeResources";

const ThankYou = (props) => {
  const { data, pageContext, yml } = props;
  const { session } = useContext(SessionContext);
  const [checkStatus, setCheckStatus] = useState([
    { label: "facebook", status: false, iconColor: "#166fe5" },
    { label: "twitter", status: false, iconColor: "#1da1f2" },
    { label: "instagram", status: false, iconColor: "#8a3ab9" },
    { label: "meetup", status: false, iconColor: "#f65858" },
  ]);
  let socials = session && session.location ? session.location.socials : [];

  const updateStatus = (index, newvalue) => {
    let g = checkStatus[index];
    g["status"] = newvalue;
    if (index === -1) {
      // handle error
      console.log("no match");
    } else
      setCheckStatus([
        ...checkStatus.slice(0, index),
        g,
        ...checkStatus.slice(index + 1),
      ]);
  };

  return (
    <>
      <Div
        className="circles-container"
        display="none"
        display_tablet="inherit"
        position="fixed"
        width="100%"
        height="0"
        top="0"
        left="0"
        overflow="visible"
        pointerEvents="none"
        zIndex="1"
      >
        <Div className="circles-left" position="relative">
          <Icon
            icon="landingCircles/smCircle-red"
            width="23px"
            height="23px"
            style={{
              position: "absolute",
              left: "218px",
              top: "225px",
            }}
          />
          <Icon
            icon="landingCircles/mdCircle-lightBlue"
            style={{ position: "absolute", left: "53px", top: "97px" }}
          />
          <Icon
            icon="landingCircles/bigCircle-yellowLight"
            width="115px"
            height="329px"
            style={{ position: "absolute", left: "0px", top: "250px" }}
          />
        </Div>
        <Div className="circles-right" position="relative">
          <Icon
            icon="landingCircles/lgCircle-mustard"
            style={{
              position: "absolute",
              right: "0px",
              top: "269px",
            }}
          />
          <Icon
            icon="landingCircles/mdCircle-blue"
            width="67px"
            height="67px"
            style={{
              position: "absolute",
              right: "116px",
              top: "169px",
            }}
          />
          <Icon
            icon="landingCircles/smCircle-mustard"
            style={{
              position: "absolute",
              right: "299px",
              top: "122px",
            }}
          />
        </Div>
      </Div>

      <Div
        flexDirection="column"
        background={Colors.lightYellow}
        padding={{ xs: "24px 0", md: "60px 0" }}
        height="auto"
        margin={{ xs: "0", md: "60px 0 0 0" }}
      >
        <H1
          type="h1"
          zIndex="5"
          fontSize="13px"
          lineHeight="16px"
          fontWeight="700"
          letterSpacing="0.05em"
          color={Colors.darkGray2}
        >
          Coding Bootcamp
        </H1>

        <H2
          type="h2"
          zIndex="5"
          fontSize={{ xs: "32px", md: "48px" }}
          lineHeight={{ xs: "42px", md: "60px" }}
          margin={{ xs: "12px 0px 15px 0px", md: "16px 0px 19px 0px" }}
        >
          {`< ${yml.banner.tagline} >`}
        </H2>

        <H3 type="h3" margin="5px 0">
          {yml.content.title}
        </H3>
        {yml.content.message.split("\n").map((m, i) => (
          <Paragraph key={i} align="center">
            {m}
          </Paragraph>
        ))}
      </Div>

      {/* Render AdmissionsStaff only for English */}
      <AdmissionsStaff lang={session?.language} />

      {/* Free Resources (YAML-driven) */}
      {pageContext.lang === "us" && <FreeResources lang={session?.language} />}

      <GridContainer
        flexDirection="column"
        gridColumn_tablet="3 / span 10"
        margin={{ xs: "20px 0 0 0", md: "40px 0 0 0" }}
        padding={{ xs: "0 15px", md: "0" }}
      >
        <H3
          type="h3"
          margin="10px 0"
          fontSize="15px"
          lineHeight="22px"
          fontWeight="400"
          letterSpacing="0.05em"
        >
          {yml.social.title}
        </H3>
        <Div margin="15px auto" gap="40px">
          {socials?.map((ln, i) => (
            <Anchor
              key={i}
              cursor="pointer"
              to={ln.link}
              fontSize="13px"
              fontWeight="400"
              style={{
                textTransform: "uppercase",
                lineHeight: "22px",
                textAlign: "left",
              }}
              color={Colors.black}
            >
              {ln.icon && (
                <Icon
                  icon={ln.icon}
                  color={Colors.black}
                  fill={Colors.black}
                  height="42px"
                  width="42px"
                />
              )}
            </Anchor>
          ))}
        </Div>
      </GridContainer>
    </>
  );
};
export const query = graphql`
  query ThankQuery($file_name: String!, $lang: String!) {
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
          banner {
            tagline
            sub_heading
          }
          content {
            title
            message
            button
          }
          social {
            title
            message
            button_text
          }
        }
      }
    }
  }
`;
export default BaseRender(ThankYou);
