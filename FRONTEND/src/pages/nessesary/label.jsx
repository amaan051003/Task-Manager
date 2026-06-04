import React, { useEffect } from "react";

const Label = React.forwardRef(({ className = "", ...props }, ref) => {

  useEffect(() => {
    if (!document.querySelector("#custom-label-styles")) {
      const styleTag = document.createElement("style");
      styleTag.id = "custom-label-styles";

      styleTag.innerHTML = `
        .custom-label {
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1;
          color: hsl(var(--foreground));
        }

        input:disabled ~ .custom-label,
        .custom-label:has(~ input:disabled) {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `;

      document.head.appendChild(styleTag);
    }
  }, []);

  return (
    <label
      ref={ref}
      className={`custom-label ${className}`}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };