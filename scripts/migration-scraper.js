#!/usr/bin/env node

/**
 * Migration URL Scraper
 * 
 * Extracts all pages from 4geeksacademy.com site including:
 * - YAML-based pages (pages, courses, locations, landings, jobs, downloadables, clusters)
 * - Blog posts from Breathecode API
 * - Google indexed pages from sitemap.xml
 * 
 * Generates:
 * - migration-tracker.md (human-readable checklist)
 * - migration-data.json (machine-readable data)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');
const glob = require('glob');

// Import Breathecode API utilities
const { getAllAssets } = require('../src/utils/api.js');

// ==============================================
// CONFIGURATION
// ==============================================
const CONFIG = {
  oldDomain: 'https://4geeksacademy.com',
  outputDir: process.cwd(),
  markdownFile: 'migration-tracker.md',
  jsonFile: 'migration-data.json',
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Log with timestamp
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Normalize URL for comparison
 */
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname.replace(/\/$/, '');
  } catch (e) {
    return url.replace(/\/$/, '');
  }
}

/**
 * Parse YAML file safely
 */
async function parseYamlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    log(`Error parsing ${filePath}: ${error.message}`, 'warn');
    return null;
  }
}

/**
 * Get language from filename
 */
function getLangFromFile(filename) {
  if (filename.endsWith('.us.yml') || filename.endsWith('.us.yaml')) return 'us';
  if (filename.endsWith('.es.yml') || filename.endsWith('.es.yaml')) return 'es';
  return 'unknown';
}

/**
 * Get slug from filename
 */
function getSlugFromFile(filename) {
  const base = path.basename(filename);
  return base.replace(/\.(us|es)\.(yml|yaml)$/, '');
}

/**
 * Construct URL based on type
 */
function constructUrl(type, lang, slug) {
  const langPrefix = lang === 'us' ? 'us' : 'es';
  
  switch (type) {
    case 'page':
      return `${CONFIG.oldDomain}/${langPrefix}/${slug}`;
    case 'course':
      return `${CONFIG.oldDomain}/${langPrefix}/coding-bootcamps/${slug}`;
    case 'location':
      return `${CONFIG.oldDomain}/${langPrefix}/coding-campus/${slug}`;
    case 'landing':
      return `${CONFIG.oldDomain}/${langPrefix}/landing/${slug}`;
    case 'job':
      return `${CONFIG.oldDomain}/${langPrefix}/job/${slug}`;
    case 'downloadable':
      return `${CONFIG.oldDomain}/${langPrefix}/downloadable/${slug}`;
    case 'cluster':
      return `${CONFIG.oldDomain}/${langPrefix}/blog/${slug}`;
    case 'blog':
      return `${CONFIG.oldDomain}/${langPrefix}/blog/${slug}`;
    default:
      return `${CONFIG.oldDomain}/${langPrefix}/${slug}`;
  }
}

// ==============================================
// YAML SCANNER FUNCTIONS
// ==============================================

/**
 * Scan YAML files of a specific type
 */
async function scanYamlType(pattern, type) {
  log(`Scanning ${type}...`);
  const items = [];
  const files = glob.sync(pattern, { cwd: process.cwd() });
  
  log(`Found ${files.length} ${type} files`);
  
  for (const file of files) {
    const data = await parseYamlFile(file);
    if (!data) continue;
    
    const lang = getLangFromFile(file);
    const slug = data.meta_info?.slug || getSlugFromFile(file);
    const currentUrl = constructUrl(type, lang, slug);
    
    items.push({
      type,
      file: file.replace(process.cwd() + '/', ''),
      slug,
      lang,
      currentUrl,
      newUrl: '', // To be filled manually
      visibility: data.meta_info?.visibility || 'visible',
      redirects: data.meta_info?.redirects || [],
      seo: {
        title: data.meta_info?.title || data.seo_title || '',
        description: data.meta_info?.description || '',
        keywords: data.meta_info?.keywords || '',
        image: data.meta_info?.image || ''
      },
      metadata: {
        template: data.meta_info?.template || data.fields?.defaultTemplate || '',
        duration: data.meta_info?.duration || '',
        job_guarantee: data.meta_info?.job_guarantee || false,
      },
      status: {
        copy: 'not_started',
        implementation: 'not_started',
        schema: 'not_started',
        pagespeed: 'not_started'
      },
      inSitemap: false, // Will be updated later
      priority: data.meta_info?.visibility === 'visible' ? 'high' : 'medium',
      notes: []
    });
  }
  
  return items;
}

