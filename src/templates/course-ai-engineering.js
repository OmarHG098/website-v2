import React, { useEffect, useState } from "react";
import { Link, graphql } from "gatsby";
import BaseRender from "./_baseLayout.js";
import { Header, Div } from "../components/Sections/index.js";
import { H3, H2, H5, H4, Paragraph } from "../components/Heading/index.js";
import { Button, Colors, Img } from "../components/Styling/index.js";
import { requestSyllabus, isCustomBarActive } from "../actions.js";
import { SessionContext } from "../session.js";
import PricesAndPayment from "../components/PricesAndPayment/index.js";
import Modal from "../components/Modal/index.js";
import LeadForm from "../components/LeadForm/index.js";
import Badges from "../components/Badges/index.js";
import JobGuaranteeSmall from "../components/JobGuaranteeSmall/index.js";
import OurPartners from "../components/OurPartners/index.js";
import Icon from "../components/Icon/index.js";
import Loc from "../components/Loc/index.js";
import DoubleActionCTA from "../components/DoubleActionCTA/index.js";
import TwoColumn from "../components/TwoColumn/index.js";
import Iconogram from "../components/Iconogram/index.js";
import ScholarshipSuccessCases from "../components/ScholarshipSuccessCases/index.js";
import Milestones from "../components/Milestones/index.js";

