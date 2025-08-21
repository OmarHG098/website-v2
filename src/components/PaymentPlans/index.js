import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Div } from "../Sections";
import { H2, H3, H4, Paragraph } from "../Heading";
import { Colors } from "../Styling";
import Icon from "../Icon";
import SmartSelect from "../Select";

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
              providers
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
      <H2 type="h2" textAlign="left" color={Colors.black}>
        {plans.title}
      </H2>
      {plans.sub_title && (
        <Paragraph textAlign="left" color={Colors.black} fontSize="18px">
          {plans.sub_title}
        </Paragraph>
      )}

      {/* Desktop/Tablet selector */}
      <Div display="none" display_md="flex" flexDirection="column" gap="20px">
        <Div maxWidth="420px">
          <SmartSelect
            topLabel="Payment option"
            openLabel={selected ? selected.title : "Select"}
            closeLabel={selected ? selected.title : "Select"}
            options={optionsForSelect}
            onSelect={(item) => setSelected(item.raw)}
            width="100%"
          />
        </Div>
        {selected && (
          <Div border={`1px solid ${Colors.black}`} borderLeft={`6px solid ${Colors.black}`} padding="20px" gap="10px" flexDirection="column">
            <H3 textAlign="left">{selected.title}</H3>
            <Paragraph textAlign="left">{selected.description}</Paragraph>
            {Array.isArray(selected.providers) && selected.providers.length > 0 && (
              <Div flexWrap="wrap" gap="10px 12px">
                {selected.providers.map((p) => (
                  <Div key={p} border={`1px solid ${Colors.gray}`} padding="6px 10px" width="fit-content">
                    <H4 margin="0" fontSize="14px">{p}</H4>
                  </Div>
                ))}
              </Div>
            )}
          </Div>
        )}
      </Div>

      {/* Mobile accordion */}
      <Div display_md="none" flexDirection="column" gap="10px" margin="10px 0 0 0">
        {plans.options.map((item, index) => {
          const isOpen = selected && selected.id === item.id;
          return (
            <Div
              key={item.id}
              width="100%"
              height={isOpen ? "auto" : "76px"}
              padding_xs="10px 20px"
              border={`1px solid ${Colors.black}`}
              borderLeft={`6px solid ${Colors.black}`}
              cursor="pointer"
              onClick={() => setSelected(isOpen ? null : item)}
              justifyContent="between"
              flexDirection={isOpen && "column"}
              style={{ position: "relative" }}
            >
              <Div display="flex" flexDirection="column" alignItems="flex-start">
                <H3 textAlign="left">{item.title}</H3>
                <Paragraph textAlign="left" margin="0">
                  {isOpen ? "" : item.description}
                </Paragraph>
              </Div>
              <Div style={{ position: "absolute", right: "13px", top: "15px" }} transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}>
                <Icon icon="arrowdown" width="32px" height="32px" />
              </Div>
              {isOpen && (
                <Div flexDirection="column" margin="10px 0 0 0" gap="10px">
                  <Paragraph textAlign="left">{item.description}</Paragraph>
                  {Array.isArray(item.providers) && item.providers.length > 0 && (
                    <Div flexWrap="wrap" gap="10px 12px">
                      {item.providers.map((p) => (
                        <Div key={p} border={`1px solid ${Colors.gray}`} padding="6px 10px" width="fit-content">
                          <H4 margin="0" fontSize="14px">{p}</H4>
                        </Div>
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