/**
 * Scan all YAML-based content
 */
async function scanAllYamlContent() {
  log('Starting YAML content scan...', 'info');
  
  const pages = await scanYamlType('src/data/page/**/*.{yml,yaml}', 'page');
  const courses = await scanYamlType('src/data/course/**/*.{yml,yaml}', 'course');
  const locations = await scanYamlType('src/data/location/**/*.{yml,yaml}', 'location');
  const landings = await scanYamlType('src/data/landing/**/*.{yml,yaml}', 'landing');
  const jobs = await scanYamlType('src/data/job/**/*.{yml,yaml}', 'job');
  const downloadables = await scanYamlType('src/data/downloadable/**/*.{yml,yaml}', 'downloadable');
  const clusters = await scanYamlType('src/data/cluster/**/*.{yml,yaml}', 'cluster');
  
  const allItems = [
    ...pages,
    ...courses,
    ...locations,
    ...landings,
    ...jobs,
    ...downloadables,
    ...clusters
  ];
  
  // Set priority for courses with job guarantee
  allItems.forEach(item => {
    if (item.type === 'course' && item.metadata.job_guarantee) {
      item.priority = 'critical';
      item.notes.push('Has job guarantee');
    }
    if (item.visibility === 'hidden') {
      item.notes.push('Hidden from sitemap');
    }
    if (item.visibility === 'unlisted') {
      item.notes.push('Unlisted');
    }
    if (item.redirects.length > 0) {
      item.notes.push(`${item.redirects.length} redirects`);
    }
  });
  
  log(`Total YAML pages scanned: ${allItems.length}`, 'success');
  
  return allItems;
}

// ==============================================
// BLOG POST FETCHING
// ==============================================

/**
 * Fetch blog posts from Breathecode API
 */
async function fetchBlogPosts() {
  log('Fetching blog posts from Breathecode API...');
  
  try {
    const posts = await getAllAssets();
    
    if (!posts || posts.length === 0) {
      log('No blog posts returned from API', 'warn');
      return [];
    }
    
    log(`Found ${posts.length} blog posts from API`);
    
    const blogItems = posts.map(post => ({
      type: 'blog',
      file: 'External API (Breathecode)',
      slug: post.slug,
      lang: post.lang === 'en' ? 'us' : post.lang,
      currentUrl: constructUrl('blog', post.lang === 'en' ? 'us' : post.lang, post.slug),
      newUrl: '',
      visibility: post.visibility || 'visible',
      redirects: [],
      seo: {
        title: post.title || '',
        description: post.description || '',
        keywords: '',
        image: post.preview || ''
      },
      metadata: {
        author: post.authors_username || '',
        cluster: Array.isArray(post.clusters) && post.clusters.length > 0 ? post.clusters[0] : '',
        updated_at: post.updated_at || '',
        status: post.status || ''
      },
      status: {
        copy: 'not_started',
        implementation: 'not_started',
        schema: 'not_started',
        pagespeed: 'not_started'
      },
      inSitemap: false,
      priority: 'high',
      notes: ['From Breathecode API']
    }));
    
    log(`Processed ${blogItems.length} blog posts`, 'success');
    return blogItems;
    
  } catch (error) {
    log(`Error fetching blog posts: ${error.message}`, 'error');
    log('Continuing without blog posts...', 'warn');
    return [];
  }
}

// ==============================================
// SITEMAP FETCHING
// ==============================================

/**
 * Parse XML sitemap
 */
function parseSitemapXml(xmlString) {
  const urls = [];
  // Simple regex-based XML parsing for <loc> tags
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(xmlString)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Fetch sitemap URLs from sitemap.xml
 */
async function fetchSitemapUrls() {
  log('Fetching sitemap URLs...');
  
  try {
    // Fetch main sitemap index
    const mainSitemapUrl = `${CONFIG.oldDomain}/sitemap.xml`;
    log(`Fetching ${mainSitemapUrl}`);
    
    const mainResponse = await axios.get(mainSitemapUrl, { timeout: 10000 });
    const sitemapUrls = parseSitemapXml(mainResponse.data);
    
    log(`Found ${sitemapUrls.length} sub-sitemaps`);
    
    // Fetch all sub-sitemaps
    const allUrls = new Set();
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        log(`Fetching ${sitemapUrl}`);
        const response = await axios.get(sitemapUrl, { timeout: 10000 });
        const urls = parseSitemapXml(response.data);
        
        urls.forEach(url => allUrls.add(normalizeUrl(url)));
        log(`  Added ${urls.length} URLs`);
      } catch (error) {
        log(`  Error fetching ${sitemapUrl}: ${error.message}`, 'warn');
      }
    }
    
    log(`Total URLs in sitemap: ${allUrls.size}`, 'success');
    return Array.from(allUrls);
    
  } catch (error) {
    log(`Error fetching sitemap: ${error.message}`, 'error');
    log('Continuing without sitemap data...', 'warn');
    return [];
  }
}