const Program = ({ data, pageContext, yml }) => {
  const { session } = React.useContext(SessionContext);
  const courseDetails = data.allCourseYaml.edges[0].node;
  const [open, setOpen] = React.useState(false);
  const hiring = data.allPartnerYaml.edges[0].node;
  const landingHiring = yml.partners;
  const doubleActionCTA = data.allDoubleActionCtaYaml.edges[0].node.cta;

  const defaultCourse = "ai-engineering";
  const program_schedule = yml.meta_info.slug.includes("full-time")
    ? "full_time"
    : "part_time";

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [applyButtonText, setApplyButtonText] = useState("");
  let city = session && session.location ? session.location.city : [];
  let currentLocation = data.allLocationYaml.edges.find(
    (loc) => loc.node?.city === city
  );

  const syllabus_button_text = yml.button.syllabus_heading;
  const apply_button_text = yml.button.apply_button_text;

  useEffect(() => {
    if (currentLocation !== undefined) {
      setApplyButtonText(currentLocation.node.button.apply_button_text);
    }
  }, [currentLocation]);

  return (
    <>
      {/* 1. Hero section */}
      <Header
        margin={
          isCustomBarActive(session) ? "120px auto 0 auto" : "40px auto 0 auto"
        }
        paragraphMargin="26px 20px"
        paragraphMargin_Tablet="26px 22%"
        paddingParagraph_tablet="0 40px"
        seo_title={yml.seo_title}
        title={yml.header.title}
        paragraph={yml.header.paragraph}
        padding_xxs="40px 20px"
        padding_md="40px 80px"
        padding_lg="40px 0px"
        padding_tablet="40px 40px"
        position="relative"
        fontSize_title="40px"
        fontSize_xxs="32px"
        fontSizeTitle_tablet="60px"
        fontFamily_title="Archivo-Black"
        fontSize_paragraph="21px"
        gridTemplateColumns_tablet="repeat(14, 1fr)"
        maxWidth="1280px"
        uppercase
      >
        <Img
          src="/images/landing/group-3.png"
          width="49px"
          height="286px"
          style={{
            position: "absolute",
            zIndex: "-1",
          }}
          display_xxs="none"
          display_tablet="flex"
          left_tablet="72px"
          top_tablet="13%"
          left_lg="0%"
          top_lg="13%"
        />
        <Div
          flexDirection_tablet="row"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          margin_tablet="0 0 50px 0"
        >
          <Link
            to={yml.button.apply_button_link}
            state={{ course: yml.meta_info.bc_slug }}
          >
            <Button
              variant="full"
              justifyContent="center"
              width="200px"
              width_tablet="fit-content"
              color={Colors.blue}
              margin_tablet="10px 24px 10px 0"
              textColor="white"
            >
              {applyButtonText || apply_button_text}
            </Button>
          </Link>
          <Button
            onClick={handleOpen}
            width="200px"
            width_tablet="fit-content"
            variant="outline"
            icon={
              <Icon
                icon="download"
                stroke={Colors.black}
                style={{ marginRight: "10px" }}
                width="46px"
                height="46px"
              />
            }
            color={Colors.black}
            margin="10px 0 50px 0"
            margin_tablet="0"
            textColor={Colors.black}
          >
            {syllabus_button_text}
          </Button>
        </Div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={open}
          onClose={handleClose}
        >
          <LeadForm
            style={{ marginTop: "50px" }}
            heading={yml.button.syllabus_heading}
            motivation={yml.button.syllabus_motivation}
            sendLabel={syllabus_button_text}
            formHandler={requestSyllabus}
            handleClose={handleClose}
            lang={pageContext.lang}
            redirect={
              pageContext.lang === "us" ? "/us/thank-you" : "/es/gracias"
            }
            data={{
              course: {
                type: "hidden",
                value: yml.meta_info.bc_slug,
                valid: true,
              },
            }}
          />
        </Modal>
        {/* 2. Badges */}
        <Badges
          lang={pageContext.lang}
          short_link={true}
          short_text="12px"
          margin="0 0 40px 0"
          paragraph={yml.badges.paragraph}
        />
      </Header>

      {/* 3. Job Guarantee Small */}
      <JobGuaranteeSmall
        content={data.allJobGuaranteeSmallYaml.edges[0].node}
      />

      {/* 4. Milestones Component */}
      <Milestones
        milestones={courseDetails.milestones}
        lang={pageContext.lang}
      />

      {/* 5. Two Column Left */}
      <TwoColumn
        left={{ image: yml.two_columns?.image, video: yml.two_columns?.video }}
        right={{
          heading: {
            ...yml.two_columns?.heading,
            text:
              yml.two_columns?.heading?.text_by_location &&
              session?.location?.city?.toLowerCase() === "miami"
                ? yml.two_columns.heading.text_by_location.miami
                : yml.two_columns.heading.text_by_location?.default ||
                  yml.two_columns.heading.text,
          },
          sub_heading: {
            ...yml.two_columns?.sub_heading,
            text:
              yml.two_columns?.sub_heading?.text_by_location &&
              session?.location?.city?.toLowerCase() === "miami"
                ? yml.two_columns.sub_heading.text_by_location.miami
                : yml.two_columns.sub_heading.text_by_location?.default ||
                  yml.two_columns.sub_heading.text,
          },
          bullets: yml.two_columns?.bullets,
          content: yml.two_columns?.content,
          button: yml.two_columns?.button,
        }}
        proportions={yml.two_columns?.proportions}
        session={session}
      />

      {/* 6. How It Works - Iconogram */}
      {courseDetails.how_it_works && (
        <Iconogram
          yml={{
            ...courseDetails.how_it_works,
            background: courseDetails.how_it_works.background || "#0084FF",
          }}
          index={0}
        />
      )}

      {/* 7. Scholarship Success Cases */}
      <ScholarshipSuccessCases
        content={data.allScholarshipSuccessCasesYaml.edges[0].node}
      />

      {/* 8. Payment Component */}
      <PricesAndPayment
        background={`linear-gradient(to bottom, ${Colors.white} 50%, ${Colors.lightYellow2} 50%)`}
        type={pageContext.slug}
        lang={pageContext.lang}
        locations={data.allLocationYaml.edges}
        defaultCourse={defaultCourse}
        defaultSchedule={program_schedule}
        title={yml.prices.heading}
        paragraph={yml.prices.sub_heading}
      />

      {/* 9. Two Column Right */}
      <TwoColumn
        right={{
          image: yml.two_columns_rigo?.image,
          video: yml.two_columns_rigo?.video,
        }}
        left={{
          heading: yml.two_columns_rigo?.heading,
          sub_heading: yml.two_columns_rigo?.sub_heading,
          bullets: yml.two_columns_rigo?.bullets,
          content: yml.two_columns_rigo?.content,
          button: yml.two_columns_rigo?.button,
        }}
        proportions={yml.two_columns_rigo?.proportions}
        session={session}
      />

      {/* 10. Who's Hiring - OurPartners */}
      <OurPartners
        images={hiring.partners.images}
        margin="0"
        padding="50px 0"
        marquee
        paddingFeatured="0 0 50px 0"
        featuredImages={landingHiring?.featured}
        showFeatured
        withoutLine
        title={landingHiring ? landingHiring.heading : hiring.partners.tagline}
        paragraph={
          landingHiring
            ? landingHiring.sub_heading
            : hiring.partners.sub_heading
        }
      />

      {/* 11. Loc Component */}
      <Loc lang={pageContext.lang} allLocationYaml={data.allLocationYaml} />

      {/* 12. Footer - handled by Layout wrapper */}
      <DoubleActionCTA />
    </>
  );
};

