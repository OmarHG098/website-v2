## PricesAndPayment: Technical Overview

### Purpose

- **What it does**: Renders the pricing and payment options section, including plan selection by location (and optionally program), a set of pricing cards, plan details, and an apply CTA. It also shows accepted payment methods and a chart-style statistics section.
- **Role in app**: Embedded in course/program pages (e.g., coding bootcamp template) to let users explore available plans per location/program and proceed to application with proper attribution of selected plan.

### Technology stack

- **Framework**: Gatsby (React-based)
- **Data**: Gatsby GraphQL + YAML content files (`allPricesAndPaymentYaml`, `allPlansYaml`)
- **Styling**: Custom styling system built on `styled-components` via the shared `Styling` and `Sections` component modules. Styles are imported from those modules, not inline CSS files.

### Structure

- **File**: `src/components/PricesAndPayment/index.js`
- **Top-level component**: `PricesAndPayment`
- **Subcomponents**:
  - **PricingCard**: Displays an individual plan with price, offer, badges, bullets (mobile), and a Select/Check indicator when chosen. Emits selection via `setSelectedPlan`.
  - **ChartSection**: Displays a chart-like summary using a static SVG `Icon` plus statistic cards sourced from either location-specific data or the general component YAML.

#### Representative imports

```javascript
import React, { useState, useContext, useEffect, useRef } from "react";
import { useStaticQuery, graphql } from "gatsby";
import Icon from "../Icon";
import Toggle from "../ToggleSwitch";
import { Link } from "../Styling/index";
import { GridContainer, Div, Grid } from "../Sections";
import Select, { SelectRaw } from "../Select";
import { H2, H3, H4, H5, Paragraph } from "../Heading";
import { Button, Colors, RoundImage, Img } from "../Styling";
import { SessionContext } from "../../session";
import { isWindow } from "../../utils/utils";
```

### Data flow

- **Static queries**: The component executes a `useStaticQuery` GraphQL query for:
  - `allPricesAndPaymentYaml` (UI copy, labels, button link/label, messages, chart data)
  - `allPlansYaml` (plans by schedule: `full_time` / `part_time` with `slug`, `price`, `original_price`, `offer`, `warning_message`, `scholarship`, `payment_time`, `icons`, `bullets`, `academies`)

```javascript
const data = useStaticQuery(graphql`
  query PricesAndPayment {
    content: allPricesAndPaymentYaml { ... }
    allPlansYaml { ... }
  }
`);
```

- **Props expected**:
  - `lang`: language key to filter YAML nodes
  - `locations`: `allLocationYaml.edges` (list of locations to populate the selector and filter plans)
  - `defaultCourse`: bc_slug of the course/program used to resolve initial plans
  - `defaultSchedule` (optional): initial schedule, defaults to `part_time`
  - `background`, `financial` (toggles additional program select), `type`, `title`, `paragraph` (template-driven)

- **Context**: `SessionContext` for current session (city/phone/email, UTM). Used to:
  - Pre-select location from session
  - Customize button label from location data
  - Append `utm_plan` when applying

- **Internal state**:
  - `currentLocation`, `course`, `schedule`
  - `availablePlans`, `selectedPlan`, `jobGuarantee`
  - `locations` (normalized/filtered from props)
  - `buttonText` (derived from selected city’s location data)

- **Derivations/filters**:
  - `getCurrentPlans()` finds plans for selected `course` (or `defaultCourse`) and `schedule` by `file_name` match
  - `getAvailablePlans()` filters current plans by `currentLocation`’s `fields.file_name` and `jobGuarantee` flag, then sorts by `recomended`

```javascript
const getCurrentPlans = () => {
  let _plans = data.allPlansYaml.edges
    .filter(({ node }) => node.fields.lang === props.lang)
    .find((p) => p.node.fields.file_name.includes(
      course ? course.value?.replaceAll("_", "-") : props.defaultCourse
    ));
  return _plans ? _plans.node[schedule] : [];
};
```

### Logic

- **Initialization**:
  - Pre-select location from session (if available)
  - Set `course` from `defaultCourse` and `schedule` from `defaultSchedule`
  - Reset `jobGuarantee` on location changes

- **Reactive updates**:
  - On `jobGuarantee`, `currentLocation`, `course` change: compute `availablePlans` and set default `selectedPlan`
  - On `currentLocation` change: compute `courseArrayFiltered` ensuring only programs with available plans at the location are shown when `financial` is enabled
  - Scroll to component if `window.location.hash` contains `prices_and_payment`

- **Event handling**:
  - Selecting a location/program via `SelectRaw` updates `currentLocation`/`course`
  - Clicking a `PricingCard` sets `selectedPlan`
  - Clicking the CTA persists `utm_plan` to session

- **Conditional rendering**:
  - If `availablePlans` is empty: show a localized HTML message (`dangerouslySetInnerHTML`) guiding the user to apply or contact
  - On mobile: show bullets inline within selected card; on tablet/desktop: show bullets for `selected` plan in a side panel
  - Job Guarantee toggle block exists but is commented out

```javascript
{availablePlans && availablePlans.length === 0 ? (
  <Div dangerouslySetInnerHTML={{ __html: jobGuarantee ? info.not_available_job_guarantee : info.not_available }} />
) : (
  // Grid with bullets panel (tablet+) and cards container
)}
```

### Styling

- **Approach**: Uses shared design system components built on `styled-components`:
  - Layout: `GridContainer`, `Grid`, `Div`
  - Typography: `H2`, `H3`, `H4`, `H5`, `Paragraph`
  - UI: `Button`, `RoundImage`, `Img`, `Icon`, `Toggle`
  - Colors: `Colors` constant from `../Styling`
