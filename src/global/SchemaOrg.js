import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Helmet } from "react-helmet";

const SchemaOrg = ({
  author,
  canonicalUrl,
  datePublished,
  description,
  image,
  type,
  organization,
  title,
  url,
  seoTitle,
  context,
  wordCount = 0,
}) => {
  const dataQuery = useStaticQuery(graphql`
    {
      allFaqYaml {
        edges {
          node {
            faq {
              topic
              slug
              questions {
                locations
                question
                answer
                templates
                priority
              }
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
            meta_info {
              title
              description
              slug
              duration
            }
            fields {
              lang
            }
          }
        }
      }
    }
  `);

  // Helper functions to mirror FaqCard filtering logic
  const filterByLocation = (question, locationSlug) => {
    if (!locationSlug) return true;
    if (
      Array.isArray(question.locations) &&
      (question.locations.includes(locationSlug) ||
        question.locations.includes("all"))
    )
      return true;
    return false;
  };

  const filterByTemplate = (question, template) => {
    if (!template) return true;
    return (
      Array.isArray(question.templates) && question.templates.includes(template)
    );
  };

  const filterByPriority = (question, minPriority) => {
    if (!minPriority) return true;
    if (question.priority && question.priority >= minPriority) return true;
    return false;
  };

  const filterByTopic = (topic, topicSlug) => {
    if (!topicSlug) return true;
    return topic.slug === topicSlug;
  };

  // Get FAQs for the current language
  const faqsData =
    dataQuery.allFaqYaml.edges.find(
      ({ node }) => node.fields.lang === context.lang
    )?.node.faq || [];

  // Build a set of available topic slugs to validate requested topics
  const availableTopicSlugs = new Set(faqsData.map((t) => t.slug));

  // Derive current location from context.locations (same as SEO/Layout)
  const currentLocation = Array.isArray(context?.locations)
    ? context.locations.find(
        ({ node }) =>
          node?.fields?.file_name === context.file_name ||
          node?.meta_info?.slug === context.slug
      )
    : null;
  const derivedLocationSlug = currentLocation?.node?.breathecode_location_slug;

  // Apply filtering logic based on page type and context
  const getFilteredFaqs = () => {
    let filteredTopics = [...faqsData];
    let locationSlug = null;
    let template = null;
    let minPriority = null;
    let topicSlug = null;

    // Determine filtering parameters based on page type
    if (context.defaultTemplate === "faq") {
      // FAQ pages: filter by template "faq" only; do not filter by location
      template = "faq";
    } else if (type === "location") {
      // Location pages: filter by location slug and priority; DO NOT filter by template
      locationSlug = derivedLocationSlug || null;
      minPriority = 1;
    } else if (type === "course") {
      // Course pages: no location filter by default; template may be explicitly provided via context.defaultTemplate
      // Leave locationSlug as null and template as null unless explicitly passed elsewhere
    }

    // Determine topicSlug only if explicitly provided or if inferred slug exists among topics
    if (context.topicSlug && availableTopicSlugs.has(context.topicSlug)) {
      topicSlug = context.topicSlug;
    } else if (context?.slug) {
      const inferredTopic = context.slug.replace(/-/g, "_");
      if (availableTopicSlugs.has(inferredTopic)) topicSlug = inferredTopic;
    }

    // Apply priority filtering if minPriority is provided in context
    if (context.minPriority) {
      minPriority = context.minPriority;
    }

    // Filter topics by topicSlug only when valid
    if (topicSlug) {
      filteredTopics = filteredTopics.filter(
        (topic) => topic.slug === topicSlug
      );
    }

    // Apply question-level filters to each topic
    filteredTopics.forEach((topic) => {
      if (Array.isArray(topic.questions)) {
        topic.questions = topic.questions
          .filter((question) => filterByLocation(question, locationSlug))
          .filter((question) => filterByTemplate(question, template))
          .filter((question) => filterByPriority(question, minPriority));
      } else {
        topic.questions = [];
      }
    });

    // Flatten the filtered questions for Schema.org FAQPage structure
    return filteredTopics.flatMap((topic) => topic.questions || []);
  };

  const filteredFaqs = getFilteredFaqs();

  const courses = dataQuery.allCourseYaml.edges
    .filter(({ node }) => node.fields.lang === context.lang)
    .map(({ node }) => ({
      "@type": "Course",
      name: node.meta_info.title,
      description: node.meta_info.description,
      url: `https://4geeksacademy.com/${context.lang}/coding-bootcamps/${node.meta_info.slug}`,
      timeRequired: node.meta_info.duration || "P16W",
      provider: {
        "@type": "EducationalOrganization",
        name: "4Geeks Academy",
        sameAs: "https://4geeksacademy.com/",
      },
      "@context": {
        jobGuarantee: "https://4geeksacademy.com/schema#jobGuarantee",
      },
      jobGuarantee: true,
    }));

  const baseSchema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url,
      name: title,
    },
  ];

  const educationalOrganizationSchema = {
    "@context": {
      "@vocab": "https://schema.org/",
      jobGuarantee: "https://4geeksacademy.com/schema#jobGuarantee",
    },
    "@type": "EducationalOrganization",
    name: "4Geeks Academy",
    description:
      "4Geeks Academy is a coding bootcamp that offers comprehensive programming education with a focus on practical skills and job placement.",
    url: "https://4geeksacademy.com",
    logo: "https://storage.googleapis.com/media-breathecode/b25a096eb14565c0c5e75d72442f888c17ac06fcfec7282747bf6c87baaf559c",
    sameAs: [
      "https://twitter.com/4GeeksAcademy",
      "https://www.instagram.com/4geeksacademy/",
      "https://www.facebook.com/4geeksacademy",
      "https://4geeksacademy.com/",
      "https://www.youtube.com/@4GeeksAcademy",
      "https://4geeksacademy.com/us/job-guarantee",
    ],
    jobGuarantee: true,
  };

  const page = [...baseSchema];
  const location = [...baseSchema];
  const blog = [
    ...baseSchema,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": url,
            name: title,
            image,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      url,
      name: title,
      headline: title,
      image: {
        "@type": "ImageObject",
        url: image,
      },
      description,
      author: {
        "@type": "Person",
        name: author,
      },
      publisher: {
        "@type": "Organization",
        url: organization.url,
        logo: organization.logo,
        name: organization.name,
      },
      mainEntityOfPage: {
        "@type": "WebSite",
        "@id": canonicalUrl,
      },
      datePublished,
      wordCount,
    },
  ];

  const faqSchema = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filteredFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  const schemaType = {
    page,
    location,
    landing: page,
    course: [
      ...baseSchema,
      {
        "@context": {
          "@vocab": "https://schema.org/",
          jobGuarantee: "https://4geeksacademy.com/schema#jobGuarantee",
        },
        "@type": "Course",
        name: seoTitle,
        description,
        provider: {
          "@type": "EducationalOrganization",
          name: "4Geeks Academy",
          sameAs: "https://4geeksacademy.com/",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `https://4geeksacademy.com/${context.lang}/coding-bootcamps/${context.slug}`,
        },
        timeRequired:
          context?.meta_info?.duration || context?.duration || "P16W",
        jobGuarantee: true,
        url: `https://4geeksacademy.com/${context.lang}/coding-bootcamps/${context.slug}`,
        image: {
          "@type": "ImageObject",
          url: image || "https://4geeksacademy.com/path/to/default-image.jpg", // Fallback
        },
      },
    ],
  };

  return (
    <Helmet>
      {/* Schema.org tags */}
      {type in schemaType && (
        <script type="application/ld+json">
          {JSON.stringify(schemaType[type])}
        </script>
      )}
      {(type === "post" || context.defaultTemplate === "landing_post") && (
        <script type="application/ld+json">{JSON.stringify(blog)}</script>
      )}
      {/* Always inject FAQPage JSON-LD when there are FAQs rendered on the page */}
      {filteredFaqs.length > 0 && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};

SchemaOrg.defaultProps = {
  title: null,
  description: null,
  image: null,
  twitterUsername: null,
  pathname: null,
  article: false,
  author: "",
};

export default React.memo(SchemaOrg);
