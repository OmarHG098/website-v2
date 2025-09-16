import React, { useState, useEffect, useContext, useRef } from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import ReCAPTCHA from "react-google-recaptcha";
import { GridContainer, Div } from "../Sections";
import { H2, H3, H4, Paragraph } from "../Heading";
import { Colors, Button, Spinner } from "../Styling";
import dayjs from "dayjs";
import { SelectRaw } from "../Select";
import "dayjs/locale/de";
import Icon from "../Icon";
import styled from "styled-components";
import { Input } from "../Form";
import { getCohorts, newsletterSignup } from "../../actions";
import { SessionContext } from "../../session";

const Form = styled.form`
  margin: 0 11px 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const UpcomingDates = ({
  id,
  style,
  lang,
  location,
  locations,
  message,
  defaultCourse,
  actionMessage,
  showMoreRedirect,
}) => {
  const dataQuery = useStaticQuery(graphql`
    {
      allUpcomingDatesYaml {
        edges {
          node {
            title
            paragraph
            conector
            to
            remote
            placeholder
            button {
              text
              top_label
            }
            syllabus_alias {
              default_course
              course_slug
              name
            }
            email_form_content {
              heading
              button_text
              successful_text
            }
            online_bootcamp
            info {
              button_link
              button_text
              program_label
              duration_label
              duration_weeks
              duration_part_time
              duration_full_time
              location_label
              date
              action_label
            }
            no_course_message
            footer {
              button_text
              button_text_close
              button_text_open
              button_link
            }
            fields {
              lang
            }
          }
        }
      }
      allCourseYaml {
        edges {
          node {
            fields {
              file_name
              lang
            }
            details {
              weeks
              week_unit
              weeks_label
            }
          }
        }
      }
    }
  `);

  const { session } = useContext(SessionContext);
  const captcha = useRef(null);

  const [data, setData] = useState({
    cohorts: { catalog: [], all: [], filtered: [] },
  });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [academy, setAcademy] = useState(null);

  const [formStatus, setFormStatus] = useState({
    status: "idle",
    msg: "Resquest",
  });
  const [formData, setVal] = useState({
    email: { value: "", valid: false },
    consent: { value: true, valid: true },
  });

  const captchaChange = () => {
    const captchaValue = captcha?.current?.getValue();
    if (captchaValue)
      setVal({ ...formData, token: { value: captchaValue, valid: true } });
    else setVal({ ...formData, token: { value: null, valid: false } });
  };

  let content = dataQuery.allUpcomingDatesYaml.edges.find(
    ({ node }) => node.fields.lang === lang
  );
  if (content) content = content.node;
  else return null;

  // Get course data to map durations dynamically
  const courseData = dataQuery.allCourseYaml.edges;

  // Helper function to get course duration from course files
  const getCourseDuration = (courseSlug) => {
    const course = courseData.find(({ node }) => {
      const fileName = node.fields.file_name;
      const fileLang = node.fields.lang;

      // Extract the base name from the filename (remove .us.yaml or .es.yaml)
      const baseName = fileName.split(".")[0];

      return baseName === courseSlug && fileLang === lang;
    });

    if (course && course.node.details && course.node.details.weeks) {
      const weeks = course.node.details.weeks;
      const weeksLabel =
        course.node.details.weeks_label ||
        course.node.details.week_unit ||
        "weeks";
      return `${weeks} ${weeksLabel}`;
    }

    return null;
  };

  const emailFormContent = content.email_form_content;
  const syllabusAlias = content.syllabus_alias;

  const getData = async () => {
    try {
      setIsLoading(true);
      const academySlug =
        session?.academyAliasDictionary?.[location] ||
        location ||
        session?.academyAliasDictionary?.[academy?.value];

      console.log("Fetching cohorts with params:", {
        academy: academySlug,
        limit: 10,
        syllabus_slug_like: defaultCourse || undefined,
      });

      const response = await getCohorts({
        academy: academySlug,
        limit: 10,
        syllabus_slug_like: defaultCourse || undefined,
      });

      console.log("Cohorts API response:", response);

      if (!response || !response.results) {
        console.error("Invalid response from cohorts API:", response);
        setIsLoading(false);
        return;
      }

      const academyLocation = locations.find(
        ({ node }) =>
          node.breathecode_location_slug === location ||
          node.breathecode_location_slug === academy?.value
      );

      const cohorts =
        response?.results.filter((elm) => {
          // Filter out Build Profile / Geekforce related courses
          if (
            elm.syllabus_version?.name?.toLowerCase().includes("build") &&
            elm.syllabus_version?.name?.toLowerCase().includes("profile")
          ) {
            console.log(`removing Build Profile course: ${elm.slug}`);
            return false;
          }

          // Additional filtering for "Building Your Tech Profile" variations
          if (
            elm.syllabus_version?.name?.toLowerCase().includes("building") &&
            elm.syllabus_version?.name?.toLowerCase().includes("tech")
          ) {
            console.log(`removing Building Tech Profile course: ${elm.slug}`);
            return false;
          }

          // Existing location-based filtering
          if (
            Array.isArray(academyLocation?.node.meta_info.cohort_exclude_regex)
          ) {
            if (
              academyLocation.node.meta_info.cohort_exclude_regex.some((regx) =>
                RegExp(regx).test(elm.slug)
              )
            ) {
              console.log(`removing ${elm.slug}`);
              return false;
            }
          }
          return true;
        }) || [];

      cohorts.forEach((cohort) => {
        // Validate cohort data
        if (!cohort.kickoff_date || !cohort.ending_date) {
          console.warn("Cohort missing date information:", cohort.slug, {
            kickoff_date: cohort.kickoff_date,
            ending_date: cohort.ending_date,
          });
        }

        // Validate date format
        if (cohort.kickoff_date && !dayjs(cohort.kickoff_date).isValid()) {
          console.error(
            "Invalid kickoff_date format for cohort:",
            cohort.slug,
            cohort.kickoff_date
          );
        }

        if (cohort.ending_date && !dayjs(cohort.ending_date).isValid()) {
          console.error(
            "Invalid ending_date format for cohort:",
            cohort.slug,
            cohort.ending_date
          );
        }

        const syllabus =
          syllabusAlias.find((syll) => syll.default_course === defaultCourse) ||
          syllabusAlias.find((syll) =>
            cohort.syllabus_version?.slug
              ?.toLowerCase()
              ?.includes(syll.default_course)
          );

        if (syllabus) {
          cohort.syllabus_version.name = syllabus.name;
          cohort.syllabus_version.courseSlug = syllabus.course_slug;

          // Get dynamic duration from course files
          const dynamicDuration = getCourseDuration(syllabus.course_slug);
          cohort.syllabus_version.duration =
            dynamicDuration || syllabus.duration;
        } else {
          console.warn(
            "No syllabus alias found for cohort:",
            cohort.slug,
            cohort.syllabus_version?.slug
          );
        }
      });

      setData((oldData) => ({
        cohorts: {
          catalog: oldData.cohorts.catalog,
          all: cohorts,
          filtered: cohorts,
        },
      }));
      setIsLoading(false);
    } catch (e) {
      console.error("Error fetching cohorts data:", e);
      console.error("Error details:", {
        message: e.message,
        stack: e.stack,
        academySlug: session?.academyAliasDictionary?.[location] || location,
        defaultCourse,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.academyAliasDictionary) getData();
  }, [session, academy]);

  const formIsValid = (formData = null) => {
    if (!formData) return null;
    for (let key in formData) {
      if (!formData[key].valid) return false;
    }
    return true;
  };

  useEffect(() => {
    if (session && Array.isArray(session.locations)) {
      const _data = {
        ...data,
        cohorts: {
          ...data.cohorts,
          catalog: [{ label: "All Locations", value: null }].concat(
            session.locations.map((l) => ({
              label: l.city,
              value: l.breathecode_location_slug,
            }))
          ),
        },
      };
      setData(_data);
    }
  }, [session]);
  const buttonText = session?.location?.button.apply_button_text;

  const isAliasLocation = (slug) => {
    const mapped = session?.academyAliasDictionary?.[slug];
    return Boolean(mapped && mapped !== slug);
  };

  return (
    <GridContainer
      id={id}
      style={style}
      margin_tablet="0 auto 48px auto"
      maxWidth="1280px"
      containerColumns_tablet="14fr"
      gridColumn_tablet="1 / 15"
      padding_xxs="0 20px"
      padding_md="40px 80px"
      padding_lg="40px 0px"
      padding_tablet="40px 40px"
    >
      <Div flexDirection="column">
        <H2 textAlign="center">{content?.title}</H2>
        <Div
          padding="30px 0"
          gap="15px"
          style={{ borderBottom: "1px solid black" }}
          justifyContent_tablet="between"
          flexDirection="column"
          flexDirection_tablet="row"
          alignItems_tablet="center"
        >
          <H3 textAlign="left" width="188px">
            {content?.title}
          </H3>
          {!location && (
            <Div
              width_tablet="220px"
              width_md="320px"
              width_xs="320px"
              width_xxs="280px"
            >
              <SelectRaw
                style={{
                  input: (styles) => ({
                    ...styles,
                    width: "100%",
                    margin: "5px 0px",
                  }),
                  control: (styles, state) => ({
                    ...styles,
                    fontFamily: "Lato, sans-serif",
                    background: "#ffffff",
                    border: "1px solid #000",
                    boxShadow: "none",
                    marginBottom: "0px",
                    marginTop: "0px",
                    width: "100%",
                    fontSize: "15px",
                    fontWeight: "400",
                    color: "#000",
                    lineHeight: "22px",
                    "&:hover": { boxShadow: "0 0 0 1px black" },
                    "&:focus": {
                      boxShadow: "0 0 0 1px black",
                      border: "1px solid #000000",
                    },
                  }),
                  option: (
                    styles,
                    { data, isDisabled, isFocused, isSelected }
                  ) => {
                    return {
                      ...styles,
                      fontFamily: "Lato, sans-serif",
                    };
                  },
                }}
                options={data?.cohorts?.catalog}
                placeholder={
                  academy ? `Campus: ${academy.label}` : content.placeholder
                }
                onChange={(opt) => {
                  setAcademy(opt);
                }}
              />
            </Div>
          )}
        </Div>
        <Div flexDirection="column" alignItems="stretch" width="100%">
          {isLoading ? (
            <Div margin="30px 0" justifyContent="center">
              <Spinner />
            </Div>
          ) : (
            <>
              {Array.isArray(data.cohorts.filtered) &&
              data.cohorts.filtered.length > 0 ? (
                <>
                  {/* Header row for consistent alignment */}
                  <Div
                    flexDirection="column"
                    flexDirection_tablet="row"
                    style={{
                      borderTop: "1px solid black",
                      borderBottom: "2px solid black",
                    }}
                    padding="15px 0"
                    justifyContent="between"
                    alignItems="stretch"
                    display="none"
                    display_tablet="flex"
                  >
                    <Div width_tablet="20%" flexShrink="0">
                      <H4
                        textAlign="left"
                        textTransform="uppercase"
                        fontWeight="700"
                      >
                        {content.info.date}
                      </H4>
                    </Div>
                    <Div width_tablet="25%" flexShrink="0">
                      <H4
                        textAlign="left"
                        textTransform="uppercase"
                        fontWeight="700"
                      >
                        {content.info.program_label}
                      </H4>
                    </Div>
                    <Div width_tablet="20%" flexShrink="0">
                      <H4
                        textAlign="left"
                        textTransform="uppercase"
                        fontWeight="700"
                      >
                        {content.info.location_label}
                      </H4>
                    </Div>
                    <Div width_tablet="15%" flexShrink="0">
                      <H4
                        textAlign="left"
                        textTransform="uppercase"
                        fontWeight="700"
                      >
                        {content.info.duration_label}
                      </H4>
                    </Div>
                    <Div width_tablet="20%" flexShrink="0">
                      <H4
                        textAlign="left"
                        textTransform="uppercase"
                        fontWeight="700"
                      >
                        {content.info.action_label}
                      </H4>
                    </Div>
                  </Div>
                  {data.cohorts.filtered.map((cohort, i) => {
                    const loc = locations.find(
                      ({ node }) =>
                        node.breathecode_location_slug === cohort.academy.slug
                    );
                    return (
                      i < 4 && (
                        <Div
                          key={i}
                          flexDirection="column"
                          flexDirection_tablet="row"
                          style={{ borderBottom: "1px solid black" }}
                          padding="30px 0"
                          justifyContent="between"
                          alignItems="stretch"
                        >
                          <Div
                            flexDirection_tablet="column"
                            width_tablet="20%"
                            alignItems="center"
                            alignItems_tablet="start"
                            margin="0 0 10px 0"
                            flexShrink="0"
                          >
                            <H4
                              textAlign="left"
                              textTransform="uppercase"
                              width="fit-content"
                              margin="0 10px 0 0"
                              fontWeight="700"
                              lineHeight="22px"
                            >
                              {dayjs(cohort.kickoff_date)
                                .locale(`${lang === "us" ? "en" : "es"}`)
                                .format("MMMM")}
                            </H4>
                            <Paragraph textAlign="left" fontWeight="700">
                              {`
                          ${
                            lang === "us"
                              ? dayjs(cohort.kickoff_date)
                                  .locale("en")
                                  .format("MM/DD")
                              : dayjs(cohort.kickoff_date)
                                  .locale("es")
                                  .format("DD/MM")
                          } 
                          ${content.to} 
                          ${
                            lang === "us"
                              ? dayjs(cohort.ending_date)
                                  .locale("en")
                                  .format("MM/DD")
                              : dayjs(cohort.ending_date)
                                  .locale("es")
                                  .format("DD/MM")
                          }
                        `}
                            </Paragraph>
                          </Div>
                          <Div
                            flexDirection="column"
                            width_tablet="25%"
                            margin="0 0 20px 0"
                            flexShrink="0"
                            alignItems_tablet="flex-start"
                          >
                            <Link
                              to={
                                cohort.syllabus_version.courseSlug
                                  ? `/${lang}/coding-bootcamps/${cohort.syllabus_version.courseSlug}`
                                  : ""
                              }
                            >
                              <Paragraph textAlign="left" color={Colors.blue}>
                                {cohort.syllabus_version.name}
                              </Paragraph>
                            </Link>
                          </Div>
                          <Div
                            flexDirection="column"
                            display="none"
                            display_tablet="flex"
                            width_tablet="20%"
                            flexShrink="0"
                            alignItems_tablet="flex-start"
                          >
                            <Div>
                              {(() => {
                                const selectedSlug =
                                  academy?.value ||
                                  location ||
                                  cohort.academy.slug;
                                const isRemote =
                                  isAliasLocation(selectedSlug) ||
                                  cohort.academy.city.name === "Remote";
                                const isInPersonMiamiOrDallas =
                                  (cohort.academy.city.name === "Miami" ||
                                    cohort.academy.city.name === "Dallas") &&
                                  !isRemote;

                                if (isRemote) {
                                  // For remote programs, show only "Remote" and make it non-clickable
                                  return (
                                    <Paragraph
                                      textAlign="left"
                                      color={Colors.black}
                                    >
                                      {content.remote.replace(" available", "")}
                                    </Paragraph>
                                  );
                                } else if (isInPersonMiamiOrDallas) {
                                  // For in-person Miami/Dallas, show city name and make it clickable
                                  return (
                                    <Link
                                      to={
                                        loc
                                          ? `/${lang}/coding-campus/${loc.node.meta_info.slug}`
                                          : ""
                                      }
                                    >
                                      <Paragraph
                                        textAlign="left"
                                        color={Colors.blue}
                                      >
                                        {cohort.academy.city.name}
                                      </Paragraph>
                                    </Link>
                                  );
                                } else {
                                  // For other locations, show city name with remote availability
                                  return (
                                    <Link
                                      to={
                                        loc
                                          ? `/${lang}/coding-campus/${loc.node.meta_info.slug}`
                                          : ""
                                      }
                                    >
                                      <Paragraph
                                        textAlign="left"
                                        color={Colors.blue}
                                      >
                                        {`${
                                          cohort.academy.city.name
                                        } (${content.remote.replace(
                                          " available",
                                          ""
                                        )})`}
                                      </Paragraph>
                                    </Link>
                                  );
                                }
                              })()}
                            </Div>
                          </Div>

                          <Div
                            flexDirection="column"
                            display="none"
                            display_tablet="flex"
                            width_tablet="15%"
                            flexShrink="0"
                            alignItems_tablet="flex-start"
                          >
                            <Paragraph textAlign="left">
                              {cohort?.syllabus_version?.duration ||
                                content.info.duration_weeks}
                            </Paragraph>
                          </Div>

                          <Div
                            display="flex"
                            display_tablet="none"
                            justifyContent="between"
                            margin="0 0 20px 0"
                            width="100%"
                          >
                            <Div flexDirection="column" width="50%">
                              <H4 textAlign="left" textTransform="uppercase">
                                {content.info.location_label}
                              </H4>
                              <Div>
                                {(() => {
                                  const selectedSlug =
                                    academy?.value ||
                                    location ||
                                    cohort.academy.slug;
                                  const isRemote =
                                    isAliasLocation(selectedSlug) ||
                                    cohort.academy.city.name === "Remote";
                                  const isInPersonMiamiOrDallas =
                                    (cohort.academy.city.name === "Miami" ||
                                      cohort.academy.city.name === "Dallas") &&
                                    !isRemote;

                                  if (isRemote) {
                                    // For remote programs, show only "Remote" and make it non-clickable
                                    return (
                                      <Paragraph
                                        textAlign="left"
                                        color={Colors.black}
                                      >
                                        {content.remote.replace(
                                          " available",
                                          ""
                                        )}
                                      </Paragraph>
                                    );
                                  } else if (isInPersonMiamiOrDallas) {
                                    // For in-person Miami/Dallas, show city name and make it clickable
                                    return (
                                      <Link
                                        to={
                                          loc
                                            ? `/${lang}/coding-campus/${loc.node.meta_info.slug}`
                                            : ""
                                        }
                                      >
                                        <Paragraph
                                          textAlign="left"
                                          color={Colors.blue}
                                        >
                                          {cohort.academy.city.name}
                                        </Paragraph>
                                      </Link>
                                    );
                                  } else {
                                    // For other locations, show city name with remote availability
                                    return (
                                      <Link
                                        to={
                                          loc
                                            ? `/${lang}/coding-campus/${loc.node.meta_info.slug}`
                                            : ""
                                        }
                                      >
                                        <Paragraph
                                          textAlign="left"
                                          color={Colors.blue}
                                        >
                                          {`${
                                            cohort.academy.city.name
                                          } (${content.remote.replace(
                                            " available",
                                            ""
                                          )})`}
                                        </Paragraph>
                                      </Link>
                                    );
                                  }
                                })()}
                              </Div>
                            </Div>
                            <Div flexDirection="column" width="50%">
                              <H4 textAlign="left" textTransform="uppercase">
                                {content.info.duration_label}
                              </H4>
                              <Paragraph textAlign="left">
                                {cohort?.syllabus_version?.duration ||
                                  content.info.duration_weeks}
                              </Paragraph>
                            </Div>
                          </Div>

                          <Div
                            flexDirection="column"
                            width_tablet="20%"
                            flexShrink="0"
                            alignItems_tablet="flex-start"
                          >
                            <Link to={content.info.button_link}>
                              <Button
                                variant="full"
                                width="fit-content"
                                color={Colors.black}
                                margin="0"
                                textColor="white"
                              >
                                {buttonText || content.info.button_text}
                              </Button>
                            </Link>
                          </Div>
                        </Div>
                      )
                    );
                  })}
                </>
              ) : (
                <>
                  <Div
                    display={showForm ? "none" : "flex"}
                    padding="70px 0"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    padding_tablet="90px 0"
                  >
                    <Icon icon="agenda" />
                    {message && (
                      <Paragraph margin="25px 0 0 0">{message}</Paragraph>
                    )}
                    {actionMessage && (
                      <Paragraph
                        color={Colors.blue}
                        onClick={() => setShowForm(true)}
                        width="auto"
                        cursor="pointer"
                        margin="10px 0 0 0"
                        fontWeight="700"
                      >
                        {actionMessage}
                      </Paragraph>
                    )}
                  </Div>
                  <Div
                    padding="70px 10%"
                    padding_tablet="90px 32%"
                    display={showForm ? "flex" : "none"}
                    flexDirection="column"
                  >
                    {formStatus.status === "thank-you" ? (
                      <Div alignItems="center" flexDirection="column">
                        <Icon icon="success" width="80px" height="80px" />{" "}
                        <H4
                          fontSize="15px"
                          lineHeight="22px"
                          margin="25px 0 10px 10px"
                          align="center"
                        >
                          {emailFormContent.successful_text}
                        </H4>
                      </Div>
                    ) : (
                      <>
                        <H4
                          margin="0 0 25px 0"
                          textAlign="left"
                          display="block"
                          display_tablet="block"
                        >
                          {emailFormContent.heading}
                        </H4>
                        <Div justifyContent="center" width="100%">
                          <Form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (formStatus.status === "error") {
                                setFormStatus({
                                  status: "idle",
                                  msg: "Resquest",
                                });
                              }
                              if (!formIsValid(formData)) {
                                setFormStatus({
                                  status: "error",
                                  msg: "There are some errors in your form",
                                });
                              } else {
                                setFormStatus({
                                  status: "loading",
                                  msg: "Loading...",
                                });
                                const token =
                                  await captcha.current.executeAsync();
                                newsletterSignup(
                                  {
                                    ...formData,
                                    token: { value: token, valid: true },
                                  },
                                  session
                                )
                                  .then((data) => {
                                    if (
                                      data.error !== false &&
                                      data.error !== undefined
                                    ) {
                                      setFormStatus({
                                        status: "error",
                                        msg: "Fix errors",
                                      });
                                    } else {
                                      setFormStatus({
                                        status: "thank-you",
                                        msg: "Thank you",
                                      });
                                    }
                                  })
                                  .catch((error) => {
                                    console.log("error", error);
                                    setFormStatus({
                                      status: "error",
                                      msg: error.message || error,
                                    });
                                  });
                              }
                            }}
                          >
                            <Input
                              type="email"
                              className="form-control"
                              width="100%"
                              placeholder="E-mail *"
                              borderRadius="3px"
                              bgColor={Colors.white}
                              margin="0"
                              onChange={(value, valid) => {
                                setVal({
                                  ...formData,
                                  email: { value, valid },
                                });
                                if (formStatus.status === "error") {
                                  setFormStatus({
                                    status: "idle",
                                    msg: "Resquest",
                                  });
                                }
                              }}
                              value={formData.email.value}
                              errorMsg="Please specify a valid email"
                              required
                            />
                            <Div width="fit-content" margin="10px auto 0 auto">
                              <ReCAPTCHA
                                ref={captcha}
                                sitekey={process.env.GATSBY_CAPTCHA_KEY}
                                size="invisible"
                              />
                            </Div>
                            <Button
                              height="40px"
                              background={Colors.blue}
                              // margin="0 0 0 10px"
                              type="submit"
                              fontWeight="700"
                              justifyContent="center"
                              margin="35px 0 0 0"
                              width="100%"
                              fontSize="14px"
                              variant="full"
                              color={
                                formStatus.status === "loading"
                                  ? Colors.darkGray
                                  : Colors.blue
                              }
                              textColor={Colors.white}
                              disabled={
                                formStatus.status === "loading" ? true : false
                              }
                            >
                              {formStatus.status === "loading"
                                ? "Loading..."
                                : emailFormContent.button_text}
                            </Button>
                          </Form>
                        </Div>
                      </>
                    )}
                  </Div>
                </>
              )}
              {Array.isArray(data.cohorts.filtered) &&
                data.cohorts.filtered.length > 0 &&
                showMoreRedirect && (
                  <Link to={content.footer.button_link}>
                    <Paragraph margin="20px 0" color={Colors.blue}>
                      {content.footer.button_text}
                    </Paragraph>
                  </Link>
                )}
            </>
          )}
        </Div>
      </Div>
    </GridContainer>
  );
};

export default UpcomingDates;
