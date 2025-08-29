# SafeReCAPTCHA Component

## 🎯 Purpose

**Prevents the app from breaking when `GATSBY_CAPTCHA_KEY` is missing or invalid.**

This component ensures new developers can work on the project without getting blocked by ReCAPTCHA configuration errors.

## 🚨 Problem it solves

- App crashes when `GATSBY_CAPTCHA_KEY` is not set
- New developers get confused by cryptic ReCAPTCHA errors
- Development workflow gets interrupted
- Time wasted debugging environment setup

## 🔧 How it works

```jsx
// Instead of this (breaks without key):
<ReCAPTCHA sitekey={process.env.GATSBY_CAPTCHA_KEY} />

// Use this (safe):
<SafeReCAPTCHA size="invisible" onChange={handleChange} />
```

**Behavior:**
- 🔑 **Has key**: Renders ReCAPTCHA normally
- 🚫 **No key**: Renders nothing, shows console warning

> **Note:** If you see "GATSBY_CAPTCHA_KEY is not defined" in console warnings, that's normal for local development. The app will work fine!

## 📦 Usage

```jsx
import SafeReCAPTCHA from '../ReCAPTCHA';

const MyForm = () => {
  const captchaRef = useRef(null);
  
  return (
    <SafeReCAPTCHA
      ref={captchaRef}
      size="invisible"
      onChange={(value) => console.log('Captcha:', value)}
    />
  );
};
```