export const query = graphql`
  query CourseQuery(
    $file_name: String!
    $lang: String!
    $related_clusters: [String]
  ) {
    allMarkdownRemark(
      limit: 4
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { cluster: { in: $related_clusters } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
            type
            pagePath
          }
          frontmatter {
            author
            date
            image
            slug
            title
            excerpt
            featured
            status
            cluster
          }
        }
      }
    }
    allCourseYaml(
      filter: { fields: { file_name: { eq: $file_name }, lang: { eq: $lang } } }
    ) {
      edges {
        node {
          seo_title
          header {
            title
            paragraph
            image_alt
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 500
                  placeholder: NONE
                  quality: 100
                  breakpoints: [200, 340, 520, 890]
                )
              }
            }
          }
          button {
            syllabus_heading
            syllabus_btn_label
            syllabus_motivation
            apply_button_link
            apply_button_text
          }
          meta_info {
            title
            description
            image
            keywords
            slug
            bc_slug
            related_clusters
          }
          badges {
            paragraph
          }
          milestones {
            title
            sub_title
            items {
              id
              title
              description
              bullets {
                items {
                  text
                }
              }
            }
          }
          how_it_works {
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
            icons {
              icon
              title
              content
              color
            }
            background
          }
          two_columns {
            proportions
            image {
              style
              src
              shadow
            }
            video
            heading {
              text
              font_size
              text_by_location {
                miami
                default
              }
            }
            sub_heading {
              text
              font_size
              text_by_location {
                miami
                default
              }
            }
            button {
              text
              color
              background
              path
            }
            bullets {
              items {
                text
              }
            }
            content {
              text
              style
            }
          }
          two_columns_rigo {
            proportions
            image {
              style
              src
              shadow
            }
            video
            heading {
              text
              font_size
              style
              heading_image {
                src
              }
            }
            sub_heading {
              text
              font_size
              style
            }
            content {
              text
              style
            }
            bullets {
              items {
                heading
                text
              }
            }
          }
          prices {
            heading
            sub_heading
            selector {
              top_label
              placeholder
            }
            button {
              text
              link
            }
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
    allJobGuaranteeSmallYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          title
          icons {
            title
            icon
          }
          link {
            url
            label
          }
          text
        }
      }
    }
    allPartnerYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          partners {
            tagline
            sub_heading
            footer_tagline
            footer_button
            footer_link
            images {
              name
              link
              follow
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 350
                    placeholder: NONE
                  )
                }
              }
              featured
            }
          }
          coding {
            images {
              name
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 300
                    placeholder: NONE
                  )
                }
              }
              featured
            }
            tagline
            sub_heading
          }
          influencers {
            images {
              name
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 300
                    placeholder: NONE
                  )
                }
              }
              featured
            }
            tagline
            sub_heading
          }
          financials {
            images {
              name
              image {
                childImageSharp {
                  gatsbyImageData(
                    layout: CONSTRAINED
                    width: 100
                    placeholder: NONE
                  )
                }
              }
              featured
            }
            tagline
            sub_heading
          }
        }
      }
    }
    allLocationYaml(
      filter: {
        fields: { lang: { eq: $lang } }
        meta_info: { visibility: { nin: ["hidden", "unlisted"] } }
      }
    ) {
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
          button {
            apply_button_text
          }
          meta_info {
            slug
            description
            title
            image
            position
            visibility
            keywords
            redirects
            region
            cohort_exclude_regex
            cohort_include_regex
          }
          header {
            sub_heading
            tagline
            alt
            image {
              childImageSharp {
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 800
                  placeholder: NONE
                )
              }
            }
          }
          chart_section {
            data {
              percentage
              color
              description
            }
          }
          button {
            apply_button_link
            apply_button_text
            cohort_more_details_text
            syllabus_button_text
            syllabus_submit_text
          }
        }
      }
    }
    allDoubleActionCtaYaml(filter: { fields: { lang: { eq: $lang } } }) {
      edges {
        node {
          cta {
            title
            description
            primary {
              title
              description
              action_text
              action_url
              benefits
              footer_text
            }
            secondary {
              title
              description
              action_text
              action_url
              benefits
              footer_text
            }
            newsletter_form {
              placeholder_email
              error_email
              button_submit
              button_loading
              status_idle
              status_error
              status_correct_errors
              success_message
            }
          }
        }
      }
    }
  }
`;
export default BaseRender(Program);
