import { useId, useState, type ReactNode } from "react";
import { colors, radii, typography } from "./tokens";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  label: string;
  value: string;
};

export type TabsProps = {
  defaultValue?: string;
  items: TabItem[];
  label?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

export function Tabs({ defaultValue, items, label, onValueChange, value }: TabsProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const selectedValue = value ?? internalValue;
  const selectedItem = items.find((item) => item.value === selectedValue) ?? items[0];

  return (
    <div>
      <div
        aria-label={label}
        role="tablist"
        style={{
          background: colors.mutedSoft,
          borderRadius: radii.panel,
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: 4
        }}
      >
        {items.map((item) => {
          const isSelected = item.value === selectedItem?.value;

          return (
            <button
              aria-controls={`${generatedId}-${item.value}-panel`}
              aria-selected={isSelected}
              disabled={item.disabled}
              id={`${generatedId}-${item.value}-tab`}
              key={item.value}
              onClick={() => {
                setInternalValue(item.value);
                onValueChange?.(item.value);
              }}
              role="tab"
              style={{
                background: isSelected ? colors.panel : "transparent",
                border: 0,
                borderRadius: 6,
                color: item.disabled ? colors.muted : colors.text,
                cursor: item.disabled ? "not-allowed" : "pointer",
                flex: "1 1 140px",
                font: "inherit",
                fontSize: 14,
                fontWeight: 800,
                minHeight: 44,
                opacity: item.disabled ? 0.55 : 1,
                outlineOffset: 3,
                padding: "0 12px",
                textAlign: "center"
              }}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {selectedItem ? (
        <div
          aria-labelledby={`${generatedId}-${selectedItem.value}-tab`}
          id={`${generatedId}-${selectedItem.value}-panel`}
          role="tabpanel"
          style={{ ...typography.body, paddingTop: 16 }}
        >
          {selectedItem.content}
        </div>
      ) : null}
    </div>
  );
}
