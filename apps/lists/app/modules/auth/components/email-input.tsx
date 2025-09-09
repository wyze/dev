import { Input } from '@wyze/ui/input'
import { Label } from '@wyze/ui/label'
import * as React from 'react'

export function EmailInput() {
  const id = React.useId()

  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>Email</Label>
      <Input
        id={id}
        name="email"
        placeholder="me@example.com"
        required
        type="email"
      />
    </div>
  )
}