// ==============================================
// COMPARISON AND MERGING
// ==============================================

/**
 * Compare internal pages with sitemap
 */
function compareWithSitemap(allPages, sitemapUrls) {
  log('Comparing pages with sitemap...');
  
  const sitemapSet = new Set(sitemapUrls.map(url => normalizeUrl(url)));
  const internalUrlSet = new Set();
  
  // Mark which pages are in sitemap
  allPages.forEach(page => {
    const normalizedUrl = normalizeUrl(page.currentUrl);
    internalUrlSet.add(normalizedUrl);
    
    if (sitemapSet.has(normalizedUrl)) {
      page.inSitemap = true;
    }
  });
  
  // Find orphaned URLs (in sitemap but not in our YAML files)
  const orphanedUrls = [];
  sitemapUrls.forEach(url => {
    const normalizedUrl = normalizeUrl(url);
    if (!internalUrlSet.has(normalizedUrl)) {
      orphanedUrls.push(url);
    }
  });
  
  const inSitemapCount = allPages.filter(p => p.inSitemap).length;
  log(`Pages in sitemap: ${inSitemapCount} / ${allPages.length}`, 'success');
  log(`Orphaned URLs (in sitemap, not in YAML): ${orphanedUrls.length}`, orphanedUrls.length > 0 ? 'warn' : 'success');
  
  return { allPages, orphanedUrls };
}

// ==============================================
// MARKDOWN GENERATION
// ==============================================

/**
 * Generate markdown tracker
 */
function generateMarkdown(allPages, orphanedUrls, summary) {
  log('Generating markdown tracker...');
  
  const groupedByType = {};
  allPages.forEach(page => {
    if (!groupedByType[page.type]) groupedByType[page.type] = [];
    groupedByType[page.type].push(page);
  });
  
  // Sort pages within each type
  Object.keys(groupedByType).forEach(type => {
    groupedByType[type].sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by URL
      return a.currentUrl.localeCompare(b.currentUrl);
    });
  });
  
  let md = `# 🚀 4Geeks Academy → 4Geeks.com Migration Tracker

**Generated:** ${new Date().toISOString().split('T')[0]} at ${new Date().toLocaleTimeString()}  
**Total Pages:** ${summary.total}  
**Visible Pages:** ${summary.visible}  
**Hidden/Unlisted Pages:** ${summary.hidden}  
**In Google Index (Sitemap):** ${summary.inSitemap}  
**Total Redirects to Handle:** ${summary.redirects}

---

## 📊 Migration Status Summary

| Status | Description | Count |
|--------|-------------|-------|
| ⬜ Not Started | No work done | ${summary.total} |
| 🔄 In Progress | Partially complete | 0 |
| ✅ Complete | Fully migrated & tested | 0 |

---

## 🎯 Status Legend

- **Copy Status:** Content migrated from old site to new
- **Implementation Status:** Page built in Next.js  
- **Schema Status:** Structured data (schema.org) implemented
- **PageSpeed Status:** Core Web Vitals optimized

Symbols: ⬜ (not started) | 🔄 (in progress) | ✅ (complete) | ❌ (failed/blocked)

---

`;

  // Type labels
  const typeLabels = {
    page: '📄 Static Pages',
    course: '🎓 Course Pages',
    location: '📍 Location Pages',
    landing: '🎯 Landing Pages',
    blog: '📝 Blog Posts',
    cluster: '🗂️ Blog Category Pages',
    job: '💼 Job Listings',
    downloadable: '📥 Downloadable Resources'
  };
  
  const typeOrder = ['page', 'course', 'location', 'landing', 'blog', 'cluster', 'job', 'downloadable'];
  
  // Generate sections for each type
  typeOrder.forEach(type => {
    if (!groupedByType[type] || groupedByType[type].length === 0) return;
    
    const pages = groupedByType[type];
    const visibleCount = pages.filter(p => p.visibility === 'visible').length;
    const inSitemapCount = pages.filter(p => p.inSitemap).length;
    
    md += `\n## ${typeLabels[type]} (${pages.length} total, ${visibleCount} visible, ${inSitemapCount} in sitemap)\n\n`;
    md += `| Priority | Current URL | Lang | Visibility | In Sitemap | SEO Title | Description | Copy | Impl | Schema | Speed | Notes |\n`;
    md += `|----------|-------------|------|------------|------------|-----------|-------------|------|------|--------|-------|-------|\n`;
    
    pages.forEach(page => {
      const priority = page.priority === 'critical' ? '🔥' : 
                      page.priority === 'high' ? '⭐' : 
                      page.priority === 'medium' ? '📌' : '📎';
      const urlShort = page.currentUrl.replace(CONFIG.oldDomain, '');
      const inSitemap = page.inSitemap ? '✅' : '❌';
      const title = (page.seo.title || '').substring(0, 50);
      const desc = (page.seo.description || '').substring(0, 50);
      const notes = page.notes.join(', ');
      
      md += `| ${priority} | ${urlShort} | ${page.lang} | ${page.visibility} | ${inSitemap} | ${title} | ${desc} | ⬜ | ⬜ | ⬜ | ⬜ | ${notes} |\n`;
    });
    
    // Add redirects section if any pages have redirects
    const pagesWithRedirects = pages.filter(p => p.redirects.length > 0);
    if (pagesWithRedirects.length > 0) {
      md += `\n### 🔀 Redirects for ${typeLabels[type]}\n\n`;
      pagesWithRedirects.forEach(page => {
        md += `**${page.currentUrl}** needs redirects from:\n`;
        page.redirects.forEach(redirect => {
          md += `- \`${redirect}\` → \`${page.currentUrl}\`\n`;
        });
        md += `\n`;
      });
    }
  });
  
  // Hidden pages section
  const hiddenPages = allPages.filter(p => p.visibility === 'hidden' || p.visibility === 'unlisted');
  if (hiddenPages.length > 0) {
    md += `\n---\n\n## ⚠️ Hidden/Unlisted Pages to Review (${hiddenPages.length})\n\n`;
    md += `These pages are not in the sitemap but exist in the codebase. Review if they should be migrated:\n\n`;
    md += `| Type | URL | Visibility | In Sitemap | Notes |\n`;
    md += `|------|-----|------------|------------|-------|\n`;
    hiddenPages.forEach(page => {
      md += `| ${page.type} | ${page.currentUrl} | ${page.visibility} | ${page.inSitemap ? '✅' : '❌'} | ${page.notes.join(', ')} |\n`;
    });
  }
  
  // Orphaned URLs section
  if (orphanedUrls.length > 0) {
    md += `\n---\n\n## 🔍 Orphaned URLs (${orphanedUrls.length})\n\n`;
    md += `These URLs are in the sitemap but not found in YAML files. They may be:\n`;
    md += `- Old pages that need redirects\n`;
    md += `- Dynamically generated pages\n`;
    md += `- Pages from other sources\n\n`;
    
    // Group orphaned URLs by pattern
    const orphanedByPattern = {};
    orphanedUrls.forEach(url => {
      const match = url.match(/4geeksacademy\.com\/(us|es)\/([^\/]+)/);
      const pattern = match ? match[2] : 'other';
      if (!orphanedByPattern[pattern]) orphanedByPattern[pattern] = [];
      orphanedByPattern[pattern].push(url);
    });
    
    Object.keys(orphanedByPattern).sort().forEach(pattern => {
      md += `### ${pattern} (${orphanedByPattern[pattern].length})\n\n`;
      orphanedByPattern[pattern].slice(0, 20).forEach(url => {
        md += `- ${url}\n`;
      });
      if (orphanedByPattern[pattern].length > 20) {
        md += `- ... and ${orphanedByPattern[pattern].length - 20} more\n`;
      }
      md += `\n`;
    });
  }
  
  // Notes section
  md += `\n---\n\n## 📝 Migration Notes\n\n`;
  md += `### URL Structure Recommendations\n\n`;
  md += `Update the "New URL" column in the JSON file with your preferred Next.js URL structure.\n\n`;
  md += `Suggested mappings:\n`;
  md += `- Pages: \`/us/{slug}\` → \`/{slug}\` or \`/es/{slug}\` → \`/es/{slug}\`\n`;
  md += `- Courses: \`/us/course/{slug}\` → \`/bootcamp/{slug}\`\n`;
  md += `- Locations: \`/us/location/{slug}\` → \`/campus/{slug}\`\n`;
  md += `- Blog: Keep same structure or modernize\n\n`;
  
  md += `### Schema.org Requirements\n\n`;
  md += `- **Courses:** CourseInstance or EducationalOccupationalProgram\n`;
  md += `- **Locations:** LocalBusiness + EducationalOrganization\n`;
  md += `- **Blog Posts:** BlogPosting or Article\n`;
  md += `- **Jobs:** JobPosting\n`;
  md += `- **Homepage:** Organization + WebSite\n\n`;
  
  md += `### Next Steps\n\n`;
  md += `1. Review hidden pages - decide which to migrate\n`;
  md += `2. Review orphaned URLs - create redirect strategy\n`;
  md += `3. Define new URL structure in migration-data.json\n`;
  md += `4. Prioritize by traffic/importance (use Google Analytics)\n`;
  md += `5. Start migration with critical priority pages\n`;
  md += `6. Update status as you progress\n`;
  
  return md;
}

