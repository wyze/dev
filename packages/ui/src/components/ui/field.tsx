import { Field as BaseField } from '@base-ui-components/react/field'
import type * as React from 'react'

function Field(props: React.ComponentProps<typeof BaseField.Root>) {
  return <BaseField.Root data-slot="field" {...props} />
}

function FieldControl(props: React.ComponentProps<typeof BaseField.Control>) {
  return <BaseField.Control data-slot="field-control" {...props} />
}

function FieldDescription(
  props: React.ComponentProps<typeof BaseField.Description>,
) {
  return <BaseField.Description data-slot="field-description" {...props} />
}

function FieldError(props: React.ComponentProps<typeof BaseField.Error>) {
  return <BaseField.Error data-slot="field-error" {...props} />
}

function FieldLabel(props: React.ComponentProps<typeof BaseField.Label>) {
  return <BaseField.Label data-slot="field-label" {...props} />
}

function FieldValidity(props: React.ComponentProps<typeof BaseField.Validity>) {
  return <BaseField.Validity data-slot="field-validity" {...props} />
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldValidity,
}
