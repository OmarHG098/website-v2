import React from "react";
import { SessionContext } from "../session";
import DoubleActionCTA from "../components/DoubleActionCTA";

const PageWrapper = ({ children, pageContext, doubleActionCTA }) => {
  const { session } = React.useContext(SessionContext);

  const isLandingPage =
    pageContext?.pagePath?.includes("/landing/") ||
    pageContext?.type === "landing";

  return (
    <>
      {children}
      {!isLandingPage && (
        <DoubleActionCTA
          session={session}
          location={session?.location}
          ctaData={doubleActionCTA}
        />
      )}
    </>
  );
};

export default PageWrapper;
