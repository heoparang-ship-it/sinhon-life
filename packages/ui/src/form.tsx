import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import { colors, controlBaseStyle, mergeStyles, typography } from "./tokens";

type FieldShellProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  id: string;
  label?: string;
  required?: boolean;
  style?: CSSProperties;
};

function FieldShell({ children, description, error, id, label, required, style }: FieldShellProps) {
  return (
    <div style={mergeStyles({ display: "grid", gap: 8, minWidth: 0 }, style)}>
      {label ? (
        <label htmlFor={id} style={{ ...typography.label, color: colors.text }}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {description ? (
        <p
          id={`${id}-description`}
          style={{ color: colors.muted, ...typography.caption, margin: 0 }}
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ color: colors.danger, ...typography.caption, margin: 0 }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  description?: string;
  error?: string;
  label?: string;
};

export function Input({ description, error, id, label, required, style, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <input
        aria-describedby={[
          description ? `${inputId}-description` : undefined,
          error ? `${inputId}-error` : undefined
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        id={inputId}
        required={required}
        style={mergeStyles(
          controlBaseStyle,
          {
            background: colors.panel,
            padding: "0 12px",
            width: "100%"
          },
          error ? { borderColor: colors.danger } : undefined,
          style
        )}
        {...props}
      />
    </FieldShell>
  );
}

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  description?: string;
  error?: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  description,
  error,
  id,
  label,
  options,
  placeholder,
  required,
  style,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell
      description={description}
      error={error}
      id={selectId}
      label={label}
      required={required}
    >
      <select
        aria-describedby={[
          description ? `${selectId}-description` : undefined,
          error ? `${selectId}-error` : undefined
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error) || undefined}
        id={selectId}
        required={required}
        style={mergeStyles(
          controlBaseStyle,
          {
            background: colors.panel,
            padding: "0 12px",
            width: "100%"
          },
          error ? { borderColor: colors.danger } : undefined,
          style
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  error?: string;
  label: string;
};

export function Checkbox({ description, error, id, label, style, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div style={mergeStyles({ display: "grid", gap: 6 }, style)}>
      <label
        htmlFor={checkboxId}
        style={{
          alignItems: "flex-start",
          cursor: props.disabled ? "not-allowed" : "pointer",
          display: "flex",
          gap: 10,
          minHeight: 44,
          opacity: props.disabled ? 0.58 : 1,
          padding: "8px 0"
        }}
      >
        <input
          aria-describedby={[
            description ? `${checkboxId}-description` : undefined,
            error ? `${checkboxId}-error` : undefined
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={Boolean(error) || undefined}
          id={checkboxId}
          style={{ height: 18, marginTop: 2, width: 18 }}
          type="checkbox"
          {...props}
        />
        <span>
          <span style={{ ...typography.label, display: "block" }}>{label}</span>
          {description ? (
            <span
              id={`${checkboxId}-description`}
              style={{ color: colors.muted, ...typography.caption }}
            >
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p
          id={`${checkboxId}-error`}
          role="alert"
          style={{ color: colors.danger, ...typography.caption, margin: 0 }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type RadioOption = {
  description?: string;
  disabled?: boolean;
  label: string;
  value: string;
};

export type RadioProps = {
  description?: string;
  error?: string;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  required?: boolean;
  value?: string;
};

export function Radio({
  description,
  error,
  label,
  name,
  onChange,
  options,
  required,
  value
}: RadioProps) {
  const groupId = useId();

  return (
    <fieldset
      aria-describedby={[
        description ? `${groupId}-description` : undefined,
        error ? `${groupId}-error` : undefined
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ border: 0, margin: 0, padding: 0 }}
    >
      <legend style={{ ...typography.label, marginBottom: 8 }}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </legend>
      {description ? (
        <p
          id={`${groupId}-description`}
          style={{ color: colors.muted, ...typography.caption, margin: "0 0 8px" }}
        >
          {description}
        </p>
      ) : null}
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              alignItems: "flex-start",
              background: value === option.value ? colors.accentSoft : colors.panel,
              border: `1px solid ${value === option.value ? colors.accent : colors.border}`,
              borderRadius: 8,
              cursor: option.disabled ? "not-allowed" : "pointer",
              display: "flex",
              gap: 10,
              minHeight: 44,
              opacity: option.disabled ? 0.58 : 1,
              padding: 12
            }}
          >
            <input
              checked={value === option.value}
              disabled={option.disabled}
              name={name}
              onChange={() => onChange?.(option.value)}
              required={required}
              style={{ height: 18, marginTop: 2, width: 18 }}
              type="radio"
              value={option.value}
            />
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>
                {option.label}
              </span>
              {option.description ? (
                <span style={{ color: colors.muted, ...typography.caption }}>
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p
          id={`${groupId}-error`}
          role="alert"
          style={{ color: colors.danger, ...typography.caption, margin: "8px 0 0" }}
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export type DatePickerProps = Omit<InputProps, "type">;

export function DatePicker(props: DatePickerProps) {
  return <Input {...props} type="date" />;
}
