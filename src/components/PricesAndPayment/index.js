import React, { useState, useContext, useEffect, useRef } from "react";
import { useStaticQuery, graphql } from "gatsby";
import Icon from "../Icon";
import { Link } from "../Styling/index";
import { GridContainer, Div, Grid } from "../Sections";
import { SelectRaw } from "../Select";
import { H2, H3, H4, H5, Paragraph } from "../Heading";
import { Button, Colors, RoundImage, Img, Toggle } from "../Styling";
import { SessionContext } from "../../session";
import { isWindow } from "../../utils/utils";



// Additional UI per new Figma: payment options explainer and mobile dropdown
const PaymentOptionCard = ({ option, selectedOption, setSelectedOption }) => {
  return (
    <Div border="1px solid #E5E5E5" borderRadius="8px" margin="0 0 12px 0" background={Colors.white} display="block" display_xs="block" display_xxs="block">
      <Div padding="16px 20px" cursor="pointer" onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)} justifyContent="space-between" alignItems="center">
        <Div display="block">
          {option.recomended && (
            <Paragraph
              fontSize="12px"
              fontWeight="700"
              color={option.recommended_color?.startsWith("#") ? option.recommended_color : Colors[option.recommended_color?.toLowerCase()] || Colors.green}
              margin="0 0 4px 0"
            >
              {option.recomended}
            </Paragraph>
          )}
          <Paragraph fontSize="14px" fontWeight="600" color={Colors.black} margin="0 0 4px 0">
            {option.title}
          </Paragraph>
          <Paragraph fontSize="12px" color="#666666" margin="0">
            {option.description}
          </Paragraph>
        </Div>
        <Icon icon={selectedOption === option.id ? "angleup" : "angledown"} width="16px" height="16px" color="#666666" />
      </Div>

      {selectedOption === option.id && (
        <Div
          borderTop="1px solid #E5E5E5"
          padding="16px 20px"
          background="#FAFAFA"
          display="block"
          display_xs="block"
          display_xxs="block"
        >

          {option.bullets && option.bullets.map((bullet, index) => (
            <Div key={index} alignItems="center" margin="8px 0">
              <Icon
                icon="check"
                width="14px"
                height="14px"
                color={Colors.blue}
                fill={Colors.blue}
                style={{ marginRight: "8px", marginTop: "2px", flexShrink: 0 }}
              />
              <Paragraph
                fontSize="14px"
                color={Colors.black}
                margin="0"
                dangerouslySetInnerHTML={{ __html: bullet }}
              />
            </Div>
          ))}

          {option.icons && option.icons.length > 0 && (
            <Div
              className="icons"
              background={Colors.verylightGray}
              padding="4px 7px"
              borderRadius="26px"
              width="fit-content"
              alignItems="center"
              margin="16px 0 0 0"
            >
              {option.icons.map((icon) => (
                <Img
                  key={icon}
                  src={icon}
                  alt="4Geeks Academy Icon"
                  backgroundSize="contain"
                  height="17px"
                  minWidth="30px"
                  width="50px"
                  margin="0 5px"
                />
              ))}
            </Div>
          )}
        </Div>
      )}
    </Div>
  );
};