- **Responsive props**: Components accept breakpoint-suffixed props (e.g., `padding_md`, `gridColumn_tablet`, `display_xs`), handled internally by the styling system.
- **Selects**: `SelectRaw` receives a `style` prop (object) to customize control, option, input styles.

```javascript
<Div
  padding="50px 17px"
  padding_xxs="20px"
  padding_tablet="70px 40px"
  padding_md="70px 80px"
  padding_lg="70px 0px"
  maxWidth_md="1280px"
>
  <Grid
    gridTemplateColumns_lg={props.financial ? "repeat(26,1fr)" : "repeat(23,1fr)"}
    gridTemplateColumns_md="1fr repeat(14,1fr) 1fr"
    gridTemplateColumns_tablet={props.financial ? "1fr repeat(14,1fr) 1fr" : "1fr repeat(13,1fr) 1fr"}
  >
    {/* selectors and content */}
  </Grid>
</Div>
```

### Responsive behavior

- Breakpoint-driven props on `Div`, `Grid`, and headings control layout and alignment across sizes.
- Examples:
  - Bullets container is `display="none"` on mobile and `display_tablet="block"` on tablet+
  - Cards container uses `flexWrap`, `justifyContent_tablet="between"`, `justifyContent_xs="evenly"` to adapt distribution
  - Grid columns differ between `financial` and non-financial modes via `gridTemplateColumns_*` and `gridColumn_*` props

```javascript
<Div className="bullets-container" display="none" display_tablet="block" />
<Div className="cards-container" justifyContent_tablet="between" justifyContent_xs="evenly" />
```

### Dependencies

- React, Gatsby (`useStaticQuery`, `graphql`)
- `styled-components`-based design system (`../Styling`, `../Sections`, `../Heading`)
- `react-select` (likely wrapped by `SelectRaw`)
- Custom modules: `Icon`, `ToggleSwitch`, `SessionContext`, utilities `isWindow`

### Key snippets

#### GraphQL query and language-scoped copy

```javascript
const data = useStaticQuery(graphql`
  query PricesAndPayment {
    content: allPricesAndPaymentYaml { edges { node { fields { lang } ... } } }
    allPlansYaml { edges { node { full_time { ... } part_time { ... } fields { lang file_name } } } }
  }
`);
let info = data.content.edges.find(({ node }) => node.fields.lang === props.lang);
if (info) info = info.node;
```

#### Available plans resolution and selection

```javascript
useEffect(() => {
  const filteredPlans = getAvailablePlans();
  setAvailablePlans(filteredPlans);
  setSelectedPlan(filteredPlans[0]?.slug);
}, [jobGuarantee, currentLocation, course]);

const selected = availablePlans.find((plan) => plan.slug === selectedPlan);
```

#### CTA with UTM persistence

```javascript
<Link to={`${info.apply_button.link}${selectedPlan ? `?utm_plan=${selectedPlan}` : ""}`}>
  <Button onClick={() => {
    if (selectedPlan) {
      setSession({ ...session, utm: { ...session.utm, utm_plan: selectedPlan } });
    }
  }}>
    {buttonText || info.apply_button.label}
  </Button>
</Link>
```

### YAML content

- Copy and configuration come from:
  - `src/data/components/prices_and_payment/prices_and_payment.us.yml`
  - `src/data/components/prices_and_payment/prices_and_payment.es.yml`
- Plans data (per course and schedule) come from `allPlansYaml` nodes (files not shown here), with fields like `academies`, `price`, `original_price`, `offer`, `warning_message`, `bullets`, `icons`.

### Potential risks / limitations

- **Tight coupling to YAML schema**: Filters depend on `fields.file_name` patterns and `academies` matching `currentLocation.fields.file_name.slice(0, -3)`. Changes to naming conventions will break plan resolution.
- **Hardcoded style values**: Many numeric spacing/border values inline via props; cross-component design changes may require multiple updates.
- **Dangerous HTML**: Uses `dangerouslySetInnerHTML` for `not_available` messages and bullets; requires trusted content and can complicate translations.
- **Session side effects**: Clicking Apply mutates session UTM; be mindful in SSR/testing contexts.
- **Job Guarantee switch disabled**: Toggle UI is commented out; logic still considers `jobGuarantee` in filters. Revamp should confirm expected behavior and remove or re-enable consistently.
- **Window access**: Hash-scroll logic gated by `isWindow` but may still be brittle in server environments.
- **Implicit dependency on `props.locations` shape**: Expects `edges` with `node` containing `fields`, `button`, `meta_info`, etc.; ensure callers/templates provide consistent data.

### Where it is used

- Example: `src/templates/coding-bootcamp.js` renders `PricesAndPayment` with course-specific props and a background gradient.

```javascript
<Div id="prices_and_payment">
  <PricesAndPayment
    background={`linear-gradient(to bottom, ${Colors.white} 0%, ${Colors.white} 50%, ${Colors.lightYellow} 50%, ${Colors.lightYellow} 100%)`}
    type={pageContext.slug}
    lang={pageContext.lang}
    locations={data.allLocationYaml.edges}
    defaultCourse={defaultCourse}
    title={yml.prices.heading}
    paragraph={yml.prices.sub_heading}
  />
</Div>
```

### Notes for the revamp

- Consider moving data-fetching out of the component into the page-level GraphQL where possible to simplify testing and enable Suspense/data loading strategies.
- Consider isolating filtering and mapping logic into pure helpers or hooks.
- Unify responsive rules and spacing using tokens and variants to reduce inline numeric props.
- Revisit `jobGuarantee` behavior and remove dead/commented code.


