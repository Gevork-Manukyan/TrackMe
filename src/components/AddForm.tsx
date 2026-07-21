"use client";

import { useRef } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  placeholder: string;
  submitLabel: string;
};

/** One inline add field, used for both lists and places. */
export function AddForm({ action, placeholder, submitLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex items-center gap-2 rounded-xl border border-rule bg-card p-2"
    >
      <input
        name="name"
        required
        maxLength={120}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-ink placeholder:text-slate/70 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-stamp px-3 py-2 text-sm font-medium text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