// Desktop-only enhanced financial options component
const FinancialOptionsDesktop = ({
  info,
  selectedPlan,
  setSelectedPlan,
  jobGuarantee,
  setJobGuarantee,
  session,
  setSession,
  availablePlans,
}) => {
  const [localSelected, setLocalSelected] = useState(null);

  // Build options list from available plans (YAML-driven)
  const paymentOptions = (availablePlans || []).map((plan) => ({
    id: plan.slug,
    title: plan.scholarship,
    description: plan.payment_time,
    details: plan.warning_message,
    price: plan.price,
    originalPrice: plan.original_price,
    icons: plan.icons,
    recomended: plan.recomended,
    recommended_color: plan.recommended_color,
    bullets: plan.bullets,
  }));

  const activeId = localSelected || selectedPlan;
  const currentPlan = (availablePlans || []).find((p) => p.slug === activeId) || (availablePlans || [])[0];
  const activeOption = paymentOptions.find((o) => o.id === (activeId)) || paymentOptions[0];

  return (
    <Div
      display="none"
      display_tablet="flex"
      width="100%"
      maxWidth_md="1280px"
      border="4px solid black"
      borderRadius="12px"
      gap="16px"
      margin="24px 0"
      boxShadow={Colors.shadow}
    >
      {/* Left column */}
      <Div
        display="block"
        background={Colors.white}
        borderRight={`1px solid ${Colors.lightGray}`}
        padding="24px"
        width_tablet="50%"
      >
        <H3 color={Colors.blue} fontWeight="700" margin="0 0 16px 0" textAlign="left">
          {"Invest in your future, stress-free"}
        </H3>

        <Div display="block" margin="0 0 12px 0">
          <H2 fontSize="36px" lineHeight="42px" fontWeight="700" color={Colors.black} margin="0 0 6px 0" textAlign="left">
            {currentPlan?.price || ""}
          </H2>
          {currentPlan?.original_price && (
            <Paragraph color="#B4B4B4" margin="0 0 8px 0" textAlign="left">
              <s>{currentPlan.original_price}</s>
            </Paragraph>
          )}
          <Paragraph color={Colors.black} fontSize="14px" margin="0 0 6px 0" textAlign="left">
            {currentPlan?.payment_time}
          </Paragraph>
          {currentPlan?.warning_message && (
            <Paragraph color={Colors.darkGray} fontSize="12px" opacity="1" textAlign="left">
              {currentPlan.warning_message}
            </Paragraph>
          )}
        </Div>

        {/* Job Guarantee toggle */}
        {availablePlans?.some((p) => p.price) && (
          <Div margin="16px 0 0 0" display="block">
            <Div alignItems="center">
              <Div
                position="relative"
                width="42px"
                height="22px"
                borderRadius="9999px"
                background={jobGuarantee ? Colors.blue : Colors.lightGray}
                onClick={() => setJobGuarantee && setJobGuarantee(!jobGuarantee)}
                cursor="pointer"
              >
                <Div
                  position="absolute"
                  top="2px"
                  left={jobGuarantee ? "22px" : "2px"}
                  width="18px"
                  height="18px"
                  borderRadius="9999px"
                  background={Colors.white}
                  transition="left 0.2s ease-in-out"
                />
              </Div>
              <H4 fontSize_tablet="18px" fontSize_xs="16px" margin="0 0 0 10px">
                {info.job_guarantee.title}
              </H4>
            </Div>
            <Paragraph textAlign="left" color={Colors.black} margin="8px 0 0 0">
              {info.job_guarantee.description}
            </Paragraph>
          </Div>
        )}

        {/* Bullets from selected plan */}
        {currentPlan?.bullets && currentPlan.bullets.length > 0 && (
          <Div display="block" margin="24px 0 0 0">
            <Div borderTop={`1px solid #ebebeb`} width="60%" margin="0 0 12px 0" />
            {currentPlan.bullets.map((bullet, index) => (
              <Div key={index} alignItems="center" margin="12px 0 0 0">
                <Icon
                  icon="check"
                  width="17px"
                  height="17px"
                  style={{ marginRight: "10px" }}
                  color={Colors.blue}
                  fill={Colors.blue}
                />
                <Paragraph
                  color={Colors.black}
                  textAlign="left"
                  dangerouslySetInnerHTML={{ __html: bullet }}
                />
              </Div>
            ))}
          </Div>
        )}

        {/* Partner logos from YAML icons */}
        {currentPlan?.icons && currentPlan.icons.length > 0 && (
          <Div
            className="icons"
            background={Colors.verylightGray}
            padding="4px 7px"
            borderRadius="26px"
            width="fit-content"
            alignItems="center"
            margin="16px 0 0 0"
          >
            {currentPlan.icons.map((icon) => (
              <Img
                key={`${icon}-${currentPlan.slug}`}
                src={icon}
                alt="4Geeks Academy Icon"
                backgroundSize="contain"
                height="17px"
                minWidth="30px"
                width="50px"
                margin="0 5px"
              />
            ))}
          </Div>
        )}
      </Div>

      {/* Right column */}
      <Div
        display="block"
        background={Colors.verylightGray3}
        padding="24px"
        width_tablet="50%"
      >
        <H3 color={Colors.blue} fontWeight="700" margin="0 0 12px 0" textAlign="left">
          {"Other payment options"}
        </H3>
        {(paymentOptions || []).map((option) => {
          const isSelected = (localSelected || selectedPlan) === option.id;
          return (
            <Div
              key={option.id}
              border={isSelected ? `2px solid ${Colors.blue}` : `1px solid ${Colors.lightGray}`}
              background={isSelected ? Colors.veryLightBlue3 : Colors.white}
              padding="16px"
              borderRadius="8px"
              margin="0 0 12px 0"
              cursor="pointer"
              onClick={() => {
                setLocalSelected(option.id);
                setSelectedPlan && setSelectedPlan(option.id);
              }}
            >
              <Div display="block" width="100%">
                {option.recomended && (
                  <Paragraph
                    fontSize="12px"
                    fontWeight="700"
                    color={option.recommended_color?.startsWith("#") ? option.recommended_color : Colors[option.recommended_color?.toLowerCase()] || Colors.green}
                    margin="0 0 4px 0"
                    textAlign="left"
                  >
                    {option.recomended}
                  </Paragraph>
                )}
                <Paragraph fontWeight="700" color={Colors.black} margin="0 0 6px 0" textAlign="left">
                  {option.title}
                </Paragraph>
                <Paragraph color={Colors.darkGray} fontSize="14px" textAlign="left">
                  {option.description}
                </Paragraph>
              </Div>
            </Div>
          );
        })}
      </Div>
    </Div>
  );
};

