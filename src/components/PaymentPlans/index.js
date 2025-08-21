import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Div } from "../Sections";
import { H2, H3, Paragraph } from "../Heading";
import { Colors } from "../Styling";
import Icon from "../Icon";


const PaymentPlans = (props) => {
  const data = useStaticQuery(graphql`
    query PaymentPlansQuery {
      allPaymentPlansYaml {
        edges {
          node {
            fields {
              lang
            }
            title
            sub_title
            options {
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
        }
      }
    }
  `);

  const lang = props.lang || "us";
  let plans = data.allPaymentPlansYaml.edges.find(
    ({ node }) => node.fields.lang === lang
  );
  if (plans) plans = plans.node;
  if (!plans) return null;

  const [selected, setSelected] = React.useState(
    plans.options && plans.options.length > 0 ? plans.options[0] : null
  );

  const optionsForSelect = (plans.options || []).map((opt) => ({
    value: opt.id,
    label: opt.title,
    raw: opt,
  }));

  return (
    <Div
      maxWidth="1280px"
      margin="0 auto"
      padding="20px"
      padding_tablet="40px 60px"
      padding_lg="40px 0"
      gap="20px"
      flexDirection="column"
    >
      <H2 type="h2" textAlign="center" color={Colors.black}>
        {plans.title}
      </H2>
      {plans.sub_title && (
        <Paragraph textAlign="center" color={Colors.black} fontSize="18px">
          {plans.sub_title}
        </Paragraph>
      )}

      {/* Unified accordion for all screen sizes */}
      <Div flexDirection="column" gap="10px" margin="10px 0 0 0">
        {plans.options.map((item, index) => {
          const isOpen = selected && selected.id === item.id;
          return (
            <Div
              key={item.id}
              width="100%"
              height={isOpen ? "auto" : "76px"}
              padding_xs="10px 20px"
              border="1px solid #EBEBEB"
              borderLeft={`6px solid ${[Colors.blue]}`}
              cursor="pointer"
              onClick={() => setSelected(isOpen ? null : item)}
              justifyContent="between"
              flexDirection={isOpen && "column"}
              style={{ position: "relative" }}
            >
              <Div display="flex" flexDirection="column" alignItems="flex-start">
                <H3 textAlign="left">{item.title}</H3>
              </Div>
              <Div style={{ position: "absolute", right: "13px", top: "15px" }} transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}>
                <Icon icon="arrowdown" width="32px" height="32px" />
              </Div>
              {isOpen && (
                <Div flexDirection="column" margin="10px 0 0 0" gap="10px">
                  <Paragraph textAlign="left">{item.description}</Paragraph>
                  {item.bullets?.items && item.bullets.items.length > 0 && (
                    <Div flexDirection="column" gap="8px">
                      {item.bullets.items.map((bullet, index) => (
                        <Paragraph 
                          key={index} 
                          textAlign="left" 
                          margin="0"
                          style={{ display: "flex", alignItems: "flex-start" }}
                        >
                          <span style={{ marginRight: "8px" }}>•</span>
                          {bullet.text}
                        </Paragraph>
                      ))}
                    </Div>
                  )}
                </Div>
              )}
            </Div>
          );
        })}
      </Div>
    </Div>
  );
};

export default PaymentPlans;


