import { Helmet } from 'react-helmet-async';

/**
 * Component to mark pages that should NOT show ads
 * Use this on pages that are:
 * - Loading/processing states
 * - Redirect pages
 * - Alert/notification pages
 * - Authentication flows
 * 
 * This helps comply with AdSense policies about
 * "ads on screens without publisher content"
 */
const NoAdsPage = ({ children, reason = "processing" }) => {
  return (
    <>
      <Helmet>
        {/* Tell ad networks not to serve ads on this page */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        {/* AdSense specific - indicate no ad serving */}
        <meta name="adsense-page-exclude" content="true" />
        {/* Custom data attribute for ad scripts to check */}
        <meta name="ad-eligible" content="false" />
        <meta name="page-type" content={reason} />
      </Helmet>
      {children}
    </>
  );
};

export default NoAdsPage;
