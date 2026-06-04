import * as React from "react";

const inputStyles = {
  base: `
    display: flex;
    height: 2.5rem;
    width: 100%;
    border-radius: calc(var(--radius) - 2px);
    border: 1px solid hsl(var(--border));
    background-color: hsl(var(--background));
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    color: hsl(var(--foreground));
    outline: none;
    transition: box-shadow 0.2s;
  `
};

const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .custom-input {
    display: flex;
    height: 2.5rem;
    width: 100%;
    border-radius: calc(var(--radius) - 2px);
    border: 1px solid hsl(var(--border));
    background-color: hsl(var(--background));
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    color: hsl(var(--foreground));
    outline: none;
    transition: box-shadow 0.2s;
  }

  .custom-input::placeholder {
    color: hsl(var(--muted-foreground));
  }

  .custom-input:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--background)),
                0 0 0 4px hsl(var(--ring));
  }

  .custom-input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .custom-input::file-selector-button {
    border: 0;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
  }
`;

if (!document.querySelector("#custom-input-styles")) {
  styleTag.id = "custom-input-styles";
  document.head.appendChild(styleTag);
}

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={`custom-input ${className || ""}`}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };