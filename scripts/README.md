# Migration URL Scraper

This script extracts all pages from the current 4geeksacademy.com site and generates a comprehensive migration tracker for the Next.js migration to 4geeks.com.

## 🎯 Purpose

The migration scraper:
1. **Scans all YAML files** in the repository (pages, courses, locations, landings, jobs, downloadables, clusters)
2. **Fetches blog posts** from the Breathecode API
3. **Downloads sitemap.xml** to compare with internal pages
4. **Generates tracking files** for migration progress

## 📋 Output Files

### `migration-tracker.md`
Human-readable markdown file with:
- Summary statistics
- Tables organized by page type
- Status tracking columns (Copy, Implementation, Schema, PageSpeed)
- Redirect lists
- Hidden pages to review
- Orphaned URLs (in sitemap but not in YAML)

### `migration-data.json`
Machine-readable JSON file with:
- Complete page metadata
- SEO information (title, description, keywords)
- Current URLs and placeholders for new URLs
- Redirect mappings
- Status tracking fields

## 🚀 Usage

### Prerequisites

Make sure you have the required environment variables set in your `.env` file:

```bash
GATSBY_BREATHECODE_HOST=https://breathecode.herokuapp.com
GATSBY_BLOG_ACADEMY_TOKEN=your_token_here
GATSBY_BLOG_ACADEMY_ID=your_academy_id_here
```

### Run the Scraper

```bash
npm run migration:scrape
```

Or directly:

```bash
node scripts/migration-scraper.js
```

### Expected Output

```
============================================================
🚀 4GEEKS ACADEMY MIGRATION URL SCRAPER
============================================================

[HH:MM:SS] ℹ️ Scanning page...
[HH:MM:SS] ℹ️ Found 40 page files
[HH:MM:SS] ℹ️ Scanning course...
[HH:MM:SS] ℹ️ Found 10 course files
...
[HH:MM:SS] ✅ Total YAML pages scanned: 150
[HH:MM:SS] ℹ️ Fetching blog posts from Breathecode API...
[HH:MM:SS] ℹ️ Successfully fetched 500 blogposts from the API
[HH:MM:SS] ✅ Processed 500 blog posts
[HH:MM:SS] ℹ️ Fetching sitemap URLs...
[HH:MM:SS] ✅ Total URLs in sitemap: 650
[HH:MM:SS] ℹ️ Comparing pages with sitemap...
[HH:MM:SS] ✅ Pages in sitemap: 600 / 650
[HH:MM:SS] ✅ Saved: migration-tracker.md
[HH:MM:SS] ✅ Saved: migration-data.json

============================================================
✅ MIGRATION TRACKER GENERATED SUCCESSFULLY
============================================================

📊 Summary:
   Total pages: 650
   - Visible: 620
   - Hidden/Unlisted: 30
   - In sitemap: 600
   - Total redirects: 150
   - Orphaned URLs: 50

📄 Output files:
   - migration-tracker.md
   - migration-data.json
```

## 📊 Understanding the Output

### Priority Levels

- 🔥 **Critical**: Course pages with job guarantee, homepage
- ⭐ **High**: Visible pages, blog posts, locations
- 📌 **Medium**: Jobs, downloadables, some landings
- 📎 **Low**: Hidden pages, test pages

### Status Columns

In the markdown tracker, each page has status columns:

- **Copy**: ⬜ → 🔄 → ✅ (content migration)
- **Impl**: ⬜ → 🔄 → ✅ (Next.js implementation)
- **Schema**: ⬜ → 🔄 → ✅ (structured data)
- **Speed**: ⬜ → 🟡 → ✅ (PageSpeed score)

### In Sitemap Column

- ✅ = Page is in sitemap.xml (indexed by Google)
- ❌ = Page is NOT in sitemap (hidden, unlisted, or new)

## 🔧 Customization

### Modify URL Construction

Edit the `constructUrl()` function in `migration-scraper.js` to change how URLs are built for different page types.

### Add New Page Types

1. Add a new scanner function following the pattern of `scanYamlType()`
2. Call it in `scanAllYamlContent()`
3. Add the type to `typeLabels` and `typeOrder` in the markdown generator

### Change Output Format

Modify `generateMarkdown()` or `generateJson()` functions to customize the output format.

## 📝 Workflow

### 1. Initial Scan
```bash
npm run migration:scrape
```

### 2. Review Output
- Open `migration-tracker.md` in your editor
- Review hidden pages - decide which to migrate
- Review orphaned URLs - create redirect strategy
- Check for missing SEO metadata

### 3. Plan Migration
- Prioritize by traffic (check Google Analytics)
- Start with critical priority pages
- Define new URL structure in `migration-data.json`

### 4. Track Progress
You can track progress two ways:

#### Option A: Update Markdown Manually
Edit `migration-tracker.md` and change symbols:
- ⬜ → 🔄 → ✅

#### Option B: Update JSON Programmatically
Update status fields in `migration-data.json`:
```json
{
  "status": {
    "copy": "complete",
    "implementation": "in_progress",
    "schema": "not_started",
    "pagespeed": "not_started"
  }
}
```

Then regenerate the markdown from the JSON (you'll need to write a custom script for this).

### 5. Handle Redirects

For each page with redirects, create 301 redirects in your Next.js config:

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/part-time',
        destination: '/us/course/part-time-full-stack-developer',
        permanent: true,
      },
      // ... more redirects
    ]
  }
}
```

### 6. Validate

After migration:
- Run the scraper again on the NEW site
- Compare the new sitemap with the old
- Verify all important pages are accessible
- Check redirect chains

## 🐛 Troubleshooting

### "Error fetching blog posts"

**Cause**: Missing or invalid Breathecode API credentials

**Solution**: Check your `.env` file has:
```bash
GATSBY_BREATHECODE_HOST=https://breathecode.herokuapp.com
GATSBY_BLOG_ACADEMY_TOKEN=your_token_here
GATSBY_BLOG_ACADEMY_ID=your_academy_id_here
```

### "Error fetching sitemap"

**Cause**: Network timeout or sitemap not accessible

**Solution**: 
- Check if https://4geeksacademy.com/sitemap.xml is accessible
- The script will continue without sitemap data
- You can manually download and process the sitemap later

### "Error parsing YAML file"

**Cause**: Malformed YAML syntax in a data file

**Solution**: 
- Check the specific file mentioned in the error
- Fix YAML syntax errors
- The script will skip invalid files and continue

### Script runs but generates empty files

**Cause**: No YAML files found or incorrect working directory

**Solution**:
- Make sure you're running the script from the project root
- Check that `src/data/` directory exists
- Verify glob patterns are matching files

## 🔗 Related Files

- `src/utils/api.js` - Breathecode API utilities (reused by this script)
- `gatsby-node.js` - Current Gatsby page generation logic
- `src/data/additional-redirects.yml` - Extra redirect mappings

## 📚 Additional Resources

- [Next.js Redirects Documentation](https://nextjs.org/docs/api-reference/next.config.js/redirects)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## 🤝 Contributing

If you need to modify the scraper:

1. Test your changes with a subset of data first
2. Ensure backward compatibility with existing output formats
3. Update this README with any new features or changes
4. Consider adding new tracking fields to the JSON schema

## 📄 License

Internal tool for 4Geeks Academy migration project.

