import React, { useState, useRef, useEffect } from "react";
import Layout from "../global/Layout";
import { Container, Div } from "../components/Sections";
import { Input } from "../components/Form";
import { Button, Colors } from "../components/Styling";
import { Paragraph } from "../components/Heading";
import "../assets/css/single-post.css";
import matter from "gray-matter";
import { marked } from "marked";
import rehypeReact from "rehype-react";

const BlogPreview = () => {
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [processedHtml, setProcessedHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef();

  // Process Markdown when it changes
  useEffect(() => {
    if (!markdown.trim()) {
      setProcessedHtml("");
      return;
    }

    setIsProcessing(true);
    try {
      // Strip frontmatter using gray-matter
      const { content } = matter(markdown);
      
      // Convert Markdown to HTML using marked
      const html = marked(content, {
        breaks: true,
        gfm: true,
      });
      
      setProcessedHtml(html);
      setError("");
    } catch (err) {
      setError("Error processing Markdown: " + err.message);
      setProcessedHtml("");
    } finally {
      setIsProcessing(false);
    }
  }, [markdown]);

  // Handler for file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".md")) {
      setError("Please upload a valid .md file.");
      setFileName("");
      setMarkdown("");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMarkdown(event.target.result);
    };
    reader.readAsText(file);
  };

  // Handler for textarea change
  const handleTextareaChange = (e) => {
    setMarkdown(e.target.value);
    setFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handler for clearing inputs
  const handleClear = () => {
    setMarkdown("");
    setFileName("");
    setError("");
    setProcessedHtml("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout 
    seo={{
      slug: "blog-preview",
      title: "Blog Preview Page - 4Geeks Academy",
      description: "Article Preview 4Geeks Academy",
      image: "",
      keywords: [],
    }}
    context={{
      lang: "us",
    }}>
      <Container maxWidth="700px" padding="40px 20px" margin="40px auto">
        <Div flexDirection="column" gap="24px" width="100%">
          <Paragraph fontSize="21px" fontWeight="700" textAlign="left" margin="0 0 12px 0">
            Blog Post Markdown Preview
          </Paragraph>
          <Paragraph fontSize="16px" color={Colors.gray} textAlign="left" margin="0 0 24px 0">
            Upload a <b>.md</b> file or paste your Markdown content below to preview how it will look.
          </Paragraph>

          <Div flexDirection="column" gap="12px" width="100%">
            <Paragraph fontSize="15px" textAlign="left" margin="0 0 4px 0">
              Upload Markdown file
            </Paragraph>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileChange}
              style={{ width: "100%" }}
            />
            {fileName && (
              <Paragraph fontSize="14px" color={Colors.gray} textAlign="left" margin="4px 0 0 0">
                Selected file: {fileName}
              </Paragraph>
            )}
          </Div>

          <Paragraph fontSize="15px" textAlign="left" margin="24px 0 4px 0">
            Or paste Markdown below
          </Paragraph>
          <textarea
            value={markdown}
            onChange={handleTextareaChange}
            rows={12}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "15px",
              border: `1px solid ${Colors.lightGray}`,
              borderRadius: "3px",
              padding: "10px",
              marginBottom: "8px",
              resize: "vertical",
            }}
            placeholder="Paste or type Markdown here..."
          />

          <Div flexDirection="row" gap="12px" margin="8px 0 0 0">
            <Button onClick={handleClear} background={Colors.lightGray} color={Colors.darkGray}>
              Clear
            </Button>
          </Div>

          {isProcessing && (
            <Paragraph fontSize="14px" color={Colors.blue} textAlign="left" margin="12px 0 0 0">
              Processing Markdown...
            </Paragraph>
          )}

          {error && (
            <Paragraph fontSize="14px" color={Colors.red} textAlign="left" margin="12px 0 0 0">
              {error}
            </Paragraph>
          )}

          {/* Preview section - will be implemented in Step 4 */}
          {processedHtml && (
            <Div 
              flexDirection="column" 
              gap="16px" 
              width="100%" 
              margin="32px 0 0 0"
              padding="24px"
              background={Colors.verylightGray}
              borderRadius="8px"
            >
              <Paragraph fontSize="18px" fontWeight="600" textAlign="left" margin="0 0 16px 0">
                Preview (HTML Output)
              </Paragraph>
              <div 
                dangerouslySetInnerHTML={{ __html: processedHtml }}
                style={{
                  fontFamily: "Lato, sans-serif",
                  lineHeight: "1.6",
                }}
              />
            </Div>
          )}
        </Div>
      </Container>
    </Layout>
  );
};
export default BlogPreview;
