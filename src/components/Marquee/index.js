import React from "react";
import styled, { keyframes } from "styled-components";

const Marquee = (props) => {
  const { images, duration = 50, gap = "2rem" } = props.config;

  const track = keyframes`
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-50%);
        }
    `;

  const Container = styled.div`
    width: 100vw;
    height: 12vh;
    overflow: hidden;
    position: relative;
  `;

  const UL = styled.ul`
    display: flex;
    width: fit-content;
    padding: 0;
    margin: 0;
    list-style-type: none;
    height: 100%;
    align-items: center;

    animation: ${track} var(--duration, ${duration}s) linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  `;

  const LI = styled.li`
    height: 80%;
    aspect-ratio: 4 / 3;
    display: grid;
    place-items: center;
    margin: 0 var(--gap, ${gap});

    img,
    svg {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `;

  return (
    <Container
      style={{
        "--duration": `${duration}s`,
        "--gap": gap,
      }}
    >
      <UL>
        {images.map((image, i) => (
          <LI key={`a-${i}`}>{image}</LI>
        ))}
        {images.map((image, i) => (
          <LI key={`b-${i}`}>{image}</LI>
        ))}
      </UL>
    </Container>
  );
};

export default Marquee;