// ==============================================
// JSON GENERATION
// ==============================================

/**
 * Generate JSON data file
 */
function generateJson(allPages, orphanedUrls, summary) {
  log('Generating JSON data file...');
  
  return {
    generated: new Date().toISOString(),
    summary,
    pages: allPages,
    orphanedUrls,
    metadata: {
      oldDomain: CONFIG.oldDomain,
      newDomain: 'https://4geeks.com', // To be confirmed
      totalRedirects: summary.redirects,
      pageTypes: {
        page: allPages.filter(p => p.type === 'page').length,
        course: allPages.filter(p => p.type === 'course').length,
        location: allPages.filter(p => p.type === 'location').length,
        landing: allPages.filter(p => p.type === 'landing').length,
        blog: allPages.filter(p => p.type === 'blog').length,
        cluster: allPages.filter(p => p.type === 'cluster').length,
        job: allPages.filter(p => p.type === 'job').length,
        downloadable: allPages.filter(p => p.type === 'downloadable').length,
      }
    }
  };
}

// ==============================================
// MAIN EXECUTION
// ==============================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 4GEEKS ACADEMY MIGRATION URL SCRAPER');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Scan YAML content
    const yamlPages = await scanAllYamlContent();
    
    // Step 2: Fetch blog posts
    const blogPosts = await fetchBlogPosts();
    
    // Step 3: Combine all pages
    const allPages = [...yamlPages, ...blogPosts];
    log(`Total pages collected: ${allPages.length}`, 'success');
    
    // Step 4: Fetch sitemap
    const sitemapUrls = await fetchSitemapUrls();
    
    // Step 5: Compare and merge
    const { allPages: updatedPages, orphanedUrls } = compareWithSitemap(allPages, sitemapUrls);
    
    // Step 6: Calculate summary
    const summary = {
      total: updatedPages.length,
      visible: updatedPages.filter(p => p.visibility === 'visible').length,
      hidden: updatedPages.filter(p => p.visibility === 'hidden' || p.visibility === 'unlisted').length,
      inSitemap: updatedPages.filter(p => p.inSitemap).length,
      redirects: updatedPages.reduce((sum, p) => sum + p.redirects.length, 0),
      orphaned: orphanedUrls.length
    };
    
    // Step 7: Generate markdown
    const markdown = generateMarkdown(updatedPages, orphanedUrls, summary);
    const markdownPath = path.join(CONFIG.outputDir, CONFIG.markdownFile);
    await fs.writeFile(markdownPath, markdown);
    log(`Saved: ${markdownPath}`, 'success');
    
    // Step 8: Generate JSON
    const jsonData = generateJson(updatedPages, orphanedUrls, summary);
    const jsonPath = path.join(CONFIG.outputDir, CONFIG.jsonFile);
    await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2));
    log(`Saved: ${jsonPath}`, 'success');
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION TRACKER GENERATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Total pages: ${summary.total}`);
    console.log(`   - Visible: ${summary.visible}`);
    console.log(`   - Hidden/Unlisted: ${summary.hidden}`);
    console.log(`   - In sitemap: ${summary.inSitemap}`);
    console.log(`   - Total redirects: ${summary.redirects}`);
    console.log(`   - Orphaned URLs: ${summary.orphaned}`);
    console.log(`\n📄 Output files:`);
    console.log(`   - ${CONFIG.markdownFile}`);
    console.log(`   - ${CONFIG.jsonFile}`);
    console.log('\n');
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

