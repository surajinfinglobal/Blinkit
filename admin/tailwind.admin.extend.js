// tailwind.config.js me merge karo:
//
//   import adminExtend from './src/admin/tailwind.admin.extend.js'
//   export default { content: [...], theme: { extend: { ...adminExtend } } }
//
// (CommonJS config ho to `export default` ko `module.exports =` kar do)
export default {
  colors: {
    "on-secondary": "#ffffff", "surface-variant": "#e2e3e1", "on-primary-fixed": "#241a00",
    "on-secondary-fixed-variant": "#47464a", "inverse-on-surface": "#f1f1ef", "on-tertiary-container": "#00672d",
    "surface-container-low": "#f4f4f2", "on-primary": "#ffffff", "surface-bright": "#f9f9f7",
    "on-error-container": "#93000a", "secondary-fixed": "#e4e1e5", "inverse-surface": "#2f3130",
    "on-error": "#ffffff", "surface-container": "#eeeeec", "on-tertiary-fixed": "#00210a",
    "surface-dim": "#dadad8", error: "#ba1a1a", "surface-tint": "#755b00", "on-primary-container": "#6e5600",
    background: "#f9f9f7", "surface-container-high": "#e8e8e6",
    "outline-variant": "#d1c5ae", // original me '#' missing tha (bug)
    surface: "#f9f9f7", "error-container": "#ffdad6", outline: "#7f7662", "secondary-container": "#e4e1e5",
    "tertiary-fixed-dim": "#79db8d", "primary-fixed-dim": "#edc13d", "on-background": "#1a1c1b",
    "tertiary-container": "#83e596", "on-surface": "#1a1c1b", "on-tertiary": "#ffffff", secondary: "#5f5e61",
    "on-secondary-container": "#656467", "on-surface-variant": "#4e4634", "on-secondary-fixed": "#1b1b1e",
    "inverse-primary": "#edc13d", "tertiary-fixed": "#95f8a7", "on-primary-fixed-variant": "#584400",
    tertiary: "#006d30", "on-tertiary-fixed-variant": "#005323", "surface-container-lowest": "#ffffff",
    "primary-fixed": "#ffe08f", primary: "#755b00", "primary-container": "#f8cb46",
    "secondary-fixed-dim": "#c8c6c9", "surface-container-highest": "#e2e3e1",
  },
  borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
  spacing: {
    "space-lg": "1.5rem", "margin-mobile": "1rem", "space-md": "1rem", "space-sm": "0.5rem",
    margin: "2rem", "space-xs": "0.25rem", "gutter-mobile": "0.75rem", gutter: "1rem", "space-xl": "2.5rem",
  },
  fontFamily: Object.fromEntries(
    ["headline-sm","body-lg","label-md","headline-lg","headline-md","headline-xl","body-md","body-sm",
     "headline-xl-mobile","headline-lg-mobile","label-lg","label-sm"].map((k) => [k, ["Plus Jakarta Sans", "sans-serif"]])
  ),
  fontSize: {
    "headline-sm": ["17px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "600" }],
    "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
    "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "600" }],
    "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
    "headline-md": ["20px", { lineHeight: "26px", letterSpacing: "-0.015em", fontWeight: "700" }],
    "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.03em", fontWeight: "800" }],
    "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
    "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
    "headline-xl-mobile": ["30px", { lineHeight: "36px", letterSpacing: "-0.025em", fontWeight: "800" }],
    "headline-lg-mobile": ["24px", { lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: "700" }],
    "label-lg": ["15px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "700" }],
    "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "700" }],
  },
};
