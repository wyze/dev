import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import { Input } from '@wyze/ui/input'
import { Label } from '@wyze/ui/label'
import * as React from 'react'
import { Link } from 'react-router'

import { useAuthAction } from '../hooks/use-auth-action'

export function PasswordInput({
  label = 'Password',
  name = label.toLowerCase(),
}: {
  label?: string
  name?: string
}) {
  const id = React.useId()
  const [type, setType] = React.useState<'password' | 'text'>('password')
  const { segment } = useAuthAction()

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {segment === 'sign-in' ? (
          <Link
            className="text-sm underline-offset-4 hover:underline"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        ) : null}
      </div>
      <Input
        id={id}
        name={name}
        placeholder="••••••••••••"
        trailingIcon={
          <Button
            className="size-6 p-0.5 text-muted-foreground"
            onClick={() =>
              setType((state) => (state === 'text' ? 'password' : 'text'))
            }
            render={<Icon name={type === 'text' ? 'eye-off' : 'eye'} />}
            variant="ghost"
          />
        }
        type={type}
        required
      />
    </div>
  )
}