// Keep the original mobile card implementation for MobileFinancialDropdown
const FinancialOptionsCard = ({ info, selectedPlan, session, setSession, availablePlans }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Build options list from available plans (YAML-driven)
  const paymentOptions = (availablePlans || []).map((plan) => ({
    id: plan.slug,
    title: plan.scholarship,
    description: plan.payment_time,
    details: plan.warning_message,
    price: plan.price,
    originalPrice: plan.original_price,
    icons: plan.icons,
    recomended: plan.recomended,
    recommended_color: plan.recommended_color,
    bullets: plan.bullets,
  }));

  // Get currently selected option or default to first one
  const currentOption = paymentOptions.find(opt => opt.id === selectedOption) || paymentOptions[0];

  return (
    <Div
      background={Colors.white}
      border="1px solid #E5E5E5"
      borderRadius="12px"
      padding="24px"
      maxWidth="600px"
      width="100%"
      display="block"
      boxShadow="0 2px 8px rgba(0,0,0,0.1)"
    >
      <Div display="block" margin="0 0 24px 0">
        <H3 fontSize="18px" fontWeight="600" color={Colors.black} margin="0 0 8px 0" textAlign="center">
          {"Explore financial options"}
        </H3>

        <Div alignItems="center" justifyContent="center" margin="0 0 16px 0">
          <H2 fontSize="32px" fontWeight="700" color={Colors.blue} margin="0 8px 0 0">{currentOption?.price || ""}</H2>
          <Paragraph fontSize="16px" color={Colors.black} margin="0">{currentOption?.description || ""}</Paragraph>
        </Div>

        <Paragraph fontSize="14px" color="#666666" textAlign="center" margin="0 0 16px 0">
          {"Invest in your future, stress-free"}
        </Paragraph>

        {currentOption?.originalPrice && (
          <Paragraph color="#B4B4B4" margin="0 0 8px 0" textAlign="center">
            <s>{currentOption.originalPrice}</s>
          </Paragraph>
        )}
        {currentOption?.warning_message && (
          <Paragraph color={Colors.darkGray} fontSize="12px" opacity="1" textAlign="center" margin="0 0 16px 0">
            {currentOption.warning_message}
          </Paragraph>
        )}
      </Div>

      <Div display="block" margin="0 0 24px 0">
        <Paragraph fontSize="14px" fontWeight="600" color={Colors.black} margin="0 0 12px 0">
          {"Other payment options"}
        </Paragraph>

        {paymentOptions.map((option) => (
          <PaymentOptionCard
            key={option.id}
            option={option}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        ))}
      </Div>

      <Div display="block" justifyContent="center" alignItems="center">
        <Paragraph fontSize="12px" color="#666666" textAlign="center" margin="0 0 16px 0">
          {"Book a call with an advisor to find a payment option or special offer that works for you!"}
        </Paragraph>

        <Div gap="12px" justifyContent="center" flexWrap="wrap" display="block">
          <Link to={`${info?.apply_button?.link}${selectedPlan ? `?utm_plan=${selectedPlan}` : ""}`}>
            <Button
              variant="full"
              background={Colors.blue}
              textColor={Colors.white}
              fontSize="14px"
              padding="12px 24px"
              borderRadius="6px"
              fontWeight="600"
              onClick={() => {
                if (selectedPlan) {
                  setSession({ ...session, utm: { ...session.utm, utm_plan: selectedPlan } });
                }
              }}
            >
              {"Book a call →"}
            </Button>
          </Link>

          <Button
            background="transparent"
            textColor={Colors.blue}
            fontSize="14px"
            padding="12px 24px"
            borderRadius="6px"
            fontWeight="600"
          >
            {"More details"}
          </Button>
        </Div>
      </Div>
    </Div>
  );
};




