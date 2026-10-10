import { getForm, getSettings } from '@/lib/content/store';
import type { FormKey } from '@/lib/forms/definitions';
import { formRenderToken } from '@/lib/security';
import { DynamicForm } from './DynamicForm';

/** Server wrapper: loads the editable form definition and issues an anti-spam render token. */
export function SiteForm({ formKey, context, initialValues, headingLevel, compact, submitLabel }: {
  formKey: FormKey;
  context?: { webinarId?: string; resourceId?: string };
  initialValues?: Record<string, string>;
  headingLevel?: 'h2' | 'h3';
  compact?: boolean;
  submitLabel?: string;
}) {
  const def = getForm(formKey);
  const s = getSettings();
  const fields = def.fields.filter((f) => f.enabled).map(({ sheetColumn: _s, inferred: _i, ...f }) => f); // don't ship internal mapping to the browser
  return (
    <DynamicForm
      formKey={formKey}
      fields={fields}
      submitLabel={submitLabel ?? def.submitLabel}
      privacyLabel={def.privacyLabel}
      marketingLabel={def.marketingConsent ? (def.brand === 'tenderiq' ? s.tenderiqConsentWording : s.marketingConsentWording) : null}
      renderToken={formRenderToken(formKey)}
      context={context}
      initialValues={initialValues}
      headingLevel={headingLevel}
      compact={compact}
    />
  );
}
