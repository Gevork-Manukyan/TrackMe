"use client";

import { useRef } from "react";

type Props = {
  onAdd: (name: string) => Promise<void> | void;
  placeholder: string;
  submitLabel: string;
};

/** One inline add field, used for both lists and places. */
export function AddForm({ onAdd, placeholder, submitLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      onSubmit={async (event) => {
        event.preventDefault();
        const input = formRef.current?.elements.namedItem(
          "name",
        ) as HTMLInputElement | null;
        const name = input?.value ?? "";
        if (!name.trim()) return;
        // Clear immediately: the write is local, so there is nothing to wait for.
        formRef.current?.reset();
        await onAdd(name);
      }}
      className="field-wrap flex items-center gap-2 rounded-xl border border-rule bg-card p-2"
    >
      <input
        name="name"
        required
        maxLength={120}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ring-on-wrapper min-w-0 flex-1 bg-transparent px-2 py-2 text-ink placeholder:text-slate/70"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-ground"
      >
        {submitLabel}
      </button>
    </form>
  );
}
