// Buffer polyfill for browser compatibility
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = require("buffer/").Buffer;
}

import React, { useState, useRef, useEffect } from "react";
import Layout from "../global/Layout";
import { Container, Div, Header } from "../components/Sections";
import { Input } from "../components/Form";
import { Button, Colors, Link as StyledLink } from "../components/Styling";
import { Paragraph } from "../components/Heading";
import CallToAction from "../components/CallToAction";
import "../assets/css/single-post.css";
import matter from "gray-matter";
import { marked } from "marked";
import rehypeReact from "rehype-react";
import * as unified from "unified";
import rehypeParse from "rehype-parse";

const BlogPreview = () => {
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [processedHtml, setProcessedHtml] = useState("");
  const [rehypeAst, setRehypeAst] = useState(null);
  const [frontmatter, setFrontmatter] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef();

  // rehype-react compiler with custom components
  const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
      button: Button,
      "call-to-action": CallToAction,
      a: StyledLink,
    },
  }).Compiler;

  // Process Markdown when it changes
  useEffect(() => {
    if (!markdown.trim()) {
      setProcessedHtml("");
      setRehypeAst(null);
      setFrontmatter({});
      return;
    }
    setIsProcessing(true);
    try {
      console.log("Processing markdown:", markdown.substring(0, 200) + "...");

      // Clean up the markdown content first
      let cleanMarkdown = markdown.trim();

      // Try to parse frontmatter
      let parsed;
      let hasFrontmatter = false;

      try {
        parsed = matter(cleanMarkdown);
        hasFrontmatter = parsed.data && Object.keys(parsed.data).length > 0;
        console.log("Parsed frontmatter:", parsed.data);
        console.log(
          "Content after frontmatter removal:",
          parsed.content.substring(0, 200) + "..."
        );
      } catch (frontmatterError) {
        console.log(
          "Frontmatter parsing failed, treating as regular markdown:",
          frontmatterError.message
        );
        // If frontmatter parsing fails, treat the entire content as markdown
        parsed = { data: {}, content: cleanMarkdown };
        hasFrontmatter = false;
      }

      // If no frontmatter was detected but we see --- patterns, try manual extraction
      if (!hasFrontmatter && cleanMarkdown.includes("---")) {
        console.log(
          "No frontmatter detected but found --- markers, attempting manual extraction"
        );
        const lines = cleanMarkdown.split("\n");
        let frontmatterStart = -1;
        let frontmatterEnd = -1;

        // Find frontmatter boundaries
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === "---") {
            if (frontmatterStart === -1) {
              frontmatterStart = i;
            } else {
              frontmatterEnd = i;
              break;
            }
          }
        }

        // If we found valid frontmatter boundaries
        if (
          frontmatterStart !== -1 &&
          frontmatterEnd !== -1 &&
          frontmatterEnd > frontmatterStart
        ) {
          const frontmatterLines = lines.slice(
            frontmatterStart + 1,
            frontmatterEnd
          );
          const contentLines = lines.slice(frontmatterEnd + 1);

          // Try to parse the extracted frontmatter
          try {
            const extractedFrontmatter = matter(
              "---\n" + frontmatterLines.join("\n") + "\n---\n"
            );
            if (
              extractedFrontmatter.data &&
              Object.keys(extractedFrontmatter.data).length > 0
            ) {
              parsed.data = extractedFrontmatter.data;
              parsed.content = contentLines.join("\n");
              hasFrontmatter = true;
              console.log("Manually extracted frontmatter:", parsed.data);
              console.log(
                "Content after manual extraction:",
                parsed.content.substring(0, 200) + "..."
              );
            }
          } catch (extractError) {
            console.log(
              "Manual frontmatter extraction failed:",
              extractError.message
            );
          }
        }
      }

      setFrontmatter(parsed.data || {});

      // Convert Markdown to HTML using marked
      const html = marked(parsed.content, {
        breaks: true,
        gfm: true,
      });
      console.log("Generated HTML:", html.substring(0, 200) + "...");
      setProcessedHtml(html);

      // Convert HTML to AST using rehype-parse
      const processor = unified.unified().use(rehypeParse, { fragment: true });
      const ast = processor.parse(html);
      console.log("Generated AST:", ast);
      setRehypeAst(ast);

      setError("");
    } catch (err) {
      console.error("Markdown processing error:", err);
      setError("Error processing Markdown: " + err.message);
      setProcessedHtml("");
      setRehypeAst(null);
      setFrontmatter({});
    } finally {
      setIsProcessing(false);
    }
  }, [markdown]);

  // Handler for file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".md")) {
      setError("Por favor, sube un archivo .md válido.");
      setFileName("");
      setMarkdown("");
      return;
    }

    // Clear any previous state
    setError("");
    setMarkdown("");
    setProcessedHtml("");
    setRehypeAst(null);
    setFrontmatter({});

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        if (typeof content === "string") {
          console.log(
            "File content loaded:",
            content.substring(0, 200) + "..."
          );
          // Force a re-render by setting markdown after a small delay
          setTimeout(() => {
            setMarkdown(content);
          }, 10);
        } else {
          throw new Error("El contenido del archivo no es una cadena de texto");
        }
      } catch (err) {
        console.error("File reading error:", err);
        setError("Error leyendo el archivo: " + err.message);
      }
    };
    reader.onerror = () => {
      setError("Error leyendo el archivo. Por favor, inténtalo de nuevo.");
    };
    reader.readAsText(file, "UTF-8");
  };

  // Handler for textarea change
  const handleTextareaChange = (e) => {
    setMarkdown(e.target.value);
    setFileName("");
    setError("");
    // Clear the file input to allow re-uploading the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handler for clearing inputs
  const handleClear = () => {
    setMarkdown("");
    setFileName("");
    setError("");
    setProcessedHtml("");
    setRehypeAst(null);
    setFrontmatter({});
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Extract header info from frontmatter or use placeholders
  const headerTitle = frontmatter.title || "Vista previa del título";
  const headerExcerpt =
    frontmatter.excerpt || "Esta es una vista previa de tu contenido Markdown.";
  const headerImage =
    frontmatter.image ||
    "https://static.4geeks.com/assets/images/4geeks-main.jpg";
  const headerCluster = frontmatter.cluster || "Vista previa";

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
      }}
    >
      <Container maxWidth="900px" padding="40px 20px" margin="40px auto">
        <Div flexDirection="column" gap="24px" width="100%">
          <Paragraph
            fontSize="21px"
            fontWeight="700"
            textAlign="left"
            margin="0 0 12px 0"
          >
            Vista previa de publicación de blog en Markdown
          </Paragraph>
          <Paragraph
            fontSize="24px"
            color={Colors.gray}
            textAlign="left"
            margin="0 0 24px 0"
          >
            Sube un archivo .md o pega tu contenido Markdown abajo para ver una vista previa
          </Paragraph>

          <Div flexDirection="column" gap="12px" width="100%">
            <Paragraph fontSize="15px" textAlign="left" margin="0 0 4px 0">
              Subir archivo Markdown
            </Paragraph>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileChange}
              style={{ width: "100%", margin: "8px 0" }}
            />
            {fileName && (
              <Paragraph
                fontSize="14px"
                color={Colors.gray}
                textAlign="left"
                margin="4px 0 0 0"
              >
                Archivo seleccionado: {fileName}
              </Paragraph>
            )}
          </Div>

          <Paragraph fontSize="15px" textAlign="left" margin="24px 0 4px 0">
            O pega Markdown abajo
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
            placeholder="Pega o escribe Markdown aquí..."
          />

          <Div flexDirection="row" gap="12px" margin="8px 0 0 0">
            <Button
              onClick={handleClear}
              background={Colors.lightGray}
              color={Colors.darkGray}
            >
              Limpiar
            </Button>
          </Div>

          {isProcessing && (
            <Paragraph
              fontSize="14px"
              color={Colors.blue}
              textAlign="left"
              margin="12px 0 0 0"
            >
              Procesando Markdown...
            </Paragraph>
          )}

          {error && (
            <Paragraph
              fontSize="14px"
              color={Colors.red}
              textAlign="left"
              margin="12px 0 0 0"
            >
              {error.replace('Please upload a valid .md file.', 'Por favor, sube un archivo .md válido.').replace('Error processing Markdown:', 'Error procesando Markdown:').replace('Error reading file:', 'Error leyendo el archivo:').replace('File content is not a string', 'El contenido del archivo no es una cadena de texto').replace('Error reading file. Please try again.', 'Error leyendo el archivo. Por favor, inténtalo de nuevo.')}
            </Paragraph>
          )}

          {/* Debug info */}
          {frontmatter && Object.keys(frontmatter).length > 0 && (
            <Div
              flexDirection="column"
              gap="8px"
              width="100%"
              margin="16px 0 0 0"
              padding="16px"
              background={Colors.verylightGray}
              borderRadius="4px"
            >
              <Paragraph
                fontSize="14px"
                fontWeight="600"
                textAlign="left"
                margin="0 0 8px 0"
              >
                Frontmatter detectado:
              </Paragraph>
              <pre
                style={{ fontSize: "12px", margin: 0, whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(frontmatter, null, 2)}
              </pre>
            </Div>
          )}
          <Paragraph fontSize="15px" textAlign="left" margin="24px 0 4px 0">
          Nota: si has pegado Markdown, el título puede no ser visible ya que éste viene del frontmatter
          </Paragraph>
          {/* Preview section - styled like landing_post.js */}
          {rehypeAst && (
            <Div
              gap="6%"
              width="100%"
              margin="32px 0 0 0"
              style={{ background: Colors.white, borderRadius: 8 }}
            >
              <Div
                size="12"
                size_tablet="8"
                flexDirection="column"
                margin="30px 0 0 0"
                background={Colors.white}
              >
                <Header
                  hideArrowKey
                  padding="90px 17px 70px 17px"
                  paddingParagraph="0"
                  paddingTitle="0"
                  textAlign_tablet="left"
                  seo_title={headerCluster}
                  title={headerTitle}
                  paragraph={headerExcerpt}
                  display_mobile="flex"
                  svg_image={
                    <img
                      alt="Preview"
                      style={{
                        border: 0,
                        width: "100%",
                        height: "320px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      src={headerImage}
                    />
                  }
                  background={Colors.lightYellow}
                />
                <Div
                  className="single-post"
                  flexDirection="Column"
                  margin="32px 0 0 0"
                >
                  {renderAst(rehypeAst)}
                </Div>
              </Div>
            </Div>
          )}
        </Div>
      </Container>
    </Layout>
  );
};
export default BlogPreview;
