# Implementation Plan for Admissions Staff Component in Gatsby Project

This plan outlines the steps to add a new Admissions Staff component to the `thank-you` page at `https://4geeksacademy.com/us/thank-you` in a Gatsby project using Cursor AI as the code editor. The component will display "business card" style profiles for admissions staff, with details in English only but supporting bilingual data (English and Spanish) in a YML file for testing purposes. The plan leverages an existing similar component and ensures proper integration with GraphQL and the page template.

## Steps

### 1. Analyze Existing Component
- **Objective**: Identify a similar component in the project to use as a reference for structure, styling, and functionality.
- **Actions**:
  - Search the project for components rendering card-like layouts (e.g., team members, testimonials, or staff profiles).
  - Note the component’s file location, styling approach (CSS modules, styled-components, etc.), and data sourcing (YML, JSON, or GraphQL).
  - Document reusable elements like card layout, responsive design, and hover effects.
- **Expected Outcome**: A clear understanding of the reference component’s code and patterns to adapt for the new component.

### 2. Create YML Data File
- **Objective**: Set up a bilingual YML file to store admissions staff data in English and Spanish.
- **Actions**:
  - Create a new directory `/src/data/components/admissions`.
  - Create a file named `admissions-staff.yml` in the new directory.
  - Structure the YML file with two top-level keys: `en` (English) and `es` (Spanish).
  - For each language, include an array of staff objects with fields: `name`, `role`, `image` (path or URL), `phone`, and `email`.
  - Example structure:
    ```yaml
    en:
      staff:
        - name: John Doe
          role: Admissions Officer
          image: /images/john-doe.jpg
          phone: +1-555-123-4567
          email: john.doe@4geeksacademy.com
        - name: Jane Smith
          role: Senior Admissions Advisor
          image: /images/jane-smith.jpg
          phone: +1-555-987-6543
          email: jane.smith@4geeksacademy.com
    es:
      staff:
        - name: Juan Pérez
          role: Oficial de Admisiones
          image: /images/john-doe.jpg
          phone: +1-555-123-4567
          email: john.doe@4geeksacademy.com
        - name: Juana García
          role: Asesora Senior de Admisiones
          image: /images/jane-smith.jpg
          phone: +1-555-987-6543
          email: jane.smith@4geeksacademy.com
    ```
- **Notes**:
  - Ensure image paths are valid and accessible in the Gatsby project.
  - Spanish data is for testing only; the component will render English data on the live page.
- **Expected Outcome**: A properly formatted YML file with bilingual staff data.

### 3. Develop Admissions Staff Component
- **Objective**: Create a reusable component to render staff cards based on the reference component.
- **Actions**:
  - Create a new file `/src/components/AdmissionsStaff.js`.
  - Define a functional component that accepts a `staff` prop (array of staff objects).
  - Design the card layout:
    - Display staff image at the top.
    - Below the image, show `name` and `role`.
    - At the bottom, display `phone` and `email` (e.g., as clickable links for `tel:` and `mailto:`).
  - Reuse styling from the reference component (e.g., CSS modules or styled-components).
  - Ensure responsive design (e.g., grid or flexbox for multiple cards).
  - Example pseudo-code:
    ```jsx
    const AdmissionsStaff = ({ staff }) => (
      <div className="staff-container">
        {staff.map((member) => (
          <div key={member.email} className="staff-card">
            <img src={member.image} alt={member.name} />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <a href={`tel:${member.phone}`}>{member.phone}</a>
            <a href={`mailto:${member.email}`}>{member.email}</a>
          </div>
        ))}
      </div>
    );
    ```
- **Notes**:
  - Validate prop types using `prop-types` if used in the project.
  - Ensure accessibility (e.g., alt text for images, semantic HTML).
- **Expected Outcome**: A functional, styled component ready for integration.

### 4. Update GraphQL Query
- **Objective**: Ensure the `thank-you` page can access the YML data via GraphQL.
- **Actions**:
  - Open `/src/templates/thank-you.js` (or the relevant template file).
  - Check if the existing GraphQL query includes YML data (e.g., via `gatsby-source-filesystem` and `gatsby-transformer-yaml`).
  - If necessary, update the query to fetch `admissions-staff.yml` data.
  - Example GraphQL query addition:
    ```graphql
    query ThankYouPage {
      admissionsStaff: file(relativePath: { eq: "components/admissions/admissions-staff.yml" }) {
        childYaml {
          en {
            staff {
              name
              role
              image
              phone
              email
            }
          }
        }
      }
    }
    ```
  - Verify the query in the Gatsby GraphQL explorer (`localhost:8000/___graphql`).
- **Notes**:
  - If `gatsby-transformer-yaml` is not installed, add it to `gatsby-config.js`.
  - Only fetch the `en` data since the page renders in English.
- **Expected Outcome**: The `thank-you` page template has access to the staff data.

### 5. Integrate Component into Thank-You Page
- **Objective**: Render the `AdmissionsStaff` component on the `thank-you` page.
- **Actions**:
  - In `/src/templates/thank-you.js`, import the `AdmissionsStaff` component:
    ```jsx
    import AdmissionsStaff from '../components/AdmissionsStaff';
    ```
  - Pass the staff data from the GraphQL query to the component:
    ```jsx
    const ThankYouPage = ({ data }) => (
      <div>
        {/* Existing page content */}
        <AdmissionsStaff staff={data.admissionsStaff.childYaml.en.staff} />
      </div>
    );
    ```
  - Determine the placement of the component (e.g., below the main content or in a specific section).
- **Expected Outcome**: The staff cards render correctly on the `thank-you` page.

### 6. Test the Implementation
- **Objective**: Ensure the component works as expected and passes tests.
- **Actions**:
  - Run the Gatsby development server (`gatsby develop`).
  - Navigate to `http://localhost:8000/us/thank-you` and verify the component renders with English data.
  - Check responsiveness across devices (mobile, tablet, desktop).
  - Validate accessibility using tools like Lighthouse or axe.
  - Run project tests (`npm test` or equivalent) to ensure bilingual YML data is handled correctly.
  - Manually test Spanish data by temporarily modifying the component to use `es.staff` (for testing only).
- **Notes**:
  - Fix any GraphQL errors or styling issues during testing.
  - Ensure phone and email links are clickable and functional.
- **Expected Outcome**: A fully functional component with no errors and passing tests.

### 7. Review and Finalize
- **Objective**: Prepare the code for review and deployment.
- **Actions**:
  - Commit changes with clear messages (e.g., “Add AdmissionsStaff component to thank-you page”).
  - Push to a feature branch and create a pull request.
  - Document any deviations from the reference component or requirements.
  - Request feedback from the team via Cursor AI or the PR.
- **Expected Outcome**: Code is ready for review and deployment.

## Notes
- Cursor AI will provide context-aware suggestions based on the project’s codebase.
- Ensure consistency with the project’s coding standards (e.g., ESLint, Prettier).
- If the reference component uses a different data source (e.g., JSON), adapt the YML approach to fit the project’s conventions.
- Spanish data in the YML file is for testing only and should not be rendered on the live page.

## Next Steps
- Await feedback on this plan.
- Proceed with implementation or revise based on feedback.