const PricesAndPayment = (props) => {
  const data = useStaticQuery(graphql`
    query PricesAndPayment {
      content: allPricesAndPaymentYaml {
        edges {
          node {
            fields {
              lang
            }
            pricing_error_contact
            pricing_error
            get_notified
            contact_carrer_advisor
            contact_link
            we_accept
            top_label
            top_label_2
            plans_title
            plan_details
            select
            select_2
            job_guarantee {
              title
              description
            }
            recomended
            not_available
            not_available_job_guarantee
            apply_button {
              label
              link
            }

            button {
              button_text
              button_link
            }
          }
        }
      }
      allPlansYaml {
        edges {
          node {
            full_time {
              slug
              academies
              recomended
              recommended_color
              scholarship
              payment_time
              price
              original_price
              warning_message
              offer
              bullets
              icons
            }
            part_time {
              slug
              academies
              recomended
              recommended_color
              scholarship
              payment_time
              price
              original_price
              warning_message
              offer
              bullets
              icons
            }
            fields {
              lang
              file_name
            }
          }
        }
      }
    }
  `);
  let info = data.content.edges.find(
    ({ node }) => node.fields.lang === props.lang
  );
  if (info) info = info.node;

  function phoneNumberClean(phoneNumber) {
    if (phoneNumber) {
      const arr = phoneNumber.split("");
      const numberClean = arr.filter((elem) => elem.match(/[0-9]/));
      return numberClean.join("");
    }
    return phoneNumber;
  }

  const mainContainer = useRef(null);
  const { session, setSession } = useContext(SessionContext);
  const [currentLocation, setCurrentLocation] = useState(false);
  const [course, setCourse] = useState(false);
  const [buttonText, setButtonText] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [jobGuarantee, setJobGuarantee] = useState(false);
  const [schedule, setSchedule] = useState("part_time");
  const [availablePlans, setAvailablePlans] = useState([]);
  const [courseArrayFiltered, setCourseArrayFiltered] = useState([]);

  const getCurrentPlans = () => {
    let _plans = data.allPlansYaml.edges
      .filter(({ node }) => node.fields.lang === props.lang)
      .find((p) =>
        p.node.fields.file_name.includes(
          course ? course.value?.replaceAll("_", "-") : props.defaultCourse
        )
      );

    if (_plans) _plans = _plans.node[schedule];
    else _plans = [];

    return _plans;
  };

  const programs = !Array.isArray(props.programs)
    ? []
    : props.programs
        .filter(
          ({ node }) =>
            !["unlisted", "hidden"].includes(node.meta_info.visibility) &&
            node.meta_info.show_in_apply
        )
        .map(({ node }) => ({
          label: node.apply_form.label,
          value: node.meta_info.bc_slug,
        }));

  const getAvailablePlans = () => {
    const currentPlans = getCurrentPlans();

    if (currentPlans && currentLocation) {
      return currentPlans
        .filter((plan) =>
          plan.academies.includes(currentLocation.fields.file_name.slice(0, -3))
        )
        .filter((plan) => {
          if (jobGuarantee) {
            if (plan.price) return true;
            return false;
          }
          return true;
        });
    }
    return [];
  };

  useEffect(() => {
    if (isWindow) {
      if (window.location.hash.includes("prices_and_payment")) {
        window.scrollTo({
          top: mainContainer.current?.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [mainContainer.current]);

  useEffect(() => {
    setLocations(
      props.locations
        .filter(
          (l) =>
            (l.node.meta_info.visibility !== undefined ||
              l.node.meta_info.visibility === "visible") &&
            !l.node.meta_info.slug.includes("online")
        )
        .sort((a, b) => (a.node.name > b.node.name ? 1 : -1))
    );
    if (session && session.location) {
      const _loc = props.locations.find(
        (l) =>
          l.node.active_campaign_location_slug ===
          session.location.active_campaign_location_slug
      );
      setCurrentLocation(_loc ? _loc.node : null);
    }
  }, [session, props.locations]);

  // sync property course
  useEffect(() => {
    setCourse(programs.find((c) => c.value === props.defaultCourse));
    setSchedule(props.defaultSchedule || "part_time");
  }, [props.defaultCourse, props.defaultSchedule]);

  useEffect(() => {
    setJobGuarantee(false);
  }, [currentLocation]);

  useEffect(() => {
    const filteredPlans = getAvailablePlans();
    setAvailablePlans(filteredPlans);
    setSelectedPlan(filteredPlans[0]?.slug);
  }, [jobGuarantee, currentLocation, course]);

  const city = session && session.location ? session.location.city : [];

  const findCity = props.locations.find((loc) => loc.node?.city === city);
  useEffect(() => {
    if (findCity !== undefined && findCity.node) {
      setButtonText(findCity.node.button?.apply_button_text);
    }
  }, [findCity]);

  const selected = availablePlans.find((plan) => plan.slug === selectedPlan);

  //shows the available plans according to the selected location
  useEffect(() => {
    const courseFilteredAux = [];

    if (currentLocation) {
      programs.map((course) => {
        let currentPlans = data.allPlansYaml.edges
          .filter(({ node }) => node.fields.lang === props.lang)
          .find((p) =>
            p.node.fields.file_name.includes(
              course?.value?.replaceAll("_", "-")
            )
          );

        currentPlans = currentPlans?.node[schedule];

        const availablePlans = currentPlans?.filter((plan) =>
          plan.academies.includes(currentLocation.fields.file_name.slice(0, -3))
        );

        if (availablePlans && availablePlans.length > 0) {
          courseFilteredAux.push(course);
        }
      });
      setCourseArrayFiltered(courseFilteredAux);
    }
  }, [currentLocation]);

  return (
    <Div
      ref={mainContainer}
      id="prices_and_payment"
      display="block"
      background={props.background}
      github="/location"
      flexDirection="column"
      padding="50px 17px"
      padding_xxs="20px"
      padding_tablet="70px 40px"
      padding_md="70px 80px"
      padding_lg="70px 0px"
      maxWidth_md="1280px"
      margin="0 auto"
    >
      <H2
        fontSize="21px"
        fontSize_md="35px"
        fontWeight="400"
        lineHeight="46px"
        textAlign="center"
        width="100%"
        margin="0 0 20px 0"
      >
        {info?.plans_title}
      </H2>
      <Grid
        gridTemplateColumns_lg={
          props.financial ? "repeat(26,1fr)" : "repeat(23,1fr)"
        }
        gridTemplateColumns_md="1fr repeat(14,1fr) 1fr"
        gridTemplateColumns_tablet={
          props.financial ? "1fr repeat(14,1fr) 1fr" : "1fr repeat(13,1fr) 1fr"
        }
        gridGap="8px"
        margin_tablet="20px 0 0 0"
      >
        <Div
          gridColumn_md="1/9"
          gridColumn_lg={props.financial ? "2/14" : "1/16"}
          gridColumn_tablet={props.financial ? "1/9" : "1/10"}
          alignItems="center"
        >
          <H3
            fontSize="16px"
            fontSize_md="24px"
            lineHeight="26px"
            fontWeight="400"
            textAlign_tablet="start"
            textAlign_xs="center"
            opacity="1"
            color={Colors.black}
            padding="0 0 16px 0"
          >
            {props.financial ? info.select_2 : info.select}
          </H3>
        </Div>
        {/* SELECT COUNTRY */}
        <Div
          gridColumn_lg={props.financial ? "14/26" : "16/25"}
          gridColumn_md={props.financial ? "9/16" : "10/16"}
          gridColumn_tablet={props.financial ? "9/16" : "10/15"}
          justifyContent_xxs="center"
          justifyContent_tablet="start"
        >
          <Div
            flexDirection_tablet="row"
            flexDirection="column"
            alignItems="center"
            width="100%"
          >
            <Div
              flexDirection_tablet="row"
              flexDirection="column"
              width_tablet="100%"
              gap="20px"
              // width_md="320px"
              width_xs="320px"
              width_xxs="280px"
            >
              <SelectRaw
                placeholderFloat
                bgColor={Colors.white}
                single={props.financial ? false : true}
                options={locations.map((l) => ({
                  label: l.node.name,
                  value: l.node.active_campaign_location_slug,
                }))}
                placeholder={info.top_label}
                value={{
                  label: currentLocation?.name,
                  value: currentLocation?.active_campaign_location_slug,
                }}
                onChange={(opt) => {
                  const current = locations.find(
                    (l) => l.node.active_campaign_location_slug === opt.value
                  ).node;
                  setCurrentLocation(current);
                }}
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
                    borderRadius: "0",
                    marginBottom: "0px",
                    marginTop: "0px",
                    width: "100%",
                    fontSize: "15px",
                    fontWeight: "400",
                    fontStyle: "italic",
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
              />
              {props.financial && (
                <SelectRaw
                  placeholderFloat
                  bgColor={Colors.white}
                  single={props.financial ? false : true}
                  options={currentLocation && courseArrayFiltered}
                  placeholder={info.top_label_2}
                  value={course}
                  onChange={(opt) => setCourse(opt)}
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
                      borderRadius: "0",
                      marginBottom: "0px",
                      marginTop: "0px",
                      width: "100%",
                      fontSize: "15px",
                      fontWeight: "400",
                      fontStyle: "italic",
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
                />
              )}
            </Div>
          </Div>
        </Div>
      </Grid>
      {/* Financial explainer card (desktop/tablet) */}
      <FinancialOptionsDesktop
        info={info}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        jobGuarantee={jobGuarantee}
        setJobGuarantee={setJobGuarantee}
        session={session}
        setSession={setSession}
        availablePlans={availablePlans}
      />
      {/* Financial explainer card (mobile) */}
      <Div display_tablet="none" width="100%" margin="20px 0">
        <FinancialOptionsCard
          info={info}
          selectedPlan={selectedPlan}
          session={session}
          setSession={setSession}
          availablePlans={availablePlans}
        />
      </Div>

      {availablePlans && availablePlans.length === 0 && (
        <Div
          margin_xs="20px 15px"
          margin_tablet="30px 60px"
          margin_lg="60px 0"
          fontSize="25px"
          display="block"
          textAlign="center"
          dangerouslySetInnerHTML={{
            __html: jobGuarantee
              ? info.not_available_job_guarantee
              : info.not_available,
          }}
        />
      )}

      <GridContainer
        columns_tablet="12"
        gridGap="0"
        margin_tablet="55px 0 37px 0"
      >
        <Div
          gridArea_tablet="1/5/1/9"
          justifyContent="center"
          alignItems="center"
        >
          <H4
            fontSize="13px"
            lineHeight="22px"
            width="fit-content"
            color={Colors.darkGray}
          >
            {info.we_accept}{" "}
          </H4>
          <RoundImage
            url="/images/bitcoin.png"
            height="10px"
            width="65px"
            bsize="contain"
            margin="0 15px"
          />
          <RoundImage
            url="/images/ethereum.png"
            height="20px"
            width="65px"
            bsize="contain"
          />
        </Div>
      </GridContainer>
      <Paragraph margin_xxs="15px 0" margin_tablet="0 0 0 0">
        {info.get_notified + " "}
        <Link
          to={
            session && session?.location && session?.location.phone
              ? `https://wa.me/${phoneNumberClean(session?.location?.phone)}`
              : session?.email
              ? `mailto:${session?.email}`
              : `${info?.contact_link}`
          }
        >
          {info.contact_carrer_advisor}
        </Link>
      </Paragraph>
    </Div>
  );
};
export default PricesAndPayment;